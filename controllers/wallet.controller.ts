import { Request, Response } from 'express';
import pool from '../config/db';

export const getBalance = async (req: Request, res: Response) => {
    const userID = req.params.userID;
    try {
        const result = await pool.query('SELECT balance FROM wallets WHERE user_id=$1', [userID]);
        res.json({ balance: result.rows[0]?.balance || 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};

export const addTransaction = async (req: Request, res: Response) => {
    const { userID, type, amount } = req.body;
    try {
        await pool.query('BEGIN');
        await pool.query('INSERT INTO transactions (user_id,type,amount) VALUES ($1,$2,$3)', [userID, type, amount]);
        await pool.query('UPDATE wallets SET balance = balance + $1 WHERE user_id=$2', [amount, userID]);
        await pool.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Transaction failed' });
    }
};
