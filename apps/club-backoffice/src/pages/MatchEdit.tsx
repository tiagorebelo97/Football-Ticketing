import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  venue: string;
  total_capacity: number;
  ticket_price: number;
  status: string;
}

const MatchEdit: React.FC = () => {
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMatch = async () => {
      try {
        if (!user?.clubId || !matchId) return;

        const response = await axios.get(`/api/matches?clubId=${user.clubId}`);
        const match = response.data.find((m: Match) => m.id === matchId);

        if (match) {
          // Convert date to datetime-local format
          const date = new Date(match.match_date);
          const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);

          setFormData({
            homeTeam: match.home_team,
            awayTeam: match.away_team,
            matchDate: localDate,
            venue: match.venue || '',
            totalCapacity: match.total_capacity,
            ticketPrice: Number(match.ticket_price),
          });
        } else {
          setError(t('matches.loadError'));
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(t('matches.loadError'));
        setLoading(false);
      }
    };

    loadMatch();
  }, [user?.clubId, matchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await axios.put(`/api/matches/${matchId}`, formData);
      navigate('/matches');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || t('matches.cancelError'));
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading" style={{ textAlign: 'center', marginTop: '50px' }}>{t('matches.loading')}</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="font-premium text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>
          {t('matches.edit')}
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
              disabled={saving}
              style={{ padding: '12px 24px' }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="premium-btn premium-btn-primary"
              disabled={saving}
              style={{ padding: '12px 32px' }}
            >
              {saving ? `${t('common.loading')}...` : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MatchEdit;
