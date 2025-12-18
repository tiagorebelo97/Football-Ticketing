import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  venue: string;
  ticket_price: number;
}

const TicketCheckout: React.FC = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [includeDeposit, setIncludeDeposit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMatch();
  }, [matchId]);

  const loadMatch = async () => {
    try {
      const response = await axios.get(`/api/matches/${matchId}`);
      setMatch(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load match');
      setLoading(false);
    }
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      const response = await axios.post('/api/tickets/purchase', {
        matchId,
        includeDeposit,
        userId: 'demo-user-id', // Would come from auth
      });

      // In a real app, you would handle Stripe payment here
      alert('Ticket purchased successfully!');
      navigate(`/ticket/${response.data.ticket.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Purchase failed');
      setProcessing(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error && !match) return <div className="error">{error}</div>;
  if (!match) return <div className="error">Match not found</div>;

  const depositAmount = 5.00;
  const totalAmount = match.ticket_price + (includeDeposit ? depositAmount : 0);

  return (
    <div className="checkout-form">
      <h2>Ticket Checkout</h2>
      <div className="match-info">
        <h3>{match.home_team} vs {match.away_team}</h3>
        <p>📅 {new Date(match.match_date).toLocaleString()}</p>
        <p>📍 {match.venue}</p>
      </div>

      <form onSubmit={handlePurchase}>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={includeDeposit}
              onChange={(e) => setIncludeDeposit(e.target.checked)}
            />
            {' '}Include NFC Card Deposit (${depositAmount.toFixed(2)})
          </label>
        </div>

        <div className="form-group">
          <h3>Total: ${totalAmount.toFixed(2)}</h3>
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" className="btn" disabled={processing}>
          {processing ? 'Processing...' : 'Complete Purchase (3-Click Checkout)'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/')}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default TicketCheckout;
