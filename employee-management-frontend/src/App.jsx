import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import Header from './components/Header';
import ViewControls from './components/ViewControls';
import GridView from './components/GridView';
import TileView from './components/TileView';
import Modal from './components/Modal';
import Loading from './components/Loading';
import useAuth from './hooks/useAuth';

// ✅ FIXED: Updated query to match your NEW pagination structure
const GET_EMPLOYEES = gql`
  query GetEmployees($page: Int, $limit: Int, $search: String) {
    employees(page: $page, limit: $limit, search: $search) {
      employees {
        id
        firstName
        lastName
        email
        department
        position
        avatarUrl
        phone
        hireDate
        location
      }
      pagination {
        total
        page
        limit
        totalPages
      }
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
  const [currentPage, setCurrentPage] = useState(1);
  const { user, loading: userLoading } = useAuth();

  const { data, loading, error } = useQuery(GET_EMPLOYEES, {
    variables: { 
      page: currentPage, 
      limit: 10, 
      search: searchTerm 
    },
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

  // ✅ IMPROVED: Better error handling
  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <Loading />
        </div>
      </div>
    );
  }

  // ✅ ADDED: Error handling for GraphQL errors
  if (error) {
    console.error('GraphQL Error:', error);
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-600 text-center">
            <h2 className="text-lg font-semibold mb-2">Error Loading Employees</h2>
            <p className="text-sm">{error.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ FIXED: Updated to access nested employees array
  const employees = data?.employees?.employees || [];
  const pagination = data?.employees?.pagination || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Employee Management
            </h1>
            <p className="text-gray-600">
              Welcome, {user?.profile?.firstName}!
            </p>
          </div>
        </div>
        
        <ViewControls viewMode={viewMode} setViewMode={setViewMode} />
        
        {/* ✅ ADDED: Pagination info display */}
        {pagination.total > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {employees.length} of {pagination.total} employees
            {pagination.totalPages > 1 && (
              <span> (Page {pagination.page} of {pagination.totalPages})</span>
            )}
          </div>
        )}
        
        {employees.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No employees found matching your search criteria.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <GridView 
            employees={employees}
            onEmployeeClick={handleEmployeeClick}
            onActionClick={handleActionClick}
            activeDropdown={activeDropdown}
            toggleDropdown={toggleDropdown}
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

        {/* ✅ ADDED: Simple pagination controls */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 hover:bg-blue-600"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={currentPage === pagination.totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 hover:bg-blue-600"
            >
              Next
            </button>
          </div>
        )}
      </div>
      
      {showModal && selectedEmployee && (
        <Modal employee={selectedEmployee} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default App;