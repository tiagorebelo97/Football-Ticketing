import express from 'express';
import { listUsers, updateUserRole, deleteUser } from '../controllers/users';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// protect all routes
router.use(authenticateToken);

// Only super_admin can manage users
router.get('/', requireRole(['super_admin']), listUsers);
router.put('/:id/role', requireRole(['super_admin']), updateUserRole);
router.delete('/:id', requireRole(['super_admin']), deleteUser);

export default router;
