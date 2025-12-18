import { Router } from 'express';
import { validateEntry, getMatchCapacity } from '../controllers/validation';

const router = Router();

router.post('/validate', validateEntry);
router.get('/capacity/:matchId', getMatchCapacity);

export default router;
