// src/pages/HRTimesheets.js
import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';
import '../styles/HRTimesheets.css';

const HRTimesheets = () => {
  const { user } = useContext(AuthContext);
  const [timesheets, setTimesheets] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL || 'https://hrms-backend-yxcw.onrender.com';

  useEffect(() => {
    const fetchTimesheets = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/timesheets`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = await response.json();
        setTimesheets(data);
      } catch (error) {
        console.error('Error fetching timesheets:', error);
      }
    };
    fetchTimesheets();
  }, [user, apiUrl]);

  return (
    <div>
      <Navbar />
      <div className="hr-timesheets-container">
        <h2>Employee Timesheets</h2>
        <table className="timesheet-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee Name</th>
              <th>Login Time</th>
              <th>Logout Time</th>
              <th>Status</th>
              <th>Tasks</th>
              <th>GitHub Link</th>
            </tr>
          </thead>
          <tbody>
            {timesheets.map(ts => (
              <tr key={ts._id}>
                <td>{new Date(ts.date).toLocaleDateString()}</td>
                <td>{ts.employee?.name || 'N/A'}</td>
                <td>{new Date(ts.loginTime).toLocaleTimeString()}</td>
                <td>
                  {ts.logoutTime
                    ? new Date(ts.logoutTime).toLocaleTimeString()
                    : 'In Session'}
                </td>
                <td>{ts.status}</td>
                <td>{ts.tasks}</td>
                <td>
                  {ts.githubLink && (
                    <a href={ts.githubLink} target="_blank" rel="noopener noreferrer">
                      Link
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HRTimesheets;
