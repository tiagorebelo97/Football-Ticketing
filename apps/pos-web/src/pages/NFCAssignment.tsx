import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface NFCAssignmentProps {
  staffInfo: any;
  onLogout: () => void;
}

const NFCAssignment: React.FC<NFCAssignmentProps> = ({ staffInfo, onLogout }) => {
  const navigate = useNavigate();
  const [nfcCardId, setNfcCardId] = useState('');
  const [fanId, setFanId] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = process.env.REACT_APP_POS_API_URL || 'http://pos-api.localhost/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/payments/assign-nfc`, {
        nfcCardId,
        fanId,
        depositAmount: parseFloat(depositAmount),
        staffId: staffInfo.id
      });

      if (response.data.success) {
        setSuccess('NFC card assigned successfully!');
        setNfcCardId('');
        setFanId('');
        setDepositAmount('');
      } else {
        setError(response.data.message || 'NFC card assignment failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign NFC card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="header">
        <h1>NFC Card Assignment</h1>
        <div className="nav-buttons">
          <button className="nav-button" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '20px auto' }}>
          <h2>Assign NFC Card to Fan</h2>

          <div className="info-box">
            <p><strong>Note:</strong> In the Android app, you would scan the NFC card. For the web version, please enter the NFC Card ID manually.</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nfcCardId">NFC Card ID</label>
              <input
                type="text"
                id="nfcCardId"
                value={nfcCardId}
                onChange={(e) => setNfcCardId(e.target.value)}
                placeholder="Enter NFC Card ID"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fanId">Fan ID</label>
              <input
                type="text"
                id="fanId"
                value={fanId}
                onChange={(e) => setFanId(e.target.value)}
                placeholder="Enter Fan ID"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="depositAmount">Deposit Amount (€)</label>
              <input
                type="number"
                id="depositAmount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                disabled={loading}
              />
              <small style={{ color: '#7f8c8d', display: 'block', marginTop: '5px' }}>
                This deposit is refundable when the card is returned
              </small>
            </div>

            <button 
              type="submit" 
              className="button-primary"
              disabled={loading}
            >
              {loading ? 'Assigning...' : 'Assign NFC Card'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NFCAssignment;
