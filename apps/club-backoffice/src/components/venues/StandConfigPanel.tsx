import React, { useState } from 'react';
import { Stand, Floor, Sector } from '../../services/venueService';

interface StandConfigPanelProps {
  stand: Stand | null;
  onAddFloor: () => void;
  onRemoveFloor: (floorId: string) => void;
  onAddSector: (floorId: string) => void;
  onRemoveSector: (floorId: string, sectorId: string) => void;
  onConfigureSector: (floorId: string, sectorId: string) => void;
  onUpdateSector: (floorId: string, sectorId: string, updates: Partial<Sector>) => void;
  onUpdateStandName: (newName: string) => void;
  errors: { [key: string]: string };
}

const StandConfigPanel: React.FC<StandConfigPanelProps> = ({
  stand,
  onAddFloor,
  onRemoveFloor,
  onAddSector,
  onRemoveSector,
  onConfigureSector,
  onUpdateSector,
  onUpdateStandName,
  errors
}) => {
  /* ... existing state code ... */
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

  const hasChanges = stand?.name !== editedName;
  const floors = stand?.floors || [];

  if (!stand) {
    return <div className="panel-placeholder">Selecione uma bancada para configurar</div>;
  }

  return (
    <div className="stand-config-panel">
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
                <button
                  className="btn btn-sm btn-success"
                  onClick={handleSaveName}
                  disabled={!editedName.trim()}
                >
                  Ok
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="stand-title-display">
              <h3>{stand.name}</h3>
              <button
                className="btn-icon-small"
                onClick={handleStartEdit}
                title="Renomear bancada"
              >
                ✏️
              </button>
            </div>
          )}
        </div>
        <div className="stand-stats">
          <span className="badge badge-info">{stand.totalCapacity} Lugares</span>
          <span className="badge badge-secondary">{floors.length} Pisos</span>
        </div>
      </div>

      <div className="floors-section">
        <div className="section-header">
          <h4>Pisos</h4>
          <button
            className="btn btn-sm btn-primary"
            onClick={onAddFloor}
          >
            + Adicionar Piso
          </button>
        </div>

        <div className="floors-list">
          {floors.length > 0 ? (
            floors.map((floor) => (
              <div key={floor.id} className="floor-item">
                <div className="floor-header">
                  <div
                    className="floor-title"
                    onClick={() => toggleFloor(floor.id!)}
                  >
                    <span className={`toggle-icon ${expandedFloors.has(floor.id!) ? 'expanded' : ''}`}>▶</span>
                    <span>{floor.name}</span>
                    <span className="floor-capacity-badge">{floor.totalCapacity} lug.</span>
                  </div>
                  <div className="floor-actions">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => onAddSector(floor.id!)}
                      title="Adicionar Setor"
                    >
                      + Setor
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => onRemoveFloor(floor.id!)}
                      title="Remover piso"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {expandedFloors.has(floor.id!) && (
                  <div className="floor-content">
                    {/* Sectors List starts here */}
                    {floor.sectors && floor.sectors.length > 0 ? (
                      floor.sectors.map((sector) => (
                        <div key={sector.id} className="sector-item">
                          <div className="sector-info-inline">
                            <div className="sector-input-group">
                              <label>Nome</label>
                              <input
                                type="text"
                                value={sector.name}
                                className="small-input"
                                onChange={(e) => onUpdateSector(floor.id!, sector.id!, { name: e.target.value })}
                              />
                            </div>
                            <div className="sector-input-group">
                              <label>Lugares</label>
                              <input
                                type="number"
                                value={sector.totalSeats}
                                className="small-input"
                                min="1"
                                onChange={(e) => onUpdateSector(floor.id!, sector.id!, { totalSeats: parseInt(e.target.value) || 0 })}
                              />
                            </div>
                            <div className="sector-stats-summary">
                              {sector.rows?.length || 0} filas
                            </div>
                          </div>

                          {errors[`sector-${sector.id}`] && (
                            <div className="error-message-inline">
                              {errors[`sector-${sector.id}`]}
                            </div>
                          )}

                          <div className="sector-actions">
                            <button
                              className="btn btn-xs btn-outline-primary"
                              onClick={() => onConfigureSector(floor.id!, sector.id!)}
                              title="Configurar Filas"
                            >
                              Filas
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => onRemoveSector(floor.id!, sector.id!)}
                              title="Remover setor"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-message">Nenhum setor configurado</div>
                    )}
                  </div>
                )}
              </div >
            ))
          ) : (
            <div className="empty-message">Nenhum piso configurado</div>
          )}
        </div >
      </div >
    </div >
  );
};

export default StandConfigPanel;
