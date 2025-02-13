// src/context/AuthContext.js
import React, { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Retrieve user from localStorage so the login persists even after closing the tab
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const apiUrl = 'https://hrms-backend-yxcw.onrender.com';

  // Login function
  const login = async (credentials) => {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    setUser(data);
    localStorage.setItem('currentUser', JSON.stringify(data));
    navigate(data.role === 'HR' ? '/hr-dashboard' : '/employee-dashboard');
  };

  // Signup function
  const signup = async (userData) => {
    const response = await fetch(`${apiUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }
    setUser(data);
    localStorage.setItem('currentUser', JSON.stringify(data));
    navigate(data.role === 'HR' ? '/hr-dashboard' : '/employee-dashboard');
  };

  // Logout function: Clear user from localStorage and update state.
  // This logout will only affect the current tab.
  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
