const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const { DataSource } = require('typeorm');
const { UserTable, MissionTable, LeaveTable } = require('./src/models');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer setup for file uploads
const upload = require('./src/middleware/multer');

// Initialize database
const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: false,
    entities: [
        UserTable, MissionTable, LeaveTable
    ]
});

AppDataSource.initialize()
    .then(() => {
        console.log("Database initialized");
    })
    .catch((err) => {
        console.error("Error initializing database", err);
    });

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) return res.sendStatus(403);
        
        try {
            const user = await AppDataSource.getRepository(UserTable).findOne({
                where: { userId: decoded.id }
            });
            
            if (!user) return res.sendStatus(401);
            req.user = user;
            next();
        } catch (error) {
            return res.sendStatus(401);
        }
    });
};

// Login endpoint
app.post('/user/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await AppDataSource.getRepository(UserTable).findOne({
            where: { email },
            select: ['userId', 'email', 'password', 'role', 'name']
        });

        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({
            id: user.userId,
            email: user.email,
            role: user.role,
            name: user.name
        }, JWT_SECRET);

        res.json({
            token,
            user: {
                id: user.userId,
                email: user.email,
                role: user.role,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Mission endpoints
app.get('/mission/mission-requests', authenticateToken, async (req, res) => {
    try {
        const missions = await AppDataSource.getRepository(MissionTable).find({
            relations: ['user']
        });
        res.json(missions);
    } catch (error) {
        console.error('Error fetching missions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/mission/mission-request/:id', authenticateToken, async (req, res) => {
    try {
        const mission = await AppDataSource.getRepository(MissionTable).findOne({
            where: { id: req.params.id },
            relations: ['user']
        });
        if (!mission) return res.status(404).json({ message: 'Mission not found' });
        res.json(mission);
    } catch (error) {
        console.error('Error fetching mission:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/mission/mission-request', authenticateToken, upload.single('invitationLetter'), async (req, res) => {
    try {
        // Required fields validation
        const requiredFields = ['type', 'startDate', 'endDate', 'purpose'];
        const missingFields = requiredFields.filter(field => !req.fields[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: 'Missing required fields', 
                fields: missingFields 
            });
        }

        // Validate date range
        const startDate = new Date(req.fields.startDate);
        const endDate = new Date(req.fields.endDate);
        
        if (endDate < startDate) {
            return res.status(400).json({ 
                message: 'End date must be after start date' 
            });
        }

        // Create mission object with proper field mapping
        const mission = AppDataSource.getRepository(MissionTable).create({
            type: req.fields.type,
            district: req.fields.type === 'local' ? req.fields.district : null,
            destination: req.fields.type === 'international' ? req.fields.destination : null,
            startDate: new Date(req.fields.startDate),
            endDate: new Date(req.fields.endDate),
            purpose: req.fields.purpose,
            status: 'pending',
            createdAt: new Date(),
            createdBy: req.user.name,
            user: req.user,
            file: req.file ? req.file.path : null
        });

        await AppDataSource.getRepository(MissionTable).save(mission);
        res.status(201).json(mission);
    } catch (error) {
        console.error('Error creating mission:', error);
        res.status(500).json({ 
            message: 'Internal server error', 
            error: error.message 
        });
    }
});

app.patch('/mission/mission-request/:id/status', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });

    try {
        const mission = await AppDataSource.getRepository(MissionTable).findOne({
            where: { id: req.params.id },
            relations: ['user']
        });

        if (!mission) return res.status(404).json({ message: 'Mission not found' });

        mission.status = req.body.status;
        mission.comment = req.body.comment;
        mission.updatedAt = new Date();
        mission.updatedBy = req.user.name;

        await AppDataSource.getRepository(MissionTable).save(mission);
        res.json(mission);
    } catch (error) {
        console.error('Error updating mission status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Leave endpoints
app.get('/leave/leave-requests', authenticateToken, async (req, res) => {
    try {
        const leaves = await AppDataSource.getRepository(LeaveTable).find({
            relations: ['user']
        });
        res.json(leaves);
    } catch (error) {
        console.error('Error fetching leaves:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/leave/leave-request/:id', authenticateToken, async (req, res) => {
    try {
        const leave = await AppDataSource.getRepository(LeaveTable).findOne({
            where: { id: req.params.id },
            relations: ['user']
        });
        if (!leave) return res.status(404).json({ message: 'Leave not found' });
        res.json(leave);
    } catch (error) {
        console.error('Error fetching leave:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/leave/leave-request', authenticateToken, upload.single('documentFile'), async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = ['type', 'startDate', 'endDate', 'reason'];
        const missingFields = requiredFields.filter(field => !req.fields[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                errors: missingFields.reduce((acc, field) => ({
                    ...acc,
                    [field]: `${field} is required`
                }), {})
            });
        }

        // Validate dates
        const startDate = new Date(req.fields.startDate);
        const endDate = new Date(req.fields.endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate < today) {
            return res.status(400).json({
                message: 'Invalid date',
                errors: { startDate: 'Start date cannot be in the past' }
            });
        }

        if (endDate < startDate) {
            return res.status(400).json({
                message: 'Invalid date',
                errors: { endDate: 'End date must be after start date' }
            });
        }

        // Validate file size (10MB limit)
        if (req.file && req.file.size > 10 * 1024 * 1024) {
            return res.status(400).json({
                message: 'Invalid file',
                errors: { documentFile: 'File size must be less than 10MB' }
            });
        }

        const leave = AppDataSource.getRepository(LeaveTable).create({
            type: req.fields.type,
            startDate: req.fields.startDate,
            endDate: req.fields.endDate,
            reason: req.fields.reason,
            otherType: req.fields.type === 'other' ? req.fields.otherType : null,
            status: 'pending',
            createdAt: new Date(),
            createdBy: req.user.name,
            user: req.user,
            file: req.file ? req.file.path : null
        });

        await AppDataSource.getRepository(LeaveTable).save(leave);
        res.status(201).json(leave);
    } catch (error) {
        console.error('Error creating leave:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message
        });
    }
});

app.patch('/leave/leave-request/:id/status', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });

    try {
        const leave = await AppDataSource.getRepository(LeaveTable).findOne({
            where: { id: req.params.id },
            relations: ['user']
        });

        if (!leave) return res.status(404).json({ message: 'Leave not found' });

        leave.status = req.body.status;
        leave.comment = req.body.comment;
        leave.updatedAt = new Date();
        leave.updatedBy = req.user.name;

        await AppDataSource.getRepository(LeaveTable).save(leave);
        res.json(leave);
    } catch (error) {
        console.error('Error updating leave status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
