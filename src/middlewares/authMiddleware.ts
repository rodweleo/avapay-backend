import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv"
dotenv.config()

const { JWT_SECRET } = process.env
export const authMiddleware = (req: Request, res: Response, next: NextFunction): any => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, JWT_SECRET!);
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
