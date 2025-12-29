import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
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
          setError('Match not found');
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load match');
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
      setError(err.response?.data?.error || 'Failed to update match');
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading" style={{ textAlign: 'center', marginTop: '50px' }}>Loading match...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card">
        <h2 style={{ marginBottom: '20px', color: 'var(--color-secondary)' }}>Edit Match</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Home Team *</label>
            <input
              type="text"
              value={formData.homeTeam}
              onChange={(e) => setFormData({ ...formData, homeTeam: e.target.value })}
              required
              placeholder="e.g., Manchester United"
            />
          </div>

          <div className="form-group">
            <label>Away Team *</label>
            <input
              type="text"
              value={formData.awayTeam}
              onChange={(e) => setFormData({ ...formData, awayTeam: e.target.value })}
              required
              placeholder="e.g., Liverpool FC"
            />
          </div>

          <div className="form-group">
            <label>Match Date & Time *</label>
            <input
              type="datetime-local"
              value={formData.matchDate}
              onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Venue</label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="e.g., Old Trafford"
            />
          </div>

          <div className="form-group">
            <label>Total Capacity *</label>
            <input
              type="number"
              value={formData.totalCapacity}
              onChange={(e) => setFormData({ ...formData, totalCapacity: parseInt(e.target.value) || 0 })}
              required
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Ticket Price (€) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.ticketPrice}
              onChange={(e) => setFormData({ ...formData, ticketPrice: parseFloat(e.target.value) || 0 })}
              required
              min="0"
            />
          </div>

          {error && <div className="error" style={{ color: 'var(--color-danger)', marginBottom: '15px', padding: '10px', backgroundColor: '#fee', borderRadius: '4px' }}>{error}</div>}

          <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
            <button type="submit" className="btn btn-success" disabled={saving} style={{ flex: 1 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="btn"
              style={{ background: '#ecf0f1', color: '#2c3e50' }}
              onClick={() => navigate('/matches')}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MatchEdit;
