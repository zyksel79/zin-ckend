import { Request, Response } from 'express';
import pool from '../config/db';

export const getProfile = async (req: Request, res: Response) => {
    const userID = (req as any).user.id;
    try {
        const result = await pool.query('SELECT id, username, email FROM users WHERE id=$1', [userID]);
        res.json({ user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};
