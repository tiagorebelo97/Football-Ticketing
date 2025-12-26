import { Router } from 'express';
import { provisionClub, listClubs, getClub, updateClub, deleteClub, restoreClub } from '../controllers/clubs';

const router = Router();

router.post('/', provisionClub);
router.get('/', listClubs);
router.get('/:clubId', getClub);
router.put('/:clubId', updateClub);
router.delete('/:clubId', deleteClub);
router.post('/:clubId/restore', restoreClub);

export default router;
