import { Router } from 'express';
import { configureFees, getFees } from '../controllers/fee-config';

const router = Router();

router.post('/:clubId', configureFees);
router.get('/:clubId', getFees);

export default router;
