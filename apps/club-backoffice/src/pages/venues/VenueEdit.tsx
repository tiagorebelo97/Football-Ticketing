import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VenueWizard from '../../components/venues/VenueWizard';
import { venueService, Venue } from '../../services/venueService';

const VenueEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadVenue();
  }, [id]);

  const loadVenue = async () => {
    if (!id) {
      setError('ID da venue não fornecido');
      setLoading(false);
      return;
    }

    try {
      const data = await venueService.getVenueById(id);
      setVenue(data);
    } catch (err: any) {
      console.error('Error loading venue:', err);
      setError('Erro ao carregar venue');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedVenue: Venue) => {
    if (!id) {
      throw new Error('ID da venue não fornecido');
    }

    await venueService.updateVenue(id, {
      name: updatedVenue.name,
      city: updatedVenue.city,
      address: updatedVenue.address,
      sportId: updatedVenue.sportId,
      photoUrl: updatedVenue.photoUrl,
      capacity: updatedVenue.capacity,
      stands: updatedVenue.stands
    });

    navigate('/venues');
  };

  const handleCancel = () => {
    navigate('/venues');
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">A carregar venue...</div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="card">
        <div className="error-message">{error || 'Venue não encontrada'}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/venues')}>
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="venue-edit-page">
      <VenueWizard isSuperAdmin={false} initialVenue={venue} onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
};

export default VenueEdit;
