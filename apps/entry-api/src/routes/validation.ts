import { Router } from 'express';
import { validateEntry, getMatchCapacity, listMatches } from '../controllers/validation';

const router = Router();

router.get('/matches', listMatches);
router.post('/validate', validateEntry);
router.get('/capacity/:matchId', getMatchCapacity);

export default router;
