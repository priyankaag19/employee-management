import React from 'react';

const TileView = ({ employees, onEmployeeClick, onActionClick, activeDropdown, toggleDropdown }) => {
  return (
    <div className="tile-view">
      {employees.map(employee => (
        <div 
          key={employee.id} 
          className="tile-item"
          onClick={() => onEmployeeClick(employee)}
        >
          <div className="tile-actions">
            <button 
              className="menu-btn" 
              onClick={(e) => toggleDropdown(employee.id, e)}
            >
              <i className="fas fa-ellipsis-v"></i>
            </button>
            <div className={`dropdown-menu ${activeDropdown === employee.id ? 'active' : ''}`}>
              <div 
                className="dropdown-item" 
                onClick={(e) => onActionClick('Edit', employee, e)}
              >
                <i className="fas fa-edit"></i> Edit
              </div>
              <div 
                className="dropdown-item" 
                onClick={(e) => onActionClick('Flag', employee, e)}
              >
                <i className="fas fa-flag"></i> Flag
              </div>
              <div 
                className="dropdown-item" 
                onClick={(e) => onActionClick('Delete', employee, e)}
              >
                <i className="fas fa-trash"></i> Delete
              </div>
            </div>
          </div>
          
          <div className="tile-header">
            <div className="tile-avatar">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="tile-info">
              <h3>{employee.name}</h3>
              <p>{employee.position}</p>
            </div>
          </div>
          
          <div className="tile-details">
            <div className="tile-detail">
              <label>Department</label>
              <span>{employee.department}</span>
            </div>
            <div className="tile-detail">
              <label>Age</label>
              <span>{employee.age}</span>
            </div>
            <div className="tile-detail">
              <label>Salary</label>
              <span>{employee.salary}</span>
            </div>
            <div className="tile-detail">
              <label>Performance</label>
              <span>{employee.performance}</span>
            </div>
          </div>
        </div>
      ))}
      
      <style>{`
        .tile-view {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 25px;
          margin-bottom: 40px;
        }

        .tile-item {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .tile-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .tile-item:hover {
          transform: translateY(-10px);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
        }

        .tile-item:hover::before {
          opacity: 1;
        }

        .tile-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }

        .tile-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(45deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: 600;
          margin-right: 15px;
        }

        .tile-info h3 {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 5px;
          color: #333;
        }

        .tile-info p {
          color: #666;
          font-size: 14px;
        }

        .tile-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }

        .tile-detail {
          background: rgba(102, 126, 234, 0.05);
          padding: 12px;
          border-radius: 8px;
          border-left: 3px solid #667eea;
        }

        .tile-detail label {
          font-size: 12px;
          color: #666;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tile-detail span {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-top: 4px;
        }

        .tile-actions {
          position: absolute;
          top: 25px;
          right: 25px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .tile-item:hover .tile-actions {
          opacity: 1;
        }

        .menu-btn {
          background: rgba(102, 126, 234, 0.1);
          border: none;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #667eea;
          position: relative;
        }

        .menu-btn:hover {
          background: #667eea;
          color: white;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          min-width: 150px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s ease;
          z-index: 1001;
        }

        .dropdown-menu.active {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-item {
          padding: 12px 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #333;
        }

        .dropdown-item:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .dropdown-item:first-child {
          border-radius: 12px 12px 0 0;
        }

        .dropdown-item:last-child {
          border-radius: 0 0 12px 12px;
        }

        @media (max-width: 768px) {
          .tile-view {
            grid-template-columns: 1fr;
          }

          .tile-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default TileView;