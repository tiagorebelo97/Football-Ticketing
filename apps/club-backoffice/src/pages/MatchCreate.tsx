import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const MatchCreate: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    homeTeam: '',
    awayTeam: '',
    matchDate: '',
    venue: '',
    totalCapacity: 1000,
    ticketPrice: 25.00,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user?.clubId) {
        throw new Error('User not authenticated correctly');
      }

      await axios.post('/api/matches', {
        ...formData,
        clubId: user.clubId
      });
      navigate('/matches'); // Redirect to match list after creation
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || t('matches.loadError'));
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="font-premium text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>
          {t('matches.create')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          {t('matches.subtitle')}
        </p>
      </div>

      <div className="glass-card" style={{ padding: '32px' }}>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>{t('matches.form.homeTeam')} *</label>
              <input
                type="text"
                className="form-input"
                value={formData.homeTeam}
                onChange={(e) => setFormData({ ...formData, homeTeam: e.target.value })}
                required
                placeholder="e.g., Manchester United"
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>{t('matches.form.awayTeam')} *</label>
              <input
                type="text"
                className="form-input"
                value={formData.awayTeam}
                onChange={(e) => setFormData({ ...formData, awayTeam: e.target.value })}
                required
                placeholder="e.g., Liverpool FC"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>{t('matches.form.kickoff')} *</label>
              <input
                type="datetime-local"
                className="form-input"
                value={formData.matchDate}
                onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>{t('matches.form.venue')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g., Old Trafford"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>{t('matches.form.attendance')} *</label>
              <input
                type="number"
                className="form-input"
                value={formData.totalCapacity}
                onChange={(e) => setFormData({ ...formData, totalCapacity: parseInt(e.target.value) || 0 })}
                required
                min="1"
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>{t('matches.form.ticketPrice')} (€) *</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.ticketPrice}
                onChange={(e) => setFormData({ ...formData, ticketPrice: parseFloat(e.target.value) || 0 })}
                required
                min="0"
              />
            </div>
          </div>

          {error && (
            <div style={{
              color: '#ef4444',
              marginBottom: '24px',
              padding: '16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px' }}>
            <button
              type="button"
              className="premium-btn premium-btn-secondary"
              onClick={() => navigate('/matches')}
              disabled={loading}
              style={{ padding: '12px 24px' }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="premium-btn premium-btn-primary"
              disabled={loading}
              style={{ padding: '12px 32px' }}
            >
              {loading ? `${t('common.loading')}...` : t('matches.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MatchCreate;
