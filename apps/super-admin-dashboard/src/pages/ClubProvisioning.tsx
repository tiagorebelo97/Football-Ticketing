import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ClubProvisioning: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logoUrl: '',
    primaryColor: '#4facfe',
    secondaryColor: '#00f2fe',
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
      setSuccess('Initialization protocols complete. Hub provisioned.');
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Provisioning sequence interrupted');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <div className="glass-card" style={{ padding: '48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 className="text-gradient" style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>
            Provision New Hub
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '15px' }}>
            Register a new club entity within the platform ecosystem. This will automatically synthesize Keycloak realms and financial pipelines.
          </p>
        </div>

        {error && (
          <div className="glass-effect" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', marginBottom: '32px', fontSize: '14px' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="glass-effect" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', marginBottom: '32px', fontSize: '14px' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '48px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Entity Designation (Club Name)</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                required
                className="glass-effect"
                style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', color: 'white', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}
                placeholder="e.g., Manchester United FC"
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Identifier Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                required
                pattern="[a-z0-9-]+"
                className="glass-effect"
                style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', color: 'white', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}
                placeholder="e.g., manchester-united"
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Visual Asset (Logo URL)</label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="glass-effect"
                style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', color: 'white', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}
                placeholder="https://assets.hub.com/logo.png"
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Primary Spectrum</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, primaryColor: e.target.value })}
                  style={{ width: '40px', height: '40px', padding: '0', border: 'none', background: 'transparent', cursor: 'pointer' }}
                />
                <span style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--text-muted)' }}>{formData.primaryColor.toUpperCase()}</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Secondary Spectrum</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  style={{ width: '40px', height: '40px', padding: '0', border: 'none', background: 'transparent', cursor: 'pointer' }}
                />
                <span style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--text-muted)' }}>{formData.secondaryColor.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <button
              type="button"
              className="premium-btn premium-btn-secondary"
              onClick={() => navigate('/')}
              style={{ flex: 1, padding: '16px' }}
            >
              Abort Mission
            </button>
            <button
              type="submit"
              className="premium-btn premium-btn-primary"
              disabled={loading}
              style={{ flex: 2, padding: '16px' }}
            >
              {loading ? 'Initializing...' : 'Commit Provisioning'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClubProvisioning;
