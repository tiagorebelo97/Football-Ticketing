import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface PaymentProps {
  staffInfo: any;
  onLogout: () => void;
}

const Payment: React.FC<PaymentProps> = ({ staffInfo, onLogout }) => {
  const navigate = useNavigate();
  const [matchId, setMatchId] = useState('');
  const [fanId, setFanId] = useState('');
  const [ticketType, setTicketType] = useState('standard');
  const [amount, setAmount] = useState('');
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
      const response = await axios.post(`${API_URL}/payments/process`, {
        matchId,
        fanId,
        ticketType,
        amount: parseFloat(amount),
        staffId: staffInfo.id
      });

      if (response.data.success) {
        setSuccess('Payment processed successfully!');
        setMatchId('');
        setFanId('');
        setAmount('');
      } else {
        setError(response.data.message || 'Payment processing failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="header">
        <h1>Process Payment</h1>
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
          <h2>Payment Processing</h2>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="matchId">Match ID</label>
              <input
                type="text"
                id="matchId"
                value={matchId}
                onChange={(e) => setMatchId(e.target.value)}
                placeholder="Enter Match ID"
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
              <label htmlFor="ticketType">Ticket Type</label>
              <select
                id="ticketType"
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value)}
                disabled={loading}
              >
                <option value="standard">Standard</option>
                <option value="vip">VIP</option>
                <option value="student">Student</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount (€)</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="button-primary"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Process Payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Payment;
