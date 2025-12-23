
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
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
      setError('Failed to load matches');
      setLoading(false);
    }
  }, [user?.clubId]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const handleCancelMatch = async (matchId: string) => {
    if (!window.confirm('Are you sure you want to cancel this match?')) return;

    try {
      await axios.delete(`/api/matches/${matchId}`);
      loadMatches();
    } catch (err) {
      window.alert('Failed to cancel match');
    }
  };

  if (loading) return <div className="loading" style={{ textAlign: 'center', marginTop: '50px' }}>Running plays...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-secondary)' }}>Matches</h2>
          <p style={{ margin: '5px 0 0', color: 'var(--color-text-light)' }}>Manage your season schedule</p>
        </div>
        <button className="btn btn-success" onClick={() => navigate('/create-match')}>
          + New Match
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
          <h3>No matches scheduled</h3>
          <p>Get ready for the season by adding your first match.</p>
          <Link to="/create-match" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '10px' }}>Create Match</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
          {matches.map((match) => (
            <div key={match.id} className="card" style={{ transition: 'transform 0.2s', borderTop: '4px solid var(--color-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-secondary)' }}>
                  {match.home_team}
                  <span style={{ display: 'block', fontSize: '14px', color: 'var(--color-text-light)', fontWeight: 'normal', margin: '4px 0' }}>vs</span>
                  {match.away_team}
                </div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  backgroundColor: match.status === 'scheduled' ? '#e3f2fd' : (match.status === 'ongoing' ? '#e8f5e9' : '#f5f5f5'),
                  color: match.status === 'scheduled' ? '#1565c0' : (match.status === 'ongoing' ? '#2e7d32' : '#616161'),
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {match.status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#555' }}>
                  <span>📅</span> {new Date(match.match_date).toLocaleDateString()} at {new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#555' }}>
                  <span>📍</span> {match.venue}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#555' }}>
                  <span>👥</span> {match.current_attendance} / {match.total_capacity} fans
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#555' }}>
                  <span>💰</span> €{Number(match.ticket_price).toFixed(2)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-primary" style={{ flex: 1, fontSize: '14px' }}>Edit</button>
                <button
                  className="btn btn-outline-danger"
                  style={{ flex: 1, fontSize: '14px' }}
                  onClick={() => handleCancelMatch(match.id)}
                  disabled={match.status === 'cancelled'}
                >
                  Cancel
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
