import { Router } from 'express';
import { getSports, getSportById } from '../controllers/sports';

const router = Router();

router.get('/', getSports);
router.get('/:id', getSportById);

export default router;
