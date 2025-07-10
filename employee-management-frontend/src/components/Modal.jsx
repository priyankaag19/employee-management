import React from 'react';
import './Modal.css'; // Optional, if styles are separated

const Modal = ({ isOpen, employee, onClose }) => {
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
            <div className="detail-item"><label>Position</label><span>{employee.position}</span></div>
            <div className="detail-item"><label>Department</label><span>{employee.department}</span></div>
            <div className="detail-item"><label>Email</label><span>{employee.email}</span></div>
            <div className="detail-item"><label>Phone</label><span>{employee.phone}</span></div>
            <div className="detail-item"><label>Age</label><span>{employee.age}</span></div>
            <div className="detail-item"><label>Salary</label><span>{employee.salary}</span></div>
            <div className="detail-item"><label>Hire Date</label><span>{employee.hireDate}</span></div>
            <div className="detail-item"><label>Manager</label><span>{employee.manager}</span></div>
            <div className="detail-item"><label>Performance</label><span>{employee.performance}</span></div>
            <div className="detail-item"><label>Location</label><span>{employee.location}</span></div>
            <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
              <label>Skills</label>
              <span>{employee.skills.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
