import { Request, Response } from 'express';
import pool from '../config/db';

export const getUsers = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT id, username, email FROM users');
        res.json({ users: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};

export const getTransactions = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM transactions ORDER BY created_at DESC');
        res.json({ transactions: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};
