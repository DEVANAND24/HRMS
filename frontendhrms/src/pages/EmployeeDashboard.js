// src/pages/EmployeeDashboard.js
import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import AuthContext from "../context/AuthContext";
import "../styles/EmployeeDashboard.css";
import Calendar from "react-calendar";

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await fetch("https://hrmsbackend-in32.onrender.com/api/leaves", {
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}` 
          },
        });
        const data = await response.json();
        setLeaveRequests(data);
      } catch (error) {
        console.error("Error fetching leaves:", error);
      }
    };
    fetchLeaves();
  }, [user]);

  // Helper function to get all dates (as date strings) between start and end (inclusive)
  const getDatesInRange = (start, end) => {
    const dates = [];
    let current = new Date(start);
    const endDate = new Date(end);
    while (current <= endDate) {
      dates.push(new Date(current).toDateString());
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  // Create a mapping of date (as a string) to the leave status
  const markDates = () => {
    const marks = {};
    leaveRequests.forEach((leave) => {
      const dates = getDatesInRange(leave.startDate, leave.endDate);
      dates.forEach((dateStr) => {
        marks[dateStr] = leave.status;
      });
    });
    return marks;
  };

  // Prepare the marks object outside of the Calendar component so it's computed once per render
  const marks = markDates();

  return (
    <div>
      <Navbar />
      <div className="dashboard-container1">
        <div className="dash-h2">Employee Dashboard</div>
        <section className="employee-info">
          <h3>My Information</h3>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Department:</strong> {user.department || "N/A"}
          </p>
          <p>
            <strong>Contact:</strong> {user.email}
          </p>
        </section>
        <section className="upcoming-leaves1">
          <h3>Upcoming Leaves/Shifts</h3>
          <ul>
            {leaveRequests.map((leave) => (
              <li key={leave._id}>
                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()} - {leave.status}
              </li>
            ))}
          </ul>
        </section>
        <div>
          <h2>Leave Calendar</h2>
          <Calendar
            tileContent={({ date, view }) => {
              // Only show content on the month view
              if (view === "month") {
                const dateStr = date.toDateString();
                const status = marks[dateStr];
                return status ? (
                  <p style={{ color: status === "Approved" ? "green" : status === "Rejected" ? "red" : "orange" }}>
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

export default EmployeeDashboard;
