import { Router } from 'express';
import { getAgencies, createAgency } from '../controllers/agency.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();

router.get('/', getAgencies);
router.post('/create', authMiddleware, roleMiddleware('admin'), createAgency);

export default router;
