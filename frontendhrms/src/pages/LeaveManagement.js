// src/pages/LeaveManagement.js
import React, { useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';
import '../styles/LeaveManagement.css';

const LeaveManagement = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    leaveType: 'Vacation', // you can add a dropdown for different leave types
    startDate: '',
    endDate: '',
    reason: '',
    // For file attachments, you might need additional handling (e.g., FormData)
  });
  const [leaveRequests, setLeaveRequests] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://hrmsbackend-in32.onrender.com/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(formData),
      });
      const newRequest = await res.json();
      setLeaveRequests([...leaveRequests, newRequest]);
      // Clear form fields
      setFormData({ leaveType: 'Vacation', startDate: '', endDate: '', reason: '' });
    } catch (error) {
      console.error('Error submitting leave request:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="leave-management-container">
        <h2>Leave Management</h2>
        
        <div className="leave-form">
          <h3>Submit Leave Request</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Leave Type:</label>
              <select name="leaveType" value={formData.leaveType} onChange={handleChange}>
                <option value="Vacation">Vacation</option>
                <option value="Sick">Sick</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
            <div className="form-group">
              <label>Start Date:</label>
              <input 
                type="date" 
                name="startDate" 
                value={formData.startDate} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-group">
              <label>End Date:</label>
              <input 
                type="date" 
                name="endDate" 
                value={formData.endDate} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Reason:</label>
              <textarea 
                name="reason" 
                value={formData.reason} 
                onChange={handleChange} 
                required 
              ></textarea>
            </div>
            <button className="btn" type="submit">Submit Request</button>
          </form>
        </div>
        
        <div className="leave-requests">
          <h3>Your Leave Requests</h3>
          {leaveRequests.length === 0 ? (
            <p>No leave requests submitted.</p>
          ) : (
            <ul>
              {leaveRequests.map(request => (
                <li key={request._id}>
                  {new Date(request.startDate).toLocaleDateString()} to {new Date(request.endDate).toLocaleDateString()} - {request.status}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        
      </div>
    </div>
  );
};

export default LeaveManagement;
