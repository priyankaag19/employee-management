import React from 'react';

const Header = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  return (
    <header className="header">
      <div className="nav-container">
        <div className="logo">
          <i className="fas fa-users"></i> EmployeeHub
        </div>
        
        <nav className="horizontal-menu">
          <li className="menu-item">
            <a href="#" className="menu-link">
              <i className="fas fa-home"></i> Dashboard
            </a>
          </li>
          <li className="menu-item">
            <a href="#" className="menu-link">
              <i className="fas fa-users"></i> Employees
            </a>
            <ul className="submenu">
              <li><a href="#">View All</a></li>
              <li><a href="#">Add New</a></li>
              <li><a href="#">Import</a></li>
            </ul>
          </li>
          <li className="menu-item">
            <a href="#" className="menu-link">
              <i className="fas fa-building"></i> Departments
            </a>
            <ul className="submenu">
              <li><a href="#">Engineering</a></li>
              <li><a href="#">Marketing</a></li>
              <li><a href="#">Sales</a></li>
              <li><a href="#">HR</a></li>
            </ul>
          </li>
          <li className="menu-item">
            <a href="#" className="menu-link">
              <i className="fas fa-chart-bar"></i> Reports
            </a>
          </li>
          <li className="menu-item">
            <a href="#" className="menu-link">
              <i className="fas fa-cog"></i> Settings
            </a>
            <ul className="submenu">
              <li><a href="#">Profile</a></li>
              <li><a href="#">Preferences</a></li>
              <li><a href="#">Security</a></li>
            </ul>
          </li>
        </nav>

        <div className={`hamburger ${mobileMenuOpen ? 'active' : ''}`} 
             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <ul>
          <li><a href="#">Dashboard</a></li>
          <li><a href="#">Employees</a></li>
          <li><a href="#">Departments</a></li>
          <li><a href="#">Reports</a></li>
          <li><a href="#">Settings</a></li>
        </ul>
      </div>
      
      <style>{`
        .header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 70px;
        }

        .logo {
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hamburger {
          display: none;
          flex-direction: column;
          cursor: pointer;
          padding: 10px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .hamburger:hover {
          background: rgba(102, 126, 234, 0.1);
        }

        .hamburger span {
          width: 25px;
          height: 3px;
          background: #333;
          margin: 3px 0;
          transition: 0.3s;
          border-radius: 2px;
        }

        .hamburger.active span:nth-child(1) {
          transform: rotate(-45deg) translate(-5px, 6px);
        }

        .hamburger.active span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.active span:nth-child(3) {
          transform: rotate(45deg) translate(-5px, -6px);
        }

        .horizontal-menu {
          display: flex;
          list-style: none;
          gap: 30px;
          align-items: center;
        }

        .menu-item {
          position: relative;
        }

        .menu-link {
          text-decoration: none;
          color: #333;
          font-weight: 500;
          padding: 10px 15px;
          border-radius: 8px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .menu-link:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .submenu {
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          min-width: 200px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s ease;
          z-index: 1001;
        }

        .menu-item:hover .submenu {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .submenu li {
          list-style: none;
        }

        .submenu a {
          display: block;
          padding: 12px 20px;
          text-decoration: none;
          color: #333;
          border-radius: 8px;
          margin: 5px;
          transition: all 0.3s ease;
        }

        .submenu a:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .mobile-menu {
          display: none;
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          z-index: 999;
          transform: translateY(-100%);
          transition: transform 0.3s ease;
        }

        .mobile-menu.active {
          transform: translateY(0);
        }

        .mobile-menu ul {
          list-style: none;
          padding: 20px;
        }

        .mobile-menu li {
          margin: 10px 0;
        }

        .mobile-menu a {
          text-decoration: none;
          color: #333;
          font-weight: 500;
          display: block;
          padding: 15px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .mobile-menu a:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        @media (max-width: 768px) {
          .hamburger {
            display: flex;
          }

          .horizontal-menu {
            display: none;
          }

          .mobile-menu {
            display: block;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;