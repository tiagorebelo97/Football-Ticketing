
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  current_attendance: number;
  ticket_price: number;
  status: string;
}

const MatchList: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadMatches = useCallback(async () => {
    if (!user?.clubId) return;

    try {
      // Use API URL from env or proxy, but direct axios call here relies on proxy
      // The webpack proxy/vite proxy handles /api -> localhost:3002
      // We append clubId to the query
      const response = await axios.get(`/api/matches?clubId=${user.clubId}`);
      setMatches(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(t('matches.loadError'));
      setLoading(false);
    }
  }, [user?.clubId]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const handleCancelMatch = async (matchId: string) => {
    if (!window.confirm(t('matches.confirmCancel'))) return;

    try {
      await axios.delete(`/api/matches/${matchId}`);
      loadMatches();
    } catch (err) {
      window.alert(t('matches.cancelError'));
    }
  };

  if (loading) return <div className="loading" style={{ textAlign: 'center', marginTop: '50px' }}>{t('matches.loading')}</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="font-premium" style={{ margin: 0, color: 'var(--text-main)', fontSize: '2.5rem', fontWeight: 800 }}>{t('matches.title')}</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '1.1rem' }}>{t('matches.subtitle')}</p>
        </div>
        <button className="premium-btn premium-btn-primary" onClick={() => navigate('/create-match')}>
          + {t('matches.create')}
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <h3 className="font-premium">{t('matches.noMatches')}</h3>
          <p style={{ color: 'var(--text-muted)' }}>{t('matches.noMatchesDesc')}</p>
          <Link to="/create-match" className="premium-btn premium-btn-primary" style={{ display: 'inline-block', marginTop: '20px' }}>{t('matches.createFirst')}</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {matches.map((match) => (
            <div key={match.id} className="glass-card" style={{
              transition: 'all 0.3s ease',
              borderTop: '4px solid var(--accent-primary)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div className="font-premium" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', flex: 1 }}>
                  {match.home_team}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                    <div style={{ height: '1px', flex: 1, background: 'var(--border-glass)' }}></div>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{t('matches.vs')}</span>
                    <div style={{ height: '1px', flex: 1, background: 'var(--border-glass)' }}></div>
                  </div>
                  {match.away_team}
                </div>
                <span style={{
                  padding: '6px 14px',
                  borderRadius: '12px',
                  background: match.status === 'scheduled' ? 'rgba(0, 242, 254, 0.1)' : (match.status === 'ongoing' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)'),
                  color: match.status === 'scheduled' ? 'var(--accent-primary)' : (match.status === 'ongoing' ? '#22c55e' : 'var(--text-muted)'),
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  border: `1px solid ${match.status === 'scheduled' ? 'rgba(0, 242, 254, 0.2)' : (match.status === 'ongoing' ? 'rgba(34, 197, 94, 0.2)' : 'var(--border-glass)')}`
                }}>
                  {match.status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--text-main)' }}>
                  <span style={{ color: 'var(--accent-primary)', fontSize: '16px' }}>📅</span>
                  <span style={{ fontWeight: 500 }}>{new Date(match.match_date).toLocaleDateString()}</span>
                  <span style={{ color: 'var(--text-muted)' }}>•</span>
                  <span style={{ color: 'var(--accent-secondary)' }}>{new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--text-main)' }}>
                  <span style={{ color: 'var(--accent-primary)', fontSize: '16px' }}>📍</span> {match.venue}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--text-main)' }}>
                  <span style={{ color: 'var(--accent-primary)', fontSize: '16px' }}>👥</span>
                  <span>{match.current_attendance.toLocaleString()} / {match.total_capacity.toLocaleString()} {t('matches.table.fans')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--text-main)' }}>
                  <span style={{ color: 'var(--accent-primary)', fontSize: '16px' }}>💰</span>
                  <span className="text-gradient" style={{ fontWeight: 700, fontSize: '16px' }}>€{Number(match.ticket_price).toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="premium-btn premium-btn-secondary"
                  style={{ flex: 1, fontSize: '14px', padding: '10px' }}
                  onClick={() => navigate(`/matches/${match.id}/edit`)}
                >
                  {t('matches.edit')}
                </button>
                <button
                  className="premium-btn"
                  style={{
                    flex: 1,
                    fontSize: '14px',
                    padding: '10px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                  }}
                  onClick={() => handleCancelMatch(match.id)}
                  disabled={match.status === 'cancelled'}
                >
                  {t('matches.cancel')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchList;
