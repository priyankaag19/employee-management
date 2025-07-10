import React from 'react';

const Loading = () => (
  <div className="loading">
    <div className="spinner"></div>
    <p>Loading employees...</p>
    <style>{`
      .loading {
        text-align: center;
        padding: 50px;
        color: #fff;
        font-size: 18px;
      }
      .spinner {
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-top: 3px solid white;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default Loading;
