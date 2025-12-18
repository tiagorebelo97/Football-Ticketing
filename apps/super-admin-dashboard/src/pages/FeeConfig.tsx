import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const FeeConfig: React.FC = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    platformFeePercentage: 2.50,
    transactionFeeFixed: 0.30,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadConfig();
  }, [clubId]);

  const loadConfig = async () => {
    try {
      const response = await axios.get(`/api/fee-config/${clubId}`);
      setFormData({
        platformFeePercentage: response.data.platform_fee_percentage,
        transactionFeeFixed: response.data.transaction_fee_fixed,
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
      await axios.post(`/api/fee-config/${clubId}`, formData);
      setSuccess('Fee configuration updated successfully!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update configuration');
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Fee Configuration</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Platform Fee (%)</label>
          <input
            type="number"
            step="0.01"
            value={formData.platformFeePercentage}
            onChange={(e) => setFormData({ ...formData, platformFeePercentage: parseFloat(e.target.value) })}
            required
            min="0"
            max="100"
          />
          <small style={{ color: '#666' }}>
            Percentage of each transaction charged as platform fee
          </small>
        </div>

        <div className="form-group">
          <label>Transaction Fee (Fixed $)</label>
          <input
            type="number"
            step="0.01"
            value={formData.transactionFeeFixed}
            onChange={(e) => setFormData({ ...formData, transactionFeeFixed: parseFloat(e.target.value) })}
            required
            min="0"
          />
          <small style={{ color: '#666' }}>
            Fixed amount charged per transaction
          </small>
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

export default FeeConfig;
