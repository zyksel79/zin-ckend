import { Request, Response, NextFunction } from 'express';

export const validateBody = (requiredFields: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const missing = requiredFields.filter(field => !(field in req.body));
        if (missing.length > 0) return res.status(400).json({ error: 'Missing fields', fields: missing });
        next();
    };
};
