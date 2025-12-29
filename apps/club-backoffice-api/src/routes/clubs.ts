import express from 'express';
import { getClubById, updateClub, getCountries } from '../controllers/clubs';

const router = express.Router();

router.get('/countries', getCountries);
router.get('/:clubId', getClubById);
router.put('/:clubId', updateClub);

export default router;
