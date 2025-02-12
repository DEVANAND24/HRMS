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

  // Unique session key per user to avoid conflicts
  const sessionKey = `timesheetSession_${user?.email}`;

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
        sessionStorage.setItem(sessionKey, JSON.stringify(data)); // Store session per user
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
        sessionStorage.removeItem(sessionKey); // Remove user-specific session

        // Fetch updated timesheet history
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
    const savedSession = sessionStorage.getItem(sessionKey);
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
            <button onClick={endSession} disabled={loading}>
              {loading ? 'Ending...' : 'End Session'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyTimesheet;
