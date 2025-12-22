import React from 'react';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  staffInfo: any;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ staffInfo, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="header">
        <h1>POS Dashboard</h1>
        <div className="nav-buttons">
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <h2>Welcome, {staffInfo?.name || 'Staff Member'}</h2>
          <p>Staff ID: {staffInfo?.id || 'N/A'}</p>
          <p>Role: {staffInfo?.role || 'Staff'}</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card" onClick={() => navigate('/payment')}>
            <h3>💳 Process Payment</h3>
            <p>Process ticket purchases and handle payments</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/nfc-assignment')}>
            <h3>📱 NFC Card Assignment</h3>
            <p>Assign NFC cards to fans with deposit collection</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/refund')}>
            <h3>💰 Process Refund</h3>
            <p>Handle end-of-match refunds for tickets and deposits</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
