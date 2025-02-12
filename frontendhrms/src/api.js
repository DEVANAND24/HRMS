// src/api.js
const BASE_URL = 'https://hrms-backend-yxcw.onrender.com';

export const fetchWithAuth = async (endpoint, token, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  return response.json();
};
