import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import Header from './components/Header';
import ViewControls from './components/ViewControls';
import GridView from './components/GridView';
import TileView from './components/TileView';
import Modal from './components/Modal';
import Loading from './components/Loading';
import useAuth from './hooks/useAuth';

const GET_EMPLOYEES = gql`
  query Employees($search: String) {
    employees(search: $search) {
      id
      firstName
      lastName
      email
      department
      position
      avatar
      phone
      hireDate
      location
    }
  }
`;

const App = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { user, loading: userLoading } = useAuth();

  const { data, loading, error } = useQuery(GET_EMPLOYEES, {
    variables: { search: searchTerm },
  });

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  const handleActionClick = (action, employee, e) => {
    e.stopPropagation();
    setActiveDropdown(null);
    alert(`${action} action for ${employee.firstName} ${employee.lastName}`);
  };

  const toggleDropdown = (employeeId, e) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === employeeId ? null : employeeId);
  };

  if (loading || userLoading) {
    return (
      <div className="app-container">
        <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <Loading />
      </div>
    );
  }

  const employees = data?.employees || [];

  return (
    <div className="app-container">
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="main-content">
        <div className="content-header">
          <h1>Employee Management</h1>
          <p>Welcome, {user?.profile?.firstName}!</p>
        </div>
        <ViewControls
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        {employees.length === 0 ? (
          <div className="loading">
            <p>No employees found matching your search criteria.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <GridView
            employees={employees}
            onEmployeeClick={handleEmployeeClick}
            onActionClick={handleActionClick}
          />
        ) : (
          <TileView
            employees={employees}
            onEmployeeClick={handleEmployeeClick}
            onActionClick={handleActionClick}
            activeDropdown={activeDropdown}
            toggleDropdown={toggleDropdown}
          />
        )}
      </main>
      <Modal isOpen={showModal} employee={selectedEmployee} onClose={handleCloseModal} />
    </div>
  );
};

export default App;
