// backend/models/Employee.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String },
  contact: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['HR', 'Employee'], default: 'Employee' },
  leaveHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LeaveRequest',
    },
  ],
}, { timestamps: true });

// Hash password before saving
EmployeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare entered password with hashed password
EmployeeSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('Employee', EmployeeSchema);
