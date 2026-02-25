import { Request, Response } from 'express';
import pool from '../config/db';

export const getAgencies = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM agencies');
        res.json({ agencies: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};

export const createAgency = async (req: Request, res: Response) => {
    const { name } = req.body;
    try {
        const result = await pool.query('INSERT INTO agencies (name) VALUES ($1) RETURNING *', [name]);
        res.json({ agency: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create agency' });
    }
};
