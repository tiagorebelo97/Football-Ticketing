import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Club {
  id: string;
  name: string;
  slug: string;
  keycloak_realm_id: string;
  stripe_account_id: string;
  is_active: boolean;
  created_at: string;
}

const ClubList: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      const response = await axios.get('/api/clubs');
      setClubs(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load clubs');
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--text-muted)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="text-gradient" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Scanning Network...</div>
        <p>Retrieving provisioned clubs</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="glass-card" style={{ padding: '40px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
      <div style={{ color: '#ef4444', fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
      <h3 style={{ color: '#ef4444', marginBottom: '8px' }}>System Error</h3>
      <p style={{ color: 'var(--text-muted)' }}>{error}</p>
      <button onClick={loadClubs} className="premium-btn premium-btn-secondary" style={{ marginTop: '24px' }}>Retry Connection</button>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>Infrastructure</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Manage and monitor all platform-integrated clubs</p>
        </div>
        <button className="premium-btn premium-btn-primary" onClick={() => navigate('/provision')}>
          + Provision New Entity
        </button>
      </div>

      {clubs.length === 0 ? (
        <div className="glass-card" style={{ padding: '80px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.5 }}>🏢</div>
          <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>No Clubs Provisioned</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 32px auto' }}>Your platform is ready but currently empty. Start by provisioning your first club entity.</p>
          <button className="premium-btn premium-btn-primary" onClick={() => navigate('/provision')}>Create First Entity</button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '32px'
        }}>
          {clubs.map((club) => (
            <div key={club.id} className="glass-card" style={{ overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '32px 32px 24px 32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>{club.name}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-dim)', fontStyle: 'italic' }}>/{club.slug}</p>
                  </div>
                  <span className={`badge ${club.is_active ? 'badge-success' : 'badge-warning'}`}>
                    {club.is_active ? 'Connected' : 'Offline'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Identity</span>
                    <code style={{ color: 'var(--accent-secondary)' }}>{club.id.split('-').pop()}</code>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Payment Gateway</span>
                    <span style={{ color: club.stripe_account_id ? 'var(--text-main)' : 'var(--text-dim)' }}>
                      {club.stripe_account_id ? 'Active (Stripe)' : 'Not Set'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Joined Registry</span>
                    <span style={{ color: 'var(--text-main)' }}>{new Date(club.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: 'auto',
                padding: '24px 32px',
                background: 'rgba(255,255,255,0.02)',
                borderTop: '1px solid var(--border-glass)',
                display: 'flex',
                gap: '12px'
              }}>
                <button
                  className="premium-btn premium-btn-secondary"
                  style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                  onClick={() => navigate(`/nfc-config/${club.id}`)}
                >
                  NFC Engine
                </button>
                <button
                  className="premium-btn premium-btn-secondary"
                  style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                  onClick={() => navigate(`/fee-config/${club.id}`)}
                >
                  Fee Matrix
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClubList;
