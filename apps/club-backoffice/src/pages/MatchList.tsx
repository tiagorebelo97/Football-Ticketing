import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  const navigate = useNavigate();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const clubId = 'demo-club-id'; // Would come from auth
      const response = await axios.get(`/api/matches?clubId=${clubId}`);
      setMatches(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load matches');
      setLoading(false);
    }
  };

  const handleCancelMatch = async (matchId: string) => {
    if (!confirm('Are you sure you want to cancel this match?')) return;

    try {
      await axios.delete(`/api/matches/${matchId}`);
      loadMatches();
    } catch (err) {
      alert('Failed to cancel match');
    }
  };

  if (loading) return <div className="loading">Loading matches...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Matches Management</h2>
        <button className="btn btn-success" onClick={() => navigate('/create-match')}>
          + Create Match
        </button>
      </div>

      {matches.length === 0 ? (
        <p>No matches scheduled. <a href="/create-match">Create your first match</a></p>
      ) : (
        <div className="matches-list">
          {matches.map((match) => (
            <div key={match.id} className="match-card">
              <div className="match-teams">
                {match.home_team} vs {match.away_team}
              </div>
              <div className="match-info">
                📅 {new Date(match.match_date).toLocaleString()}
              </div>
              <div className="match-info">📍 {match.venue}</div>
              <div className="match-info">
                👥 Attendance: {match.current_attendance} / {match.total_capacity}
              </div>
              <div className="match-info">💰 Price: ${match.ticket_price.toFixed(2)}</div>
              <div className="match-info">
                Status: <strong>{match.status.toUpperCase()}</strong>
              </div>
              <div style={{ marginTop: '15px' }}>
                <button
                  className="btn btn-danger"
                  onClick={() => handleCancelMatch(match.id)}
                  disabled={match.status === 'cancelled'}
                >
                  Cancel Match
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
