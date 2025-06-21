import multer, { FileFilterCallback } from 'multer';
import path from 'path';

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('application/pdf') || 
        file.mimetype.startsWith('application/msword') || 
        file.mimetype.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// Create upload instance
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

export default upload;
