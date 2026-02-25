import { Router } from 'express';
import { generateLiveToken } from '../controllers/live.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/token', authMiddleware, generateLiveToken);

export default router;
