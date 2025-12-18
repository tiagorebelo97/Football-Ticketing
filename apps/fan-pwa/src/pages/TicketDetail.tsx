import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface TicketDetail {
  id: string;
  ticket_number: string;
  qr_code_data: string;
  qrCode: string;
  home_team: string;
  away_team: string;
  match_date: string;
  venue: string;
  status: string;
  price: number;
}

const TicketDetail: React.FC = () => {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      const response = await axios.get(`/api/tickets/${ticketId}`);
      setTicket(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load ticket');
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading ticket...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!ticket) return <div className="error">Ticket not found</div>;

  return (
    <div>
      <h2>Ticket Details</h2>
      <div className="ticket-card">
        <div className="match-teams">
          {ticket.home_team} vs {ticket.away_team}
        </div>
        <div className="match-info">
          🎫 Ticket: {ticket.ticket_number}
        </div>
        <div className="match-info">
          📅 {new Date(ticket.match_date).toLocaleString()}
        </div>
        <div className="match-info">📍 {ticket.venue}</div>
        <div className="match-info">
          💰 ${ticket.price.toFixed(2)}
        </div>
        <div className="match-info">
          Status: <strong>{ticket.status.toUpperCase()}</strong>
        </div>
        
        {ticket.status === 'active' && (
          <div className="qr-code-container">
            <h3>Scan this QR code at the gate</h3>
            <img src={ticket.qrCode} alt="Ticket QR Code" />
            <p style={{ fontSize: '0.8rem', color: '#666' }}>
              Code: {ticket.qr_code_data}
            </p>
            <p style={{ marginTop: '20px', color: '#28a745' }}>
              ✓ This ticket supports NFC entry
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetail;
