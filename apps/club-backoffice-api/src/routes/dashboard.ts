import express from 'express';
import { getStats } from '../controllers/dashboard';

const router = express.Router();

router.get('/stats/:clubId', getStats);

export default router;
