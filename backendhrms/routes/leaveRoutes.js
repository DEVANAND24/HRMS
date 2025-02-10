import express from 'express';
import { submitLeaveRequest, getLeaveRequests, updateLeaveStatus } from '../controllers/leaveController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, submitLeaveRequest)
  .get(protect, getLeaveRequests);

router.route('/:id')
  .put(protect, updateLeaveStatus);

export default router;
