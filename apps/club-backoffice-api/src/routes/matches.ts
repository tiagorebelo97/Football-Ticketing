import { Router } from 'express';
import { createMatch, updateMatch, listMatches, deleteMatch } from '../controllers/matches';

const router = Router();

router.post('/', createMatch);
router.put('/:matchId', updateMatch);
router.get('/', listMatches);
router.delete('/:matchId', deleteMatch);

export default router;
