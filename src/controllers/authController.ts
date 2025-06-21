import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../db/db";
import { User } from "../models/User";

const generateToken = (user: User) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
    );
};

// ✅ Register with Email + Password
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        const userRepo = AppDataSource.getRepository(User);
        const existingUser = await userRepo.findOne({ where: { email } });

        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = userRepo.create({
            email,
            password: hashedPassword,
            FirstName: firstName,
            LastName: lastName
        });

        await userRepo.save(user);
        const token = generateToken(user);

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName,
                lastName
            }
        });
    } catch (err) {
        console.error("Register Error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// ✅ Login with Email + Password
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        if (!user.password) {
            return res.status(401).json({ message: "Invalid password" });
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = generateToken(user);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.FirstName,
                lastName: user.LastName
            }
        });
    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
