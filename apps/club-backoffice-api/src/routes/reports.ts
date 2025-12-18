import { Router } from 'express';
import { getSalesReport, getAttendanceReport } from '../controllers/reports';

const router = Router();

router.get('/sales/:clubId', getSalesReport);
router.get('/attendance/:clubId', getAttendanceReport);

export default router;
