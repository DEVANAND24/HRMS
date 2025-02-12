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
  const [timer, setTimer] = useState(0); // seconds elapsed
  const [intervalId, setIntervalId] = useState(null);
  const [timesheetsHistory, setTimesheetsHistory] = useState([]);

  const apiUrl = process.env.REACT_APP_API_URL || 'https://hrms-backend-yxcw.onrender.com';

  // Start timesheet session
  const startSession = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/timesheets/start`, {
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
        // Start timer
        const id = setInterval(() => {
          setTimer(prev => prev + 1);
        }, 1000);
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
      const res = await fetch(`${apiUrl}/timesheets/end`, {
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
        fetchTimesheetHistory();
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Fetch timesheet history for this employee (for calendar display)
  const fetchTimesheetHistory = async () => {
    try {
      const res = await fetch(`${apiUrl}/timesheets/my`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      setTimesheetsHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTimesheetHistory();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Create marks for calendar (each day's status)
  const marks = {};
  timesheetsHistory.forEach(ts => {
    const dateStr = new Date(ts.date).toDateString();
    marks[dateStr] = ts.status;
  });

  return (
    <div>
      <Navbar />
      <div className="timesheet-container">
        <h2>Daily Timesheet</h2>
        {error && <p className="error-message">{error}</p>}
        {!timesheet && (
          <button onClick={startSession} disabled={loading}>
            {loading ? 'Starting...' : 'Start Session'}
          </button>
        )}
        {timesheet && !timesheet.logoutTime && (
          <div>
            <p>Session started at: {new Date(timesheet.loginTime).toLocaleTimeString()}</p>
            <p>Elapsed time: {Math.floor(timer / 60)}m {timer % 60}s</p>
            <div className="task-input">
              <label>Tasks Completed Today:</label>
              <textarea
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                placeholder="Describe your tasks..."
              />
            </div>
            <div className="github-input">
              <label>GitHub Repository Link:</label>
              <input
                type="url"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                placeholder="https://github.com/your-repo"
              />
            </div>
            <button onClick={endSession} disabled={loading}>
              {loading ? 'Ending...' : 'End Session'}
            </button>
          </div>
        )}
        <div className="calendar-section">
          <h3>Timesheet Calendar</h3>
          <Calendar
            tileContent={({ date, view }) => {
              if (view === "month") {
                const dateStr = date.toDateString();
                const status = marks[dateStr];
                return status ? (
                  <p style={{ color: status === "Present" ? "green" : "red" }}>
                    {status}
                  </p>
                ) : null;
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
