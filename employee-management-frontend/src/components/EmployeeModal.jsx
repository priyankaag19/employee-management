import React from 'react';

const EmployeeModal = ({ employee, isOpen, onClose }) => {
  if (!isOpen || !employee) return null;

  return (
    <div className={`modal ${isOpen ? 'active' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{employee.name}</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item">
              <label>Position</label>
              <span>{employee.position}</span>
            </div>
            <div className="detail-item">
              <label>Department</label>
              <span>{employee.department}</span>
            </div>
            <div className="detail-item">
              <label>Email</label>
              <span>{employee.email}</span>
            </div>
            <div className="detail-item">
              <label>Phone</label>
              <span>{employee.phone}</span>
            </div>
            <div className="detail-item">
              <label>Age</label>
              <span>{employee.age}</span>
            </div>
            <div className="detail-item">
              <label>Salary</label>
              <span>{employee.salary}</span>
            </div>
            <div className="detail-item">
              <label>Hire Date</label>
              <span>{employee.hireDate}</span>
            </div>
            <div className="detail-item">
              <label>Manager</label>
              <span>{employee.manager}</span>
            </div>
            <div className="detail-item">
              <label>Performance</label>
              <span>{employee.performance}</span>
            </div>
            <div className="detail-item">
              <label>Location</label>
              <span>{employee.location}</span>
            </div>
            <div className="detail-item skills-item">
              <label>Skills</label>
              <span>{employee.skills?.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }

        .modal.active {
          opacity: 1;
          visibility: visible;
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
          transform: scale(0.9);
          transition: transform 0.3s ease;
        }

        .modal.active .modal-content {
          transform: scale(1);
        }

        .modal-header {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          padding: 25px;
          border-radius: 20px 20px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          font-size: 24px;
          font-weight: 600;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .modal-body {
          padding: 30px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .detail-item {
          background: rgba(102, 126, 234, 0.05);
          padding: 20px;
          border-radius: 12px;
          border-left: 4px solid #667eea;
        }

        .skills-item {
          grid-column: 1 / -1;
        }

        .detail-item label {
          font-size: 14px;
          color: #666;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          display: block;
        }

        .detail-item span {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
      `}</style>
    </div>
  );
};

export default EmployeeModal;