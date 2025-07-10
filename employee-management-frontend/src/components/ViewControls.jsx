import React from 'react';

const ViewControls = ({ viewMode, setViewMode, searchTerm, setSearchTerm }) => {
  return (
    <div className="view-controls">
      <div className="view-toggle">
        <button 
          className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => setViewMode('grid')}
        >
          <i className="fas fa-th"></i> Grid View
        </button>
        <button 
          className={`toggle-btn ${viewMode === 'tile' ? 'active' : ''}`}
          onClick={() => setViewMode('tile')}
        >
          <i className="fas fa-th-large"></i> Tile View
        </button>
      </div>
      
      <div className="search-box">
        <input
          type="text"
          className="search-input"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <i className="fas fa-search search-icon"></i>
      </div>
      
      <style>{`
        .view-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .view-toggle {
          display: flex;
          gap: 10px;
        }

        .toggle-btn {
          background: transparent;
          border: 2px solid #667eea;
          color: #667eea;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .toggle-btn.active {
          background: #667eea;
          color: white;
        }

        .search-box {
          position: relative;
          width: 300px;
        }

        .search-input {
          width: 100%;
          padding: 12px 45px 12px 15px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-icon {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }

        @media (max-width: 768px) {
          .view-controls {
            flex-direction: column;
            gap: 20px;
          }

          .search-box {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewControls;