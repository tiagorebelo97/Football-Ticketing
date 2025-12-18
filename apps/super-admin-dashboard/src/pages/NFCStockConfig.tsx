import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const NFCStockConfig: React.FC = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    totalCards: 0,
    depositAmount: 5.00,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadConfig();
  }, [clubId]);

  const loadConfig = async () => {
    try {
      const response = await axios.get(`/api/nfc-stock/${clubId}`);
      setFormData({
        totalCards: response.data.total_cards,
        depositAmount: response.data.deposit_amount,
      });
    } catch (err) {
      // Config doesn't exist yet, use defaults
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(`/api/nfc-stock/${clubId}`, formData);
      setSuccess('NFC stock configuration updated successfully!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update configuration');
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>NFC Stock Configuration</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Total NFC Cards</label>
          <input
            type="number"
            value={formData.totalCards}
            onChange={(e) => setFormData({ ...formData, totalCards: parseInt(e.target.value) })}
            required
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Deposit Amount ($)</label>
          <input
            type="number"
            step="0.01"
            value={formData.depositAmount}
            onChange={(e) => setFormData({ ...formData, depositAmount: parseFloat(e.target.value) })}
            required
            min="0"
          />
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? 'Saving...' : 'Save Configuration'}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => navigate('/')}
          disabled={loading}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default NFCStockConfig;
