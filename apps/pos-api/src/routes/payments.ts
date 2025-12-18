import { Router } from 'express';
import { processPayment, assignNFC } from '../controllers/payments';

const router = Router();

router.post('/process', processPayment);
router.post('/assign-nfc', assignNFC);

export default router;
