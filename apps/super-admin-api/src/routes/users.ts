import express from 'express';
import {
    listUsers,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    toggleVerification
} from '../controllers/users';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// protect all routes
router.use(authenticateToken);

// Only super_admin can manage users
router.get('/', requireRole(['super_admin']), listUsers);
router.post('/', requireRole(['super_admin']), createUser);
router.put('/:id', requireRole(['super_admin']), updateUser);
router.post('/:id/reset-password', requireRole(['super_admin']), resetPassword);
router.post('/:id/toggle-verify', requireRole(['super_admin']), toggleVerification);
router.delete('/:id', requireRole(['super_admin']), deleteUser);

export default router;
