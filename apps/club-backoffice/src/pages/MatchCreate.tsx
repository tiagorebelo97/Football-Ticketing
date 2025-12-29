import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MatchCreate: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
      if (!user?.clubId) {
        throw new Error('User not authenticated correctly');
      }

      await axios.post('/api/matches', {
        ...formData,
        clubId: user.clubId
      });
      navigate('/matches'); // Redirect to match list after creation
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to create match');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card">
        <h2 style={{ marginBottom: '20px', color: 'var(--color-secondary)' }}>Create New Match</h2>

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
            <button type="submit" className="btn btn-success" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Creating...' : 'Create Match'}
            </button>
            <button
              type="button"
              className="btn"
              style={{ background: '#ecf0f1', color: '#2c3e50' }}
              onClick={() => navigate('/matches')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MatchCreate;
