import { Router } from 'express';
import { listVenues, getVenue, createVenue, updateVenue, deleteVenue } from '../controllers/venues';

const router = Router();

router.get('/', listVenues);
router.get('/:id', getVenue);
router.post('/', createVenue);
router.put('/:id', updateVenue);
router.delete('/:id', deleteVenue);

export default router;
