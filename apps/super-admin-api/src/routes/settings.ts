import express from 'express';
import { getSettings, updateSetting } from '../controllers/settings';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all settings (authenticated users can view)
router.get('/', authenticateToken, getSettings);

// Update a setting (only super_admin can modify)
router.put('/:key', authenticateToken, requireRole(['super_admin']), updateSetting);

export default router;
