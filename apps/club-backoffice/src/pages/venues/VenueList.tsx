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
    <div className="venues-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Venues Desportivas</h1>
          <p>Gerencie os estádios e instalações do seu clube</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/venues/create')}
        >
          + Criar Nova Venue
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {venues.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">🏟️</div>
          <h2>Nenhuma venue configurada</h2>
          <p>Crie a sua primeira venue para começar a gerir eventos desportivos</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/venues/create')}
          >
            Criar Primeira Venue
          </button>
        </div>
      ) : (
        <div className="venues-grid">
          {venues.map(venue => (
            <div key={venue.id} className="venue-card">
              {venue.photoUrl && (
                <div className="venue-photo">
                  <img src={venue.photoUrl} alt={venue.name} />
                </div>
              )}
              
              <div className="venue-card-content">
                <h3>{venue.name}</h3>
                
                <div className="venue-info">
                  <div className="info-item">
                    <span className="info-icon">🏀</span>
                    <span>{venue.sportName || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">📍</span>
                    <span>{venue.city}</span>
                  </div>
                </div>

                <div className="venue-stats">
                  <div className="stat-item">
                    <div className="stat-value">{venue.capacity || 0}</div>
                    <div className="stat-label">Capacidade</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{venue.totalStands || 0}</div>
                    <div className="stat-label">Bancadas</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{venue.totalSectors || 0}</div>
                    <div className="stat-label">Setores</div>
                  </div>
                </div>

                <div className="venue-card-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/venues/${venue.id}/edit`)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(venue.id!)}
                    disabled={deletingId === venue.id}
                  >
                    {deletingId === venue.id ? 'A eliminar...' : 'Eliminar'}
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
