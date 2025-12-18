import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  venue: string;
  ticket_price: number;
  total_capacity: number;
  current_attendance: number;
}

const MatchCalendar: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const response = await axios.get('/api/matches');
      setMatches(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load matches');
      setLoading(false);
    }
  };

  const handleBuyTicket = (matchId: string) => {
    navigate(`/checkout/${matchId}`);
  };

  if (loading) return <div className="loading">Loading matches...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>Upcoming Matches</h2>
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
              💰 ${match.ticket_price.toFixed(2)}
            </div>
            <div className="match-info">
              👥 {match.current_attendance} / {match.total_capacity} attendees
            </div>
            <button
              className="btn"
              onClick={() => handleBuyTicket(match.id)}
            >
              Buy Ticket
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchCalendar;
