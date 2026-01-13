import React, { useState } from 'react';
import { Stand, Floor, Sector } from '../../services/venueService';

interface StandConfigPanelProps {
  stand: Stand | null;
  onAddFloor: () => void;
  onRemoveFloor: (floorId: string) => void;
  onDuplicateFloor: (floorId: string) => void;
  onAddSector: (floorId: string) => void;
  onRemoveSector: (floorId: string, sectorId: string) => void;
  onConfigureSector: (floorId: string, sectorId: string) => void;
  onUpdateSector: (floorId: string, sectorId: string, updates: Partial<Sector>) => void;
  onUpdateStandName: (newName: string) => void;
  onUpdateStandColor: (color: string) => void;
  errors: { [key: string]: string };
}

const StandConfigPanel: React.FC<StandConfigPanelProps> = ({
  stand,
  onAddFloor,
  onRemoveFloor,
  onDuplicateFloor,
  onAddSector,
  onRemoveSector,
  onConfigureSector,
  onUpdateSector,
  onUpdateStandName,
  onUpdateStandColor,
  errors
}) => {
  const [expandedFloors, setExpandedFloors] = useState<Set<string>>(new Set());
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  const toggleFloor = (floorId: string) => {
    setExpandedFloors(prev => {
      const next = new Set(prev);
      if (next.has(floorId)) {
        next.delete(floorId);
      } else {
        next.add(floorId);
      }
      return next;
    });
  };

  const handleStartEdit = () => {
    setEditedName(stand?.name || '');
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    if (editedName.trim()) {
      onUpdateStandName(editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  const floors = stand?.floors || [];

  if (!stand) {
    return (
      <div className="panel-placeholder glassmorphism">
        <div className="placeholder-content">
          <span className="placeholder-icon">🏟️</span>
          <p>Selecione uma bancada no mapa para configurar</p>
        </div>
      </div>
    );
  }

  const standColors = ['#3498db', '#2ecc71', '#f1c40f', '#e74c3c', '#9b59b6', '#34495e'];

  return (
    <div className="stand-config-panel glassmorphism">
      <div className="panel-header">
        <div className="stand-title-section">
          {isEditingName ? (
            <div className="edit-name-form">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="form-control"
                autoFocus
              />
              <div className="edit-actions">
                <button className="btn btn-sm btn-success" onClick={handleSaveName} disabled={!editedName.trim()}>Ok</button>
                <button className="btn btn-sm btn-secondary" onClick={handleCancelEdit}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="stand-title-display">
              <h3>{stand.name}</h3>
              <button className="btn-icon-small" onClick={handleStartEdit} title="Renomear">✏️</button>
            </div>
          )}
        </div>

        <div className="color-picker-section">
          {standColors.map(color => (
            <button
              key={color}
              className={`color-swatch ${stand.color === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => onUpdateStandColor(color)}
            />
          ))}
        </div>

        <div className="stand-stats">
          <div className="stat-pill">
            <span className="stat-label">Capacidade</span>
            <span className="stat-value">{stand.totalCapacity}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">Pisos</span>
            <span className="stat-value">{floors.length}</span>
          </div>
        </div>
      </div>

      <div className="floors-section">
        <div className="section-header">
          <h4>Pisos & Setores</h4>
          <button className="btn btn-sm btn-primary" onClick={onAddFloor}>+ Novo Piso</button>
        </div>

        <div className="floors-list">
          {floors.length > 0 ? (
            floors.map((floor) => (
              <div key={floor.id} className="floor-card">
                <div className="floor-header">
                  <div className="floor-title" onClick={() => toggleFloor(floor.id!)}>
                    <span className={`toggle-icon ${expandedFloors.has(floor.id!) ? 'expanded' : ''}`}>▶</span>
                    <span className="floor-name">{floor.name}</span>
                    <span className="floor-capacity-badge">{floor.totalCapacity} lug.</span>
                  </div>
                  <div className="floor-actions">
                    <button className="btn-icon" onClick={() => onDuplicateFloor(floor.id!)} title="Duplicar Piso">👯</button>
                    <button className="btn-icon" onClick={() => onAddSector(floor.id!)} title="Adicionar Setor">+</button>
                    <button className="btn-icon delete" onClick={() => onRemoveFloor(floor.id!)} title="Remover Piso">✕</button>
                  </div>
                </div>

                {expandedFloors.has(floor.id!) && (
                  <div className="floor-content">
                    {floor.sectors && floor.sectors.length > 0 ? (
                      <div className="sectors-grid">
                        {floor.sectors.map((sector) => (
                          <div key={sector.id} className="sector-card">
                            <div className="sector-header">
                              <input
                                type="text"
                                value={sector.name}
                                className="sector-name-input"
                                onChange={(e) => onUpdateSector(floor.id!, sector.id!, { name: e.target.value })}
                              />
                              <button className="btn-icon delete" onClick={() => onRemoveSector(floor.id!, sector.id!)}>✕</button>
                            </div>
                            <div className="sector-body">
                              <div className="input-group-vertical">
                                <label>Lugares Totais</label>
                                <input
                                  type="number"
                                  value={sector.totalSeats}
                                  min="1"
                                  onChange={(e) => onUpdateSector(floor.id!, sector.id!, { totalSeats: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                              <button
                                className={`btn btn-block btn-xs ${sector.rows?.length ? 'btn-outline-success' : 'btn-outline-primary'}`}
                                onClick={() => onConfigureSector(floor.id!, sector.id!)}
                              >
                                {sector.rows?.length ? '✓ Configurado' : 'Configurar Filas'}
                              </button>
                            </div>
                            {errors[`sector-${sector.id}`] && (
                              <div className="error-tip">{errors[`sector-${sector.id}`]}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-message-inline">Nenhum setor neste piso</div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-message">Inicie adicionando um piso</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StandConfigPanel;
