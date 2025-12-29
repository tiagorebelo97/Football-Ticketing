import express from 'express';
import multer from 'multer';
import {
  listMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
  getMemberQuotas,
  createQuotaPayment,
  importMembersFromExcel,
  getMemberStats
} from '../controllers/members';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Member routes
router.get('/:clubId/members/stats', getMemberStats);
router.get('/:clubId/members', listMembers);
router.post('/:clubId/members/import', upload.single('file'), importMembersFromExcel);
router.post('/:clubId/members', createMember);
router.get('/members/:id', getMember);
router.put('/members/:id', updateMember);
router.delete('/members/:id', deleteMember);

// Quota routes
router.get('/members/:id/quotas', getMemberQuotas);
router.post('/members/:id/quotas', createQuotaPayment);

export default router;
