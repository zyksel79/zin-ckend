import { Router } from 'express';
import { startBattle, voteBattle, leaderboard } from '../controllers/pk.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/start', authMiddleware, startBattle);
router.post('/vote', authMiddleware, voteBattle);
router.get('/leaderboard/:roomID', leaderboard);

export default router;
