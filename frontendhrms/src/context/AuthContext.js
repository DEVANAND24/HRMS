// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
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

  // Logout function: clear user from localStorage and update state
  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    // Optionally, you can set a flag to sync logout across tabs
    localStorage.setItem('logout-event', Date.now());
    navigate('/login');
  };

  // Optional: Listen for storage changes to sync logout across tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'logout-event') {
        setUser(null);
        navigate('/login');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
