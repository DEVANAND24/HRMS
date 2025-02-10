// src/context/AuthContext.js
import React, { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  // Try to initialize from localStorage so that sessions persist across refreshes.
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Real login using API call to backend
  const login = async (credentials) => {
    try {
      const response = await fetch('https://hrms-backend-yxcw.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (response.ok) {
        // Save the returned user data (including token)
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        // Navigate based on role
        if (data.role === 'HR') {
          navigate('/hr-dashboard');
        } else {
          navigate('/employee-dashboard');
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  // For signup, you can add a similar function (or handle it in your Signup page)
  const signup = async (userData) => {
    try {
      const response = await fetch('https://hrms-backend-yxcw.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (response.ok) {
        // Automatically log in after a successful signup
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        if (data.role === 'HR') {
          navigate('/hr-dashboard');
        } else {
          navigate('/employee-dashboard');
        }
      } else {
        console.error('Signup failed:', data.message);
      }
    } catch (error) {
      console.error('Error during signup:', error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
