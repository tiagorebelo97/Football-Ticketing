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
  nfc_card_id?: string;
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
            <h3>🎟️ Your Entry Pass</h3>
            <div style={{ 
              background: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              <img 
                src={ticket.qrCode} 
                alt="Ticket QR Code" 
                style={{ 
                  width: '100%', 
                  maxWidth: '300px',
                  border: '4px solid #fff',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </div>
            
            <div style={{ 
              background: '#e7f3ff', 
              padding: '15px', 
              borderRadius: '8px',
              marginTop: '15px',
              border: '1px solid #b3d9ff'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>
                📱 Entry Options:
              </h4>
              <p style={{ margin: '8px 0', fontSize: '0.95rem' }}>
                <strong>✓ QR Code Entry:</strong> Show this QR code at the gate for scanning
              </p>
              {ticket.nfc_card_id && (
                <p style={{ margin: '8px 0', fontSize: '0.95rem' }}>
                  <strong>✓ NFC Card Entry:</strong> Tap your NFC card at the gate
                </p>
              )}
              {!ticket.nfc_card_id && (
                <p style={{ 
                  margin: '8px 0', 
                  fontSize: '0.85rem', 
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  QR code ready for entry - No NFC card required
                </p>
              )}
            </div>
            
            <p style={{ 
              fontSize: '0.8rem', 
              color: '#666',
              marginTop: '15px',
              textAlign: 'center'
            }}>
              Ticket Code: {ticket.qr_code_data}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetail;
