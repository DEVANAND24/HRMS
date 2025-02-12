// backend/routes/timesheetRoutes.js
import express from 'express';
import { startTimesheet, endTimesheet, getEmployeeTimesheets, getAllTimesheets } from '../controllers/timesheetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Employee endpoints
router.post('/start', protect, startTimesheet);
router.post('/end', protect, endTimesheet);
router.get('/my', protect, getEmployeeTimesheets);

// HR endpoint to view all timesheets
router.get('/', protect, getAllTimesheets);

export default router;
