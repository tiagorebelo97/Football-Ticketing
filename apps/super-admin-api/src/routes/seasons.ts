import { Router } from 'express';
import { 
  listSeasons, 
  getSeason, 
  createSeason, 
  updateSeason, 
  deleteSeason,
  getActiveSeason 
} from '../controllers/seasons';

const router = Router();

router.get('/', listSeasons);
router.get('/active', getActiveSeason);
router.get('/:id', getSeason);
router.post('/', createSeason);
router.put('/:id', updateSeason);
router.delete('/:id', deleteSeason);

export default router;
