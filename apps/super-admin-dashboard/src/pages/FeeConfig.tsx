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
      setSuccess('Monetary parameters calibrated.');
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Calibration sequence failed');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
      <div className="glass-card" style={{ padding: '48px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 className="text-gradient" style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>
            Fee Calibration
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '15px' }}>
            Adjust the financial leakage and fixed costs for this hub entity.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '32px', marginBottom: '48px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Platform Tax (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.platformFeePercentage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, platformFeePercentage: parseFloat(e.target.value) })}
                required
                min="0"
                max="100"
                className="glass-effect"
                style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', color: 'white', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}
              />
              <p style={{ color: 'var(--text-dim)', fontSize: '12px', marginTop: '8px' }}>Global percentage deducted per transaction</p>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Fixed Processing ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.transactionFeeFixed}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, transactionFeeFixed: parseFloat(e.target.value) })}
                required
                min="0"
                className="glass-effect"
                style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', color: 'white', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}
              />
              <p style={{ color: 'var(--text-dim)', fontSize: '12px', marginTop: '8px' }}>Flat rate applied to every processed unit</p>
            </div>
          </div>

          {error && <div className="glass-effect" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', marginBottom: '32px', fontSize: '14px' }}>{error}</div>}
          {success && <div className="glass-effect" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', marginBottom: '32px', fontSize: '14px' }}>{success}</div>}

          <div style={{ display: 'flex', gap: '20px' }}>
            <button
              type="button"
              className="premium-btn premium-btn-secondary"
              onClick={() => navigate('/')}
              style={{ flex: 1, padding: '16px' }}
            >
              Abort
            </button>
            <button
              type="submit"
              className="premium-btn premium-btn-primary"
              disabled={loading}
              style={{ flex: 2, padding: '16px' }}
            >
              {loading ? 'Transmitting...' : 'Commit Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeeConfig;
