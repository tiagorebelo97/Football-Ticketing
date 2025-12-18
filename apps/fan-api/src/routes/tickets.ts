import { Router } from 'express';
import { purchaseTicket, getTicket, getUserTickets } from '../controllers/tickets';

const router = Router();

router.post('/purchase', purchaseTicket);
router.get('/:ticketId', getTicket);
router.get('/user/:userId', getUserTickets);

export default router;
