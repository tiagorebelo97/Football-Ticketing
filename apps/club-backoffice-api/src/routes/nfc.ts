import { Router } from 'express';
import { getNFCInventory, addNFCCards } from '../controllers/nfc';

const router = Router();

router.get('/inventory/:clubId', getNFCInventory);
router.post('/add', addNFCCards);

export default router;
