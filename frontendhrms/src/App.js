// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import HRDashboard from './pages/HRDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import LeaveManagement from './pages/LeaveManagement';
import EmployeeDirectory from './pages/EmployeeDirectory';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    
      <Router>
        <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes with DashboardLayout */}
          <Route element={<PrivateRoute />}>
            {/* <Route element={<DashboardLayout />}> */}
              <Route path="/hr-dashboard" element={<HRDashboard />} />
              <Route path="/employee-directory" element={<EmployeeDirectory />} />
              <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
              <Route path="/leave-management" element={<LeaveManagement />} />
            </Route>
          {/* </Route> */}
          
        </Routes>
        </AuthProvider>
      </Router>
    
  );
}

export default App;
