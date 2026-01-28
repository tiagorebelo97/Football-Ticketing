import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sport, sportService } from '../../services/sportService';
import SportSelector from './SportSelector';
import { VenueDetails } from '../../hooks/useVenueBuilder';
import { useTranslation } from 'react-i18next';

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

const MOCK_SPORTS: Sport[] = [
  { id: 'football-id', name: 'Futebol', code: 'football' },
  { id: 'hockey-id', name: 'Hóquei', code: 'hockey' },
  { id: 'futsal-id', name: 'Futsal', code: 'futsal' },
  { id: 'basketball-id', name: 'Basquetebol', code: 'basketball' },
  { id: 'handball-id', name: 'Andebol', code: 'handball' },
  { id: 'volleyball-id', name: 'Voleibol', code: 'volleyball' }
];

const VenueDetailsTab: React.FC<VenueDetailsTabProps> = ({ details, errors, onUpdate, isSuperAdmin = false }) => {
  const { t } = useTranslation();
  const [sports, setSports] = useState<Sport[]>(MOCK_SPORTS); // Default to mock
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

        if (results[0] && results[0].length > 0) {
          setSports(results[0]);
        }

        if (isSuperAdmin && results[1]) {
          setClubs(results[1].data.data || results[1].data || []);
        }
      } catch (error) {
        console.error('Error loading venue data:', error);
        // On error, we keep the MOCK_SPORTS initialized above
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => { mounted = false; };
  }, [isSuperAdmin]);

  const handleSportSelect = (sportId: string) => {
    // Only update if value actually changed
    if (details.sportId !== sportId) {
      const sport = sports.find(s => s.id === sportId);
      onUpdate({ sportId, sportCode: sport?.code, sportName: sport?.name });
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
    return <div className="loading">{t('venueWizard.loadingSports')}</div>;
  }

  return (
    <div className="venue-details-tab">
      <h2>{t('venueWizard.detailsTitle')}</h2>
      <p className="tab-description">
        {t('venueWizard.detailsDescription')}
      </p>

      {isSuperAdmin && (
        <div className="form-group">
          <label htmlFor="clubSelect">{t('venueWizard.clubLabel')} *</label>
          <select
            id="clubSelect"
            className={`form-control ${errors.clubId ? 'error' : ''}`}
            value={details.clubId || ''}
            onChange={(e) => onUpdate({ clubId: e.target.value })}
          >
            <option value="">{t('venueWizard.selectClub')}</option>
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
          <label htmlFor="venueName">{t('venueWizard.venueNameLabel')} *</label>
          <input
            id="venueName"
            type="text"
            className={`form-control ${errors.name ? 'error' : ''}`}
            value={details.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder={t('venueWizard.venueNamePlaceholder')}
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="venueCity">{t('venueWizard.cityLabel')} *</label>
          <input
            id="venueCity"
            type="text"
            className={`form-control ${errors.city ? 'error' : ''}`}
            value={details.city}
            onChange={(e) => onUpdate({ city: e.target.value })}
            placeholder={t('venueWizard.cityPlaceholder')}
          />
          {errors.city && <div className="error-message">{errors.city}</div>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="venueAddress">{t('venueWizard.addressLabel')}</label>
        <input
          id="venueAddress"
          type="text"
          className="form-control"
          value={details.address}
          onChange={(e) => onUpdate({ address: e.target.value })}
          placeholder={t('venueWizard.addressPlaceholder')}
        />
      </div>

      {/* Geographic Location Section */}
      <div className="form-section location-premium-section">
        <label>{t('venueWizard.geolocationLabel')}</label>
        <div className="location-grid">
          <div className="location-inputs">
            <div className="form-group small">
              <label>{t('venueWizard.latitudeLabel')}</label>
              <input
                type="number"
                step="any"
                className="form-control"
                value={details.latitude || ''}
                onChange={(e) => onUpdate({ latitude: parseFloat(e.target.value) })}
                placeholder="0.0000"
              />
            </div>
            <div className="form-group small">
              <label>{t('venueWizard.longitudeLabel')}</label>
              <input
                type="number"
                step="any"
                className="form-control"
                value={details.longitude || ''}
                onChange={(e) => onUpdate({ longitude: parseFloat(e.target.value) })}
                placeholder="0.0000"
              />
            </div>
            <button
              className="btn btn-secondary btn-detect"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    onUpdate({
                      latitude: pos.coords.latitude,
                      longitude: pos.coords.longitude
                    });
                  });
                }
              }}
            >
              {t('venueWizard.detectLocation')}
            </button>
          </div>

          <div className="map-simulation">
            <div className="map-grid-pattern"></div>
            <div className="map-pin"></div>
            <div className="map-pulsar"></div>
            <div className="map-overlay-text">BLUEPRINT MAP ENGINE</div>
          </div>
        </div>
      </div>

      {/* Facilities & Accessibility Section */}
      <div className="form-row metadata-sections">
        <div className="metadata-group">
          <label>{t('venueWizard.facilitiesLabel')}</label>
          <div className="checkbox-grid">
            {[
              { id: 'press', label: t('venueWizard.pressCenter') },
              { id: 'parking', label: t('venueWizard.parkingPrivate') },
              { id: 'vip', label: t('venueWizard.vipArea') },
              { id: 'var', label: t('venueWizard.varRoom') },
              { id: 'medical', label: t('venueWizard.medicalCenter') }
            ].map(item => (
              <label key={item.id} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={details.facilities?.includes(item.id)}
                  onChange={(e) => {
                    const current = details.facilities || [];
                    const next = e.target.checked
                      ? [...current, item.id]
                      : current.filter(id => id !== item.id);
                    onUpdate({ facilities: next });
                  }}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="metadata-group">
          <label>{t('venueWizard.accessibilityLabel')}</label>
          <div className="checkbox-grid">
            {[
              { id: 'wheelchair', label: t('venueWizard.wheelchairAccess') },
              { id: 'tactile', label: t('venueWizard.tactilePaving') },
              { id: 'audio', label: t('venueWizard.audioDescription') },
              { id: 'elevator', label: t('venueWizard.priorityElevators') }
            ].map(item => (
              <label key={item.id} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={details.accessibility?.includes(item.id)}
                  onChange={(e) => {
                    const current = details.accessibility || [];
                    const next = e.target.checked
                      ? [...current, item.id]
                      : current.filter(id => id !== item.id);
                    onUpdate({ accessibility: next });
                  }}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="media-section-premium">
        <div className="photo-upload-group">
          <label>{t('venueWizard.mainPhotoLabel')}</label>
          <div className={`upload-dropzone ${details.photoUrl ? 'has-file' : ''}`}>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} />
            {details.photoUrl ? (
              <img src={details.photoUrl} alt="Main" />
            ) : (
              <div className="upload-placeholder">{t('venueWizard.clickToUpload')}</div>
            )}
          </div>
        </div>

        <div className="photo-upload-group">
          <label>{t('venueWizard.interiorPhotosLabel')}</label>
          <div className="multi-photo-grid">
            {/* Interior Photos Simulation */}
            {details.interiorPhotos?.map((url, i) => (
              <div key={i} className="mini-photo-preview">
                <img src={url} alt={`Interior ${i}`} />
              </div>
            ))}
            <label className="add-photo-btn">
              <span>{t('venueWizard.addPhoto')}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach(file => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const current = details.interiorPhotos || [];
                      onUpdate({ interiorPhotos: [...current, reader.result as string] });
                    };
                    reader.readAsDataURL(file);
                  });
                }}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="form-info-premium">
        <div className="info-icon">💡</div>
        <p>{t('venueWizard.architectTip')}</p>
      </div>
    </div>
  );
};

export default VenueDetailsTab;
