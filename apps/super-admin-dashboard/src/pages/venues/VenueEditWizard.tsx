import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VenueWizard from '../../components/venues/VenueWizard';
import { venueService, Venue } from '../../services/venueService';

const VenueEditWizard: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadVenue();
    }
  }, [id]);

  const loadVenue = async () => {
    try {
      const venue = await venueService.getVenue(id!);
      setInitialData(venue);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load venue:', error);
      setLoading(false);
    }
  };

  const handleSave = async (venue: Venue) => {
    if (!id) return;

    await venueService.updateVenue(id, {
      clubId: venue.clubId,
      name: venue.name,
      city: venue.city,
      address: venue.address,
      sportId: venue.sportId,
      photoUrl: venue.photoUrl,
      capacity: venue.capacity,
      stands: venue.stands
    });

    navigate('/venues');
  };

  const handleCancel = () => {
    navigate('/venues');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="text-gradient" style={{ fontSize: '24px', fontWeight: 700 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="venue-edit-page">
      <VenueWizard 
        onSave={handleSave} 
        onCancel={handleCancel} 
        initialData={initialData || undefined}
        isSuperAdmin={true}
      />
    </div>
  );
};

export default VenueEditWizard;
