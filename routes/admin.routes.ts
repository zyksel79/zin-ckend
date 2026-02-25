import { Router } from 'express';
import { getUsers, getTransactions } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();

router.get('/users', authMiddleware, roleMiddleware('admin'), getUsers);
router.get('/transactions', authMiddleware, roleMiddleware('admin'), getTransactions);

export default router;
