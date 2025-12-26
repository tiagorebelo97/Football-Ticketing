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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setSuccess('Asset inventory synchronized.');
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Synchronization failure');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
      <div className="glass-card" style={{ padding: '48px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 className="text-gradient" style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>
            NFC Inventory Control
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '15px' }}>
            Configure the physical hardware stock and associated deposits for this entity.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '32px', marginBottom: '48px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Sentinel Units (Total Cards)</label>
              <input
                type="number"
                value={formData.totalCards}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, totalCards: parseInt(e.target.value) })}
                required
                min="0"
                className="glass-effect"
                style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', color: 'white', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}
                placeholder="0"
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Collateral Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.depositAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, depositAmount: parseFloat(e.target.value) })}
                required
                min="0"
                className="glass-effect"
                style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', color: 'white', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}
                placeholder="5.00"
              />
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

export default NFCStockConfig;
