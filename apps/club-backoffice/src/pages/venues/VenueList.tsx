import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { venueService, Venue } from '../../services/venueService';

const VenueList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadVenues();
  }, [user]);

  const loadVenues = async () => {
    if (!user?.clubId) return;

    try {
      setLoading(true);
      const data = await venueService.getVenues(user.clubId);
      setVenues(data);
      setError('');
    } catch (err: any) {
      console.error('Error loading venues:', err);
      setError('Erro ao carregar venues');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (venueId: string) => {
    if (!window.confirm('Tem certeza que deseja eliminar esta venue?')) {
      return;
    }

    try {
      setDeletingId(venueId);
      await venueService.deleteVenue(venueId);
      await loadVenues();
    } catch (err: any) {
      console.error('Error deleting venue:', err);
      alert('Erro ao eliminar venue');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">A carregar venues...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '0 0 40px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, color: '#ffffff', fontSize: '2.5rem' }}>Sports Venues</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Manage and configure your club's stadiums and facilities
          </p>
        </div>
        <button
          className="premium-btn premium-btn-primary"
          onClick={() => navigate('/venues/create')}
        >
          + Create New Venue
        </button>
      </div>

      {error && (
        <div className="error" style={{ marginBottom: '0' }}>
          {error}
        </div>
      )}

      {venues.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '80px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <div style={{ fontSize: '64px', opacity: 0.5 }}>🏟️</div>
          <div style={{ maxWidth: '400px' }}>
            <h2 style={{ color: '#ffffff', marginBottom: '12px' }}>No venues configured</h2>
            <p style={{ color: 'var(--text-muted)' }}>Crie a sua primeira venue para começar a gerir eventos desportivos e venda de bilhetes.</p>
          </div>
          <button
            className="premium-btn premium-btn-primary"
            onClick={() => navigate('/venues/create')}
          >
            Create Your First Venue
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {venues.map(venue => (
            <div key={venue.id} className="glass-card" style={{
              overflow: 'hidden',
              padding: '0',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              border: '1px solid var(--border-glass)'
            }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-6px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {venue.photoUrl ? (
                <div style={{ width: '100%', height: '180px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={venue.photoUrl}
                    alt={venue.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#ffffff'
                  }}>
                    {venue.sportName || 'Multi-Sports'}
                  </div>
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  height: '180px',
                  background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.1), rgba(0, 242, 254, 0.1))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  opacity: 0.5
                }}>
                  🏟️
                </div>
              )}

              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.25rem' }}>{venue.name}</h3>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                      📍 {venue.city || 'Location not set'}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-glass)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>Capacity</div>
                    <div style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>{venue.capacity?.toLocaleString() || 0}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>Stands</div>
                    <div style={{ color: '#ffffff', fontWeight: 'bold' }}>{venue.totalStands || 0}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>Sectors</div>
                    <div style={{ color: '#ffffff', fontWeight: 'bold' }}>{venue.totalSectors || 0}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                  <button
                    className="premium-btn premium-btn-secondary"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => navigate(`/venues/${venue.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    className="premium-btn"
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      background: 'rgba(231, 76, 60, 0.1)',
                      color: 'var(--color-danger)',
                      border: '1px solid rgba(231, 76, 60, 0.2)'
                    }}
                    onClick={() => handleDelete(venue.id!)}
                    disabled={deletingId === venue.id}
                  >
                    {deletingId === venue.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

};

export default VenueList;
