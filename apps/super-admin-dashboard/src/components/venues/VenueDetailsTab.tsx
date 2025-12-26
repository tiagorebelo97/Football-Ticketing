import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sport, sportService } from '../../services/sportService';
import SportSelector from './SportSelector';
import { VenueDetails } from '../../hooks/useVenueBuilder';

interface Club {
  id: string;
  name: string;
  logo_url?: string;
}

interface VenueDetailsTabProps {
  details: VenueDetails;
  errors: { [key: string]: string };
  onUpdate: (details: Partial<VenueDetails>) => void;
  isSuperAdmin?: boolean;
}

const VenueDetailsTab: React.FC<VenueDetailsTabProps> = ({ details, errors, onUpdate, isSuperAdmin = false }) => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const promises: Promise<any>[] = [sportService.getSports()];

        if (isSuperAdmin) {
          promises.push(axios.get('/api/clubs', { params: { perPage: 300 } }));
        }

        const results = await Promise.all(promises);

        if (!mounted) return;

        setSports(results[0] || []);

        if (isSuperAdmin && results[1]) {
          setClubs(results[1].data.data || results[1].data || []);
        }
      } catch (error) {
        console.error('Error loading venue data:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (loading && (sports.length === 0 || (isSuperAdmin && clubs.length === 0))) {
      loadData();
    } else {
      setLoading(false);
    }

    return () => { mounted = false; };
  }, [isSuperAdmin]); // Removed sports.length check to avoid potential loops if data fetch fails

  const handleSportSelect = (sportId: string) => {
    // Only update if value actually changed
    if (details.sportId !== sportId) {
      const sport = sports.find(s => s.id === sportId);
      onUpdate({ sportId, sportName: sport?.name });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to server and get URL
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div className="loading">A carregar desportos...</div>;
  }

  return (
    <div className="venue-details-tab">
      <h2>Detalhes da Venue</h2>
      <p className="tab-description">
        Preencha as informações básicas da venue desportiva.
      </p>

      {isSuperAdmin && (
        <div className="form-group">
          <label htmlFor="clubSelect">Clube *</label>
          <select
            id="clubSelect"
            className={`form-control ${errors.clubId ? 'error' : ''}`}
            value={details.clubId || ''}
            onChange={(e) => onUpdate({ clubId: e.target.value })}
          >
            <option value="">Selecione um clube</option>
            {clubs.map(club => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
          {errors.clubId && <div className="error-message">{errors.clubId}</div>}
        </div>
      )}

      <div className="form-section">
        <SportSelector
          sports={sports}
          selectedSportId={details.sportId}
          onSelectSport={handleSportSelect}
        />
        {errors.sportId && <div className="error-message">{errors.sportId}</div>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="venueName">Nome da Venue *</label>
          <input
            id="venueName"
            type="text"
            className={`form-control ${errors.name ? 'error' : ''}`}
            value={details.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Ex: Estádio José Alvalade"
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="venueCity">Cidade *</label>
          <input
            id="venueCity"
            type="text"
            className={`form-control ${errors.city ? 'error' : ''}`}
            value={details.city}
            onChange={(e) => onUpdate({ city: e.target.value })}
            placeholder="Ex: Lisboa"
          />
          {errors.city && <div className="error-message">{errors.city}</div>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="venueAddress">Morada</label>
        <input
          id="venueAddress"
          type="text"
          className="form-control"
          value={details.address}
          onChange={(e) => onUpdate({ address: e.target.value })}
          placeholder="Ex: Rua Professor Fernando da Fonseca"
        />
      </div>

      <div className="form-group">
        <label htmlFor="venuePhoto">Foto da Venue</label>
        <input
          id="venuePhoto"
          type="file"
          className="form-control"
          accept="image/*"
          onChange={handlePhotoUpload}
        />
        {details.photoUrl && (
          <div className="photo-preview">
            <img src={details.photoUrl} alt="Preview" />
          </div>
        )}
      </div>

      <div className="form-info">
        <p><strong>Nota:</strong> A capacidade total será calculada automaticamente com base nas bancadas configuradas no próximo passo.</p>
      </div>
    </div>
  );
};

export default VenueDetailsTab;
