import { Router } from 'express';
import { listCountries, getCountry, createCountry, updateCountry, deleteCountry } from '../controllers/countries';

const router = Router();

router.get('/', listCountries);
router.get('/:id', getCountry);
router.post('/', createCountry);
router.put('/:id', updateCountry);
router.delete('/:id', deleteCountry);

export default router;
