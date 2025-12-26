import express from 'express';
import { listSports, getSport } from '../controllers/sports';

const router = express.Router();

router.get('/', listSports);
router.get('/:id', getSport);

export default router;
