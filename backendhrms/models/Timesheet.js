// backend/models/Timesheet.js
import mongoose from 'mongoose';

const TimesheetSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  loginTime: {
    type: Date,
    required: true,
  },
  logoutTime: {
    type: Date,
  },
  tasks: {
    type: String,
  },
  githubLink: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    default: 'Absent',
  },
}, { timestamps: true });

export default mongoose.model('Timesheet', TimesheetSchema);
