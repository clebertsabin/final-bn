import { User } from "../models/User";  // Path to your User model

declare global {
  namespace Express {
    interface Request {
      user?: User;  // Here we tell TypeScript that req.user will be a User
    }
  }
}