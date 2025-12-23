
import express from 'express';
import { getClubBySlug } from '../controllers/auth';

const router = express.Router();

router.get('/:slug', getClubBySlug);

export default router;
