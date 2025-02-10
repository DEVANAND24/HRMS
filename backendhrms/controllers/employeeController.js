// backend/controllers/employeeController.js
import Employee from '../models/Employee.js';

// Get all employees (for HR)
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get an employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update employee details (for HR or self-update)
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    employee.name = req.body.name || employee.name;
    employee.email = req.body.email || employee.email;
    employee.department = req.body.department || employee.department;
    employee.contact = req.body.contact || employee.contact;
    // Optionally, include password update logic if required
    const updatedEmployee = await employee.save();
    res.json({
      _id: updatedEmployee._id,
      name: updatedEmployee.name,
      email: updatedEmployee.email,
      role: updatedEmployee.role,
      department: updatedEmployee.department,
      contact: updatedEmployee.contact,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an employee (for HR)
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    await employee.remove();
    res.json({ message: 'Employee removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
