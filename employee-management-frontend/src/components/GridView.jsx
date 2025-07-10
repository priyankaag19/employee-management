import React from 'react';

const GridView = ({ employees, onEmployeeClick, onActionClick }) => {
  return (
    <div className="grid-view">
      {employees.map(employee => (
        <div 
          key={employee.id} 
          className="grid-item"
          onClick={() => onEmployeeClick(employee)}
        >
          <div className="actions">
            <button 
              className="action-btn" 
              onClick={(e) => onActionClick('Edit', employee, e)}
            >
              <i className="fas fa-edit"></i>
            </button>
            <button 
              className="action-btn" 
              onClick={(e) => onActionClick('Flag', employee, e)}
            >
              <i className="fas fa-flag"></i>
            </button>
            <button 
              className="action-btn" 
              onClick={(e) => onActionClick('Delete', employee, e)}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
          
          <h3>{employee.name}</h3>
          <p><strong>Position:</strong> {employee.position}</p>
          <p><strong>Department:</strong> {employee.department}</p>
          <p><strong>Email:</strong> {employee.email}</p>
          <p><strong>Phone:</strong> {employee.phone}</p>
          <p><strong>Age:</strong> {employee.age}</p>
          <p><strong>Salary:</strong> {employee.salary}</p>
          <p><strong>Hire Date:</strong> {employee.hireDate}</p>
          <p><strong>Manager:</strong> {employee.manager}</p>
          <p><strong>Location:</strong> {employee.location}</p>
        </div>
      ))}
      
      <style>{`
        .grid-view {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .grid-item {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .grid-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .grid-item:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
        }

        .grid-item:hover::before {
          opacity: 1;
        }

        .grid-item h3 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #333;
        }

        .grid-item p {
          color: #666;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .grid-item .actions {
          position: absolute;
          top: 20px;
          right: 20px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .grid-item:hover .actions {
          opacity: 1;
        }

        .action-btn {
          background: rgba(102, 126, 234, 0.1);
          border: none;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          margin-left: 5px;
          transition: all 0.3s ease;
          color: #667eea;
        }

        .action-btn:hover {
          background: #667eea;
          color: white;
        }

        @media (max-width: 768px) {
          .grid-view {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default GridView;