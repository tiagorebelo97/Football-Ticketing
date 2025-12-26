import { Router } from 'express';
import { 
  listCompetitions, 
  getCompetition, 
  createCompetition, 
  updateCompetition, 
  deleteCompetition,
  manageCompetitionClubs 
} from '../controllers/competitions';

const router = Router();

router.get('/', listCompetitions);
router.get('/:id', getCompetition);
router.post('/', createCompetition);
router.put('/:id', updateCompetition);
router.delete('/:id', deleteCompetition);
router.post('/:id/clubs', manageCompetitionClubs);

export default router;
