import { AppDataSource } from '../db/db';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
    try {
        const userRepo = AppDataSource.getRepository(User);
        const existingUser = await userRepo.findOne({ where: { email: 'alice.admin@example.com' } });

        if (existingUser) {
            console.log('Admin user already exists');
            return;
        }

        const hashedPassword = await bcrypt.hash('Secure@321', 10);

        const adminUser = userRepo.create({
            email: 'alice.admin@example.com',
            password: hashedPassword,
            FirstName: 'Alice',
            LastName: 'Admin',
            type: 'admin',
            status: 'active'
        });

        await userRepo.save(adminUser);
        console.log('Admin user created successfully');
    } catch (error) {
        console.error('Error seeding admin user:', error);
    }
}

seedAdmin();
