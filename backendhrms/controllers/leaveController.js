import LeaveRequest from '../models/LeaveRequest.js';
import Employee from '../models/Employee.js';
import { sendLeaveStatusEmail } from '../utils/emailService.js';

// Submit a leave request (Employee)
export const submitLeaveRequest = async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;
  const employeeId = req.user.id;

  try {
    const leaveRequest = await LeaveRequest.create({
      employee: employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'Pending',
    });

    res.status(201).json(leaveRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all leave requests (HR can see all, employees only theirs)
export const getLeaveRequests = async (req, res) => {
  try {
    let leaveRequests;
    if (req.user.role === 'HR') {
      leaveRequests = await LeaveRequest.find().populate('employee', 'name email');
    } else {
      leaveRequests = await LeaveRequest.find({ employee: req.user.id });
    }
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// HR approves/rejects leave
export const updateLeaveStatus = async (req, res) => {
  try {
    if (req.user.role !== 'HR') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const leaveRequest = await LeaveRequest.findById(req.params.id).populate('employee');
    if (!leaveRequest) return res.status(404).json({ message: 'Leave request not found' });

    leaveRequest.status = req.body.status; // Approved or Rejected
    await leaveRequest.save();

    await sendLeaveStatusEmail(leaveRequest.employee.email, leaveRequest.status, leaveRequest.reason);

    res.json(leaveRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
