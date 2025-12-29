import express from 'express';
import { getClubById } from '../controllers/clubs';

const router = express.Router();

router.get('/:id', getClubById);

export default router;
