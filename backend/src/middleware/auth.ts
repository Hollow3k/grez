import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const protect = (req: any, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

            req.user = decoded.id;

            next();
        } catch (error) {
            console.error("❌ Auth Error:", error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};