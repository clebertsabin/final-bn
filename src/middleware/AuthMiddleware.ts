import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define the payload type expected from JWT
interface UserPayload {
  id: string;
  role: string;
  [key: string]: any;
}

// Extend Express Request to include user property and params
interface AuthenticatedRequest extends Request {
  user?: UserPayload & { userId: string };
  params: {
    [key: string]: string;
  };
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ message: "Server configuration error" });
      return;
    }

    const decoded = jwt.verify(token, secret) as UserPayload;

    // 🛠 FIX: Rename 'id' to 'userId' so controller works
    req.user = { ...decoded, userId: decoded.userId };

    const { userId } = req.params;
    if (userId && String(decoded.id) !== String(userId)) {
      if (decoded.role !== 'admin') {
        res.status(403).json({ message: "Unauthorized access to this user" });
        return;
      }
    }
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
