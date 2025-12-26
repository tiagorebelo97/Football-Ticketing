import React from 'react';
import { useNavigate } from 'react-router-dom';
import VenueWizard from '../../components/venues/VenueWizard';
import { venueService, Venue } from '../../services/venueService';

const VenueCreateWizard: React.FC = () => {
  const navigate = useNavigate();

  const handleSave = async (venue: Venue) => {
    // In super-admin-dashboard, we need to ensure clubId is provided
    if (!venue.clubId) {
      throw new Error('Club must be selected');
    }

    await venueService.createVenue({
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

  return (
    <div className="venue-create-page">
      <VenueWizard onSave={handleSave} onCancel={handleCancel} isSuperAdmin={true} />
    </div>
  );
};

export default VenueCreateWizard;
