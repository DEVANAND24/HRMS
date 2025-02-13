// src/pages/DailyTimesheet.js
import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Calendar from 'react-calendar';
import '../styles/DailyTimesheet.css';

const DailyTimesheet = () => {
  const { user } = useContext(AuthContext);
  const [timesheet, setTimesheet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [timesheetsHistory, setTimesheetsHistory] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || 'https://hrms-backend-yxcw.onrender.com/timesheets';

  // Helper function to calculate elapsed time from loginTime
  const calculateElapsedTime = (loginTime) => {
    return Math.floor((new Date() - new Date(loginTime)) / 1000);
  };

  // Start timesheet session
  const startSession = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
      } else {
        setTimesheet(data);
        // Store current session in sessionStorage (per-tab)
        sessionStorage.setItem('currentTimesheet', JSON.stringify(data));
        const initialTime = calculateElapsedTime(data.loginTime);
        setTimer(initialTime);
        const id = setInterval(() => setTimer((prev) => prev + 1), 1000);
        setIntervalId(id);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // End timesheet session
  const endSession = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ tasks, githubLink }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
      } else {
        setTimesheet(data);
        clearInterval(intervalId);
        setIntervalId(null);
        setTimer(0);
        // Remove the session from sessionStorage
        sessionStorage.removeItem('currentTimesheet');

        // Fetch updated timesheet history to update the table and calendar
        fetchTimesheetHistory();
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Fetch timesheet history for calendar and table display
  const fetchTimesheetHistory = async () => {
    try {
      const res = await fetch(`${apiUrl}/my`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      setTimesheetsHistory(data);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Restore active session from sessionStorage and fetch history on mount
  useEffect(() => {
    const savedSession = sessionStorage.getItem('currentTimesheet');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      if (!session.logoutTime) {
        setTimesheet(session);
        const elapsed = calculateElapsedTime(session.loginTime);
        setTimer(elapsed);
        const id = setInterval(() => setTimer((prev) => prev + 1), 1000);
        setIntervalId(id);
      }
    }
    fetchTimesheetHistory();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update the calendar marks with submitted timesheets
  const marks = {};
  timesheetsHistory.forEach((ts) => {
    const dateStr = new Date(ts.date).toDateString();
    marks[dateStr] = ts.status;
  });

  return (
    <div>
      <Navbar />
      <div className="timesheet-container">
        <h2 className="dtsh2">Daily Timesheet</h2>
        {error && <p className="error-message">{error}</p>}

        {!timesheet && (
          <button onClick={startSession} disabled={loading}>
            {loading ? 'Starting...' : 'Start Session'}
          </button>
        )}

        {timesheet && !timesheet.logoutTime && (
          <div className="timediv">
            <p>Session started at: {new Date(timesheet.loginTime).toLocaleTimeString()}</p>
            <p>Elapsed time: {Math.floor(timer / 60)}m {timer % 60}s</p>
            <div className="task-input">
              <label>Tasks Completed Today:</label>
              <textarea value={tasks} onChange={(e) => setTasks(e.target.value)} placeholder="Describe your tasks..." />
            </div>
            <div className="github-input">
              <label>GitHub Repository Link:</label>
              <input type="url" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} placeholder="https://github.com/your-repo" />
            </div>
            <button onClick={endSession} disabled={loading}>
              {loading ? 'Ending...' : 'End Session'}
            </button>
          </div>
        )}

        {timesheet && timesheet.logoutTime && !submitted && (
          <button onClick={fetchTimesheetHistory} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Timesheet'}
          </button>
        )}

        {submitted && (
          <div className="submitted-timesheets">
            <h3 className="timeTable">Your Timesheet History</h3>
            <table className="timesheet-history-table">
              <thead>
                <tr className="thead1">
                  <th>Date</th>
                  <th>Status</th>
                  <th>Login Time</th>
                  <th>Logout Time</th>
                  <th>Tasks</th>
                  <th>GitHub</th>
                </tr>
              </thead>
              <tbody>
                {timesheetsHistory.map((ts) => (
                  <tr key={ts._id}>
                    <td>{new Date(ts.date).toLocaleDateString()}</td>
                    <td>{ts.status}</td>
                    <td>{new Date(ts.loginTime).toLocaleTimeString()}</td>
                    <td>{ts.logoutTime ? new Date(ts.logoutTime).toLocaleTimeString() : 'In Session'}</td>
                    <td>{ts.tasks || '-'}</td>
                    <td>
                      {ts.githubLink ? <a href={ts.githubLink} target="_blank" rel="noopener noreferrer">GitHub</a> : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="calendar-section">
          <h3 className="timecal">Timesheet Calendar</h3>
          <Calendar
            tileContent={({ date, view }) => {
              if (view === "month") {
                const dateStr = date.toDateString();
                const status = marks[dateStr];
                return status ? <p style={{ color: status === "Present" ? "green" : "red" }}>{status}</p> : null;
              }
              return null;
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DailyTimesheet;
