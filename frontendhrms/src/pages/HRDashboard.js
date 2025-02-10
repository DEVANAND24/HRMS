// src/pages/HRDashboard.js
import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';
import '../styles/HRDashboard.css';

const HRDashboard = () => {
  const { user } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    // Fetch employee information
    const fetchEmployees = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/employees', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = await res.json();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    // Fetch leave requests (all, since HR can see them all)
    const fetchLeaveRequests = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/leaves', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = await res.json();
        setLeaveRequests(data);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      }
    };

    fetchEmployees();
    fetchLeaveRequests();
  }, [user]);

  // Handler for updating leave status
  const updateLeaveStatus = async (leaveId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/leaves/${leaveId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const updatedLeave = await res.json();
      // Update the local state to reflect the change
      setLeaveRequests(leaveRequests.map(lr => lr._id === leaveId ? updatedLeave : lr));
    } catch (error) {
      console.error('Error updating leave status:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <h2>HR Dashboard</h2>
        
        <section className="employee-info">
          <h3>Employee Information</h3>
          <table className="employee-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp._id}>
                  <td>{emp.name}</td>
                  <td>{emp.department}</td>
                  <td>{emp.contact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="upcoming-leaves">
          <h3>Leave Requests</h3>
          <table className="employee-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Period</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map(leave => (
                <tr key={leave._id}>
                  <td>{leave.employee.name}</td>
                  <td>{leave.leaveType}</td>
                  <td>
                    {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td>{leave.status}</td>
                  <td>
                    {leave.status === 'Pending' && (
                      <>
                        <button onClick={() => updateLeaveStatus(leave._id, 'Approved')}>Approve</button>
                        <button onClick={() => updateLeaveStatus(leave._id, 'Rejected')}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

       
      </div>
    </div>
  );
};

export default HRDashboard;
