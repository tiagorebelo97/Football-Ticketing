import { Router } from 'express';
import { processRefund } from '../controllers/refunds';

const router = Router();

router.post('/', processRefund);

export default router;
