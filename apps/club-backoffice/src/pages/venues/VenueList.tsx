import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { venueService, Venue } from '../../services/venueService';
import { useTranslation } from 'react-i18next';

const VenueList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
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
      setError(t('common.errorLoading') || 'Error loading venues');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (venueId: string) => {
    if (!window.confirm(t('common.confirmDelete') || 'Are you sure you want to delete?')) {
      return;
    }

    try {
      setDeletingId(venueId);
      await venueService.deleteVenue(venueId);
      await loadVenues();
    } catch (err: any) {
      console.error('Error deleting venue:', err);
      alert(t('common.errorDeleting') || 'Error deleting venue');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="font-premium text-gradient" style={{ margin: 0, fontSize: '2.5rem' }}>{t('venues.title')}</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            {t('venues.subtitle')}
          </p>
        </div>
        <button
          className="premium-btn premium-btn-primary"
          onClick={() => navigate('/venues/create')}
        >
          + {t('venues.create')}
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
            <h2 style={{ color: '#ffffff', marginBottom: '12px' }}>{t('venues.noVenues')}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{t('venues.noVenuesDesc')}</p>
          </div>
          <button
            className="premium-btn premium-btn-primary"
            onClick={() => navigate('/venues/create')}
          >
            {t('venues.createFirst')}
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
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
                    {venue.sportName || t('venues.multiSports')}
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
                      📍 {venue.city || t('venues.locationNotSet')}
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
                    <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>{t('venues.capacity')}</div>
                    <div style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>{venue.capacity?.toLocaleString() || 0}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>{t('venues.stands')}</div>
                    <div style={{ color: '#ffffff', fontWeight: 'bold' }}>{venue.totalStands || 0}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>{t('venues.sectors')}</div>
                    <div style={{ color: '#ffffff', fontWeight: 'bold' }}>{venue.totalSectors || 0}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                  <button
                    className="premium-btn premium-btn-secondary"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => navigate(`/venues/${venue.id}/edit`)}
                  >
                    {t('venues.edit')}
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
                    {deletingId === venue.id ? '...' : t('venues.delete')}
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
