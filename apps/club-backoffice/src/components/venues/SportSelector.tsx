import React from 'react';
import { Sport } from '../../services/sportService';
import { useTranslation } from 'react-i18next';

interface SportSelectorProps {
  sports: Sport[];
  selectedSportId: string;
  onSelectSport: (sportId: string) => void;
}

const SportSelector: React.FC<SportSelectorProps> = ({ sports, selectedSportId, onSelectSport }) => {
  const { t } = useTranslation();

  const sportIcons: { [key: string]: string } = {
    football: '⚽',
    hockey: '🏒',
    futsal: '🥅',
    basketball: '🏀',
    handball: '🤾',
    volleyball: '🏐'
  };

  const getSportName = (sport: Sport): string => {
    // Try to translate by code, fallback to API name
    const translationKey = `common.sports.${sport.code}`;
    const translated = t(translationKey);
    return translated !== translationKey ? translated : sport.name;
  };

  return (
    <div className="sport-selector">
      <label className="form-label">{t('venueWizard.sportType')} *</label>
      <div className="sport-grid">
        {sports.map(sport => (
          <div
            key={sport.id}
            className={`sport-card ${selectedSportId === sport.id ? 'selected' : ''}`}
            onClick={() => onSelectSport(sport.id)}
          >
            <div className="sport-icon">{sportIcons[sport.code] || '🏟️'}</div>
            <div className="sport-name">{getSportName(sport)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SportSelector;
