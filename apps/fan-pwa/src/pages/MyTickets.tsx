import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Ticket {
  id: string;
  ticket_number: string;
  home_team: string;
  away_team: string;
  match_date: string;
  venue: string;
  status: string;
}

const MyTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const userId = 'demo-user-id'; // Would come from auth
      const response = await axios.get(`/api/tickets/user/${userId}`);
      setTickets(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load tickets');
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading tickets...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>My Tickets</h2>
      {tickets.length === 0 ? (
        <p>No tickets found. <a href="/">Browse matches</a></p>
      ) : (
        <div className="tickets-list">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="ticket-card"
              onClick={() => navigate(`/ticket/${ticket.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="match-teams">
                {ticket.home_team} vs {ticket.away_team}
              </div>
              <div className="match-info">
                🎫 {ticket.ticket_number}
              </div>
              <div className="match-info">
                📅 {new Date(ticket.match_date).toLocaleString()}
              </div>
              <div className="match-info">📍 {ticket.venue}</div>
              <div className="match-info">
                Status: <strong>{ticket.status.toUpperCase()}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
