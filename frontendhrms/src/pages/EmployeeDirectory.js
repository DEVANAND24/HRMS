// src/pages/EmployeeDirectory.js
import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';
import '../styles/EmployeeDirectory.css';

const EmployeeDirectory = () => {
  const { user } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');

  useEffect(() => {
    // Fetch employee data from backend API
    const fetchEmployees = async () => {
      try {
        const response = await fetch('https://hrms-backend-yxcw.onrender.com/api/employees', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = await response.json();
        console.log(data); // For debugging, to see the fetched data
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    // Only fetch if user.token is available
    if (user && user.token) {
      fetchEmployees();
    }
  }, [user]);

  // Filter employees based on search input and department filter
  const filteredEmployees = employees.filter(emp => {
    return (
      emp.name.toLowerCase().includes(search.toLowerCase()) &&
      (department === '' || emp.department === department)
    );
  });

  return (
    <div>
      <Navbar />
      <div className="employee-directory-container">
        <h2>Employee Directory</h2>
        <div className="filter-section">
          <input 
            type="text" 
            placeholder="Search by name" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          <select value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
            {/* Add other departments as needed */}
          </select>
        </div>
        <table className="employee-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Contact</th>
              <th>Reporting Manager</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => (
              <tr key={emp._id}>
                <td>{emp.name}</td>
                <td>{emp.department}</td>
                <td>{emp.contact}</td>
                <td>{emp.reporting || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeDirectory;
