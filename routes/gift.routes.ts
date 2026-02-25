import { Router } from 'express';
import { getGifts, sendGift } from '../controllers/gift.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getGifts);
router.post('/send', authMiddleware, sendGift);

export default router;
