import { Router } from 'express';
import { getBalance, addTransaction } from '../controllers/wallet.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/balance/:userID', authMiddleware, getBalance);
router.post('/transaction', authMiddleware, addTransaction);

export default router;
