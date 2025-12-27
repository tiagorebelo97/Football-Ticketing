import React, { useState } from 'react';
import { Stand, Floor, Sector } from '../../services/venueService';

interface StandConfigPanelProps {
  stand: Stand | null;
  onAddFloor: () => void;
  onRemoveFloor: (floorId: string) => void;
  onAddSector: (floorId: string) => void;
  onRemoveSector: (floorId: string, sectorId: string) => void;
  onConfigureSector: (floorId: string, sectorId: string) => void;
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
  onUpdateStandName,
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

  if (!stand) {
    return (
      <div className="stand-config-panel">
        <div className="no-stand-selected">
          <p>Selecione uma bancada no mockup ou adicione uma nova bancada para começar a configuração.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stand-config-panel">
      <div className="panel-header">
        {isEditingName ? (
          <div className="edit-name-container">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              autoFocus
              className="edit-name-input"
            />
            <button onClick={handleSaveName} className="btn-icon" title="Guardar">✓</button>
            <button onClick={handleCancelEdit} className="btn-icon" title="Cancelar">✕</button>
          </div>
        ) : (
          <div className="name-display">
            <h3>{stand.name}</h3>
            <button onClick={handleStartEdit} className="btn-icon" title="Editar nome">✎</button>
          </div>
        )}
        <div className="stand-color-badge" style={{ backgroundColor: stand.color }}></div>
      </div>

      <div className="panel-stats">
        <div className="stat">
          <span className="stat-label">Pisos:</span>
          <span className="stat-value">{stand.floors?.length || 0}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Capacidade:</span>
          <span className="stat-value">{stand.totalCapacity || 0}</span>
        </div>
      </div>

      <div className="panel-section">
        <div className="section-header">
          <h4>Pisos</h4>
          <button className="btn btn-sm btn-primary" onClick={onAddFloor}>
            + Adicionar Piso
          </button>
        </div>

        <div className="floors-list">
          {stand.floors && stand.floors.length > 0 ? (
            stand.floors.map((floor) => (
              <div key={floor.id} className="floor-item">
                <div className="floor-header" onClick={() => toggleFloor(floor.id!)}>
                  <div className="floor-info">
                    <span className="floor-name">{floor.name}</span>
                    <span className="floor-stats">
                      {floor.sectors?.length || 0} setores · {floor.totalCapacity || 0} lugares
                    </span>
                  </div>
                  <div className="floor-actions">
                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFloor(floor.id!);
                      }}
                      title="Remover piso"
                    >
                      ✕
                    </button>
                    <span className="expand-icon">
                      {expandedFloors.has(floor.id!) ? '▼' : '▶'}
                    </span>
                  </div>
                </div>

                {expandedFloors.has(floor.id!) && (
                  <div className="floor-content">
                    <div className="sectors-section">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => onAddSector(floor.id!)}
                      >
                        + Adicionar Setor
                      </button>

                      <div className="sectors-list">
                        {floor.sectors && floor.sectors.length > 0 ? (
                          floor.sectors.map((sector) => (
                            <div key={sector.id} className="sector-item">
                              <div className="sector-info">
                                <span className="sector-name">{sector.name}</span>
                                <span className="sector-stats">
                                  {sector.configuredSeats || 0}/{sector.totalSeats} lugares
                                  {sector.rows && ` · ${sector.rows.length} filas`}
                                </span>
                              </div>
                              {errors[`sector-${sector.id}`] && (
                                <div className="error-message-inline">
                                  {errors[`sector-${sector.id}`]}
                                </div>
                              )}
                              <div className="sector-actions">
                                <button
                                  className="btn btn-xs btn-primary"
                                  onClick={() => onConfigureSector(floor.id!, sector.id!)}
                                >
                                  Configurar
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
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-message">Nenhum piso configurado</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StandConfigPanel;
