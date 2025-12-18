import { Router } from 'express';
import { configureNFCStock, getNFCStock } from '../controllers/nfc-stock';

const router = Router();

router.post('/:clubId', configureNFCStock);
router.get('/:clubId', getNFCStock);

export default router;
