import React from 'react';
import { Sport } from '../../services/sportService';

interface SportSelectorProps {
  sports: Sport[];
  selectedSportId: string;
  onSelectSport: (sportId: string) => void;
}

const SportSelector: React.FC<SportSelectorProps> = ({ sports, selectedSportId, onSelectSport }) => {
  const sportIcons: { [key: string]: string } = {
    football: '⚽',
    hockey: '🏒',
    futsal: '🥅',
    basketball: '🏀',
    handball: '🤾',
    volleyball: '🏐'
  };

  return (
    <div className="sport-selector">
      <label className="form-label">Tipo de Desporto *</label>
      <div className="sport-grid">
        {sports.map(sport => (
          <div
            key={sport.id}
            className={`sport-card ${selectedSportId === sport.id ? 'selected' : ''}`}
            onClick={() => onSelectSport(sport.id)}
          >
            <div className="sport-icon">{sportIcons[sport.code] || '🏟️'}</div>
            <div className="sport-name">{sport.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SportSelector;
