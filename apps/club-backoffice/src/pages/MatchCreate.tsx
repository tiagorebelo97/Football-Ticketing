import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MatchCreate: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    homeTeam: '',
    awayTeam: '',
    matchDate: '',
    venue: '',
    totalCapacity: 1000,
    ticketPrice: 25.00,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const clubId = 'demo-club-id'; // Would come from auth
      await axios.post('/api/matches', { ...formData, clubId });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create match');
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Create New Match</h2>

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
            onChange={(e) => setFormData({ ...formData, totalCapacity: parseInt(e.target.value) })}
            required
            min="1"
          />
        </div>

        <div className="form-group">
          <label>Ticket Price ($) *</label>
          <input
            type="number"
            step="0.01"
            value={formData.ticketPrice}
            onChange={(e) => setFormData({ ...formData, ticketPrice: parseFloat(e.target.value) })}
            required
            min="0"
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? 'Creating...' : 'Create Match'}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => navigate('/')}
          disabled={loading}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default MatchCreate;
