// backend/controllers/timesheetController.js
import Timesheet from '../models/Timesheet.js';

// Start timesheet: Record the login time for today.
export const startTimesheet = async (req, res) => {
  try {
    const employeeId = req.user._id;
    // Set today's date to midnight (to treat all logins on the same day equally)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Prevent starting multiple sessions in one day
    const existing = await Timesheet.findOne({ employee: employeeId, date: today });
    if (existing) {
      return res.status(400).json({ message: 'Timesheet already started for today' });
    }

    const timesheet = await Timesheet.create({
      employee: employeeId,
      date: today,
      loginTime: new Date(),
    });
    res.status(201).json(timesheet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// End timesheet: Record logout, tasks, and GitHub link; calculate duration and mark status.
export const endTimesheet = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const timesheet = await Timesheet.findOne({ employee: employeeId, date: today });
    if (!timesheet) {
      return res.status(400).json({ message: 'No timesheet started for today' });
    }
    if (timesheet.logoutTime) {
      return res.status(400).json({ message: 'Timesheet already ended for today' });
    }

    // Set logout time to current time
    timesheet.logoutTime = new Date();
    timesheet.tasks = req.body.tasks;
    timesheet.githubLink = req.body.githubLink;

    // Calculate the session duration in hours using proper Date conversions.
    const duration = (new Date(timesheet.logoutTime) - new Date(timesheet.loginTime)) / (1000 * 60 * 60);
    // Mark as "Present" if duration is equal to or greater than 9 hours; otherwise, mark as "Absent"
    timesheet.status = duration >= 9 ? 'Present' : 'Absent';

    const updatedTimesheet = await timesheet.save();
    res.json(updatedTimesheet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get timesheets for an employee (for their dashboard)
export const getEmployeeTimesheets = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const timesheets = await Timesheet.find({ employee: employeeId }).sort({ date: -1 });
    res.json(timesheets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// For HR: Get all timesheets
export const getAllTimesheets = async (req, res) => {
  try {
    if (req.user.role !== 'HR') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const timesheets = await Timesheet.find().populate('employee', 'name email department').sort({ date: -1 });
    res.json(timesheets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
