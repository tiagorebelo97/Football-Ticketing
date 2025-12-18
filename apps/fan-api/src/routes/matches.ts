import { Router } from 'express';
import { listMatches, getMatch } from '../controllers/matches';

const router = Router();

router.get('/', listMatches);
router.get('/:matchId', getMatch);

export default router;
