// src/components/Navbar.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  
  return (
    <nav className="navbar">
      <div className="navbar-brand">HRMS</div>
      <ul className="navbar-links">
        {user && user.role === 'HR' && (
          <>
            <li><Link to="/hr-dashboard">Dashboard</Link></li>
            <li><Link to="/employee-directory">Employee Directory</Link></li>
          </>
        )}
        {user && user.role === 'Employee' && (
          <>
            <li><Link to="/employee-dashboard">Dashboard</Link></li>
            <li><Link to="/leave-management">Leave Management</Link></li>
          </>
        )}
        {user && (
          <li>
            <button onClick={logout} className="logout-btn">Logout</button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
