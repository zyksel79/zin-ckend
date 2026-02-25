import { Request, Response } from 'express';
import { setScore, topScores } from '../utils/leaderboard';

export const startBattle = (req: Request, res: Response) => {
    const { roomID } = req.body;
    if (!roomID) return res.status(400).json({ error: 'Missing roomID' });
    // Battle başlatma mantığı (DB + Redis) burada
    res.json({ success: true, roomID });
};

export const voteBattle = async (req: Request, res: Response) => {
    const { roomID, targetUserID, score } = req.body;
    if (!roomID || !targetUserID || !score) return res.status(400).json({ error: 'Missing params' });

    await setScore(roomID, targetUserID, score);
    res.json({ success: true });
};

export const leaderboard = async (req: Request, res: Response) => {
    const { roomID } = req.params;
    const scores = await topScores(roomID);
    res.json({ roomID, scores });
};
