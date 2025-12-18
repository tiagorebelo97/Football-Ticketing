import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ClubProvisioning: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logoUrl: '',
    primaryColor: '#0066cc',
    secondaryColor: '#ffffff',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/clubs', formData);
      setSuccess('Club provisioned successfully! Keycloak realm and Stripe account created.');
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to provision club');
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Provision New Club</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        This will automatically create a Keycloak realm and Stripe connected account for the club.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Club Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="e.g., Manchester United FC"
          />
        </div>

        <div className="form-group">
          <label>Slug * (lowercase, hyphens only)</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
            required
            pattern="[a-z0-9-]+"
            placeholder="e.g., manchester-united"
          />
        </div>

        <div className="form-group">
          <label>Logo URL (optional)</label>
          <input
            type="url"
            value={formData.logoUrl}
            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
            placeholder="https://example.com/logo.png"
          />
        </div>

        <div className="form-group">
          <label>Primary Color</label>
          <input
            type="color"
            value={formData.primaryColor}
            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Secondary Color</label>
          <input
            type="color"
            value={formData.secondaryColor}
            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
          />
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? 'Provisioning...' : 'Provision Club'}
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

export default ClubProvisioning;
