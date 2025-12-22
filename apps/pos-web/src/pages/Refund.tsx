import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface RefundProps {
  staffInfo: any;
  onLogout: () => void;
}

const Refund: React.FC<RefundProps> = ({ staffInfo, onLogout }) => {
  const navigate = useNavigate();
  const [refundType, setRefundType] = useState('ticket');
  const [ticketId, setTicketId] = useState('');
  const [nfcCardId, setNfcCardId] = useState('');
  const [reason, setReason] = useState('');
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
      const response = await axios.post(`${API_URL}/refunds`, {
        refundType,
        ticketId: refundType === 'ticket' || refundType === 'both' ? ticketId : undefined,
        nfcCardId: refundType === 'deposit' || refundType === 'both' ? nfcCardId : undefined,
        reason,
        staffId: staffInfo.id
      });

      if (response.data.success) {
        setSuccess(`Refund processed successfully! Amount: €${response.data.refundAmount}`);
        setTicketId('');
        setNfcCardId('');
        setReason('');
      } else {
        setError(response.data.message || 'Refund processing failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process refund');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="header">
        <h1>Process Refund</h1>
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
          <h2>Refund Processing</h2>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="refundType">Refund Type</label>
              <select
                id="refundType"
                value={refundType}
                onChange={(e) => setRefundType(e.target.value)}
                disabled={loading}
              >
                <option value="ticket">Ticket Only</option>
                <option value="deposit">Deposit Only (NFC Card Return)</option>
                <option value="both">Both Ticket and Deposit</option>
              </select>
            </div>

            {(refundType === 'ticket' || refundType === 'both') && (
              <div className="form-group">
                <label htmlFor="ticketId">Ticket ID</label>
                <input
                  type="text"
                  id="ticketId"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="Enter Ticket ID"
                  required
                  disabled={loading}
                />
              </div>
            )}

            {(refundType === 'deposit' || refundType === 'both') && (
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
                <small style={{ color: '#7f8c8d', display: 'block', marginTop: '5px' }}>
                  In the Android app, you would scan the NFC card
                </small>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="reason">Reason</label>
              <input
                type="text"
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter refund reason"
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="button-primary"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Process Refund'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Refund;
