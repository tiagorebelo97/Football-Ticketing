import { Router } from 'express';
import { nfcLogin, logout } from '../controllers/auth';

const router = Router();

router.post('/nfc-login', nfcLogin);
router.post('/logout', logout);

export default router;
