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

  if (loading) return <div className="loading">Loading clubs...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Clubs Management</h2>
        <button className="btn btn-success" onClick={() => navigate('/provision')}>
          + Provision New Club
        </button>
      </div>
      
      {clubs.length === 0 ? (
        <p>No clubs provisioned yet. <a href="/provision">Create your first club</a></p>
      ) : (
        <div className="clubs-list">
          {clubs.map((club) => (
            <div key={club.id} className="club-card">
              <div className="club-header">
                <div className="club-name">{club.name}</div>
                <div>
                  <span style={{
                    padding: '5px 10px',
                    borderRadius: '4px',
                    background: club.is_active ? '#d4edda' : '#f8d7da',
                    color: club.is_active ? '#155724' : '#721c24',
                    fontSize: '0.9rem'
                  }}>
                    {club.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="club-info">🔑 Slug: {club.slug}</div>
              <div className="club-info">🔐 Keycloak Realm: {club.keycloak_realm_id}</div>
              <div className="club-info">💳 Stripe Account: {club.stripe_account_id || 'Not configured'}</div>
              <div className="club-info">📅 Created: {new Date(club.created_at).toLocaleDateString()}</div>
              <div style={{ marginTop: '15px' }}>
                <button
                  className="btn"
                  onClick={() => navigate(`/nfc-config/${club.id}`)}
                >
                  NFC Stock Config
                </button>
                <button
                  className="btn btn-warning"
                  onClick={() => navigate(`/fee-config/${club.id}`)}
                >
                  Fee Config
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
