import jwt from "jsonwebtoken"
import { User } from "../models/User";
import dotenv from "dotenv";
import { UserTable } from "../models/UserTable";

dotenv.config();

export const generateToken = (user: UserTable) => {
    return jwt.sign(
        {
            id: user.userId,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "24h" }
    );
};



