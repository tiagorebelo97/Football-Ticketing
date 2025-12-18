import { Router } from 'express';
import { provisionClub, listClubs, getClub, updateClub } from '../controllers/clubs';

const router = Router();

router.post('/', provisionClub);
router.get('/', listClubs);
router.get('/:clubId', getClub);
router.put('/:clubId', updateClub);

export default router;
