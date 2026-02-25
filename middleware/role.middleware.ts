import { Request, Response, NextFunction } from 'express';

export const roleMiddleware = (role: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = (req as any).user.role;
        if (userRole !== role) return res.status(403).json({ error: 'Forbidden' });
        next();
    };
};
