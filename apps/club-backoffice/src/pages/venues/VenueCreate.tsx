import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VenueWizard from '../../components/venues/VenueWizard';
import { venueService, Venue } from '../../services/venueService';

const VenueCreate: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSave = async (venue: Venue) => {
    if (!user?.clubId) {
      throw new Error('User not authenticated');
    }

    await venueService.createVenue({
      clubId: user.clubId,
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
      <VenueWizard onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
};

export default VenueCreate;
