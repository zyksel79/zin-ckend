import { Request, Response } from 'express';
import { generateToken } from '../config/zegocloud';

export const generateLiveToken = (req: Request, res: Response) => {
    const userID = (req as any).user.id;
    const roomID = req.query.roomID as string;
    if (!roomID) return res.status(400).json({ error: 'Missing roomID' });

    const token = generateToken(userID, roomID);
    res.json({ token });
};
