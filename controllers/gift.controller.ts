import { Request, Response } from 'express';
import pool from '../config/db';

export const getGifts = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM gifts');
        res.json({ gifts: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};

export const sendGift = async (req: Request, res: Response) => {
    const { senderID, receiverID, giftID } = req.body;
    try {
        await pool.query('BEGIN');
        await pool.query(
            'INSERT INTO transactions (user_id, type, amount) VALUES ($1, $2, $3)',
            [senderID, 'gift', -1] // örnek coin düşümü
        );
        await pool.query('INSERT INTO gifts_sent (sender_id, receiver_id, gift_id) VALUES ($1,$2,$3)', [
            senderID,
            receiverID,
            giftID
        ]);
        await pool.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Gift sending failed' });
    }
};
