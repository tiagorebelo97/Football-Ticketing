import React, { useState } from 'react';
import { Stand, Sector, Row } from '../../services/venueService';
import StadiumCanvas2D from './StadiumCanvas2D';
import StandConfigPanel from './StandConfigPanel';
import SectorModal from './SectorModal';

interface VenueStadiumTabProps {
  sportCode: string;
  stands: Stand[];
  selectedStandId: string | null;
  errors: { [key: string]: string };
  onAddStand: (position: 'north' | 'south' | 'east' | 'west') => void;
  onRemoveStand: (standId: string) => void;
  onSelectStand: (standId: string | null) => void;
  onUpdateStandName: (standId: string, newName: string) => void;
  onAddFloor: (standId: string) => void;
  onRemoveFloor: (standId: string, floorId: string) => void;
  onAddSector: (standId: string, floorId: string) => void;
  onRemoveSector: (standId: string, floorId: string, sectorId: string) => void;
  onUpdateSector: (standId: string, floorId: string, sectorId: string, updates: Partial<Sector>) => void;
  onAddRow: (standId: string, floorId: string, sectorId: string, seatsCount: number) => void;
  onRemoveRow: (standId: string, floorId: string, sectorId: string, rowId: string) => void;
  onUpdateRow: (standId: string, floorId: string, sectorId: string, rowId: string, updates: Partial<Row>) => void;
}

const VenueStadiumTab: React.FC<VenueStadiumTabProps> = ({
  sportCode,
  stands,
  selectedStandId,
  errors,
  onAddStand,
  onRemoveStand,
  onSelectStand,
  onUpdateStandName,
  onAddFloor,
  onRemoveFloor,
  onAddSector,
  onRemoveSector,
  onUpdateSector,
  onAddRow,
  onRemoveRow,
  onUpdateRow
}) => {
  const [sectorModalOpen, setSectorModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<{
    standId: string;
    floorId: string;
    sector: Sector;
  } | null>(null);

  const selectedStand = stands.find(s => s.id === selectedStandId) || null;

  const handleConfigureSector = (floorId: string, sectorId: string) => {
    if (!selectedStandId) return;

    const stand = stands.find(s => s.id === selectedStandId);
    if (!stand) return;

    const floor = stand.floors?.find(f => f.id === floorId);
    if (!floor) return;

    const sector = floor.sectors?.find(s => s.id === sectorId);
    if (!sector) return;

    setEditingSector({ standId: selectedStandId, floorId, sector });
    setSectorModalOpen(true);
  };

  const handleSaveSector = (totalSeats: number) => {
    if (editingSector) {
      onUpdateSector(
        editingSector.standId,
        editingSector.floorId,
        editingSector.sector.id!,
        { totalSeats }
      );
    }
  };

  const handleAddRowToSector = (seatsCount: number) => {
    if (editingSector) {
      onAddRow(
        editingSector.standId,
        editingSector.floorId,
        editingSector.sector.id!,
        seatsCount
      );
    }
  };

  const handleRemoveRowFromSector = (rowId: string) => {
    if (editingSector) {
      onRemoveRow(
        editingSector.standId,
        editingSector.floorId,
        editingSector.sector.id!,
        rowId
      );
    }
  };

  const handleUpdateRowInSector = (rowId: string, updates: Partial<Row>) => {
    if (!editingSector) return;
    onUpdateRow(
      editingSector.standId,
      editingSector.floorId,
      editingSector.sector.id!,
      rowId,
      updates
    );
  };

  const existingPositions = stands.map(s => s.position);
  const availablePositions = (['north', 'south', 'east', 'west'] as const).filter(
    pos => !existingPositions.includes(pos)
  );

  const positionLabels = {
    north: 'Norte',
    south: 'Sul',
    east: 'Este',
    west: 'Oeste'
  };

  return (
    <div className="venue-stadium-tab">
      <h2>Configuração do Estádio</h2>
      <p className="tab-description">
        Configure as bancadas, pisos, setores e filas da sua venue. A mockup 2D atualiza em tempo real.
      </p>

      {errors.stands && (
        <div className="error-message-banner">{errors.stands}</div>
      )}

      <div className="stadium-layout">
        {/* Left: Canvas */}
        <div className="stadium-canvas-section">
          <div className="canvas-header">
            <h3>Mockup 2D do Estádio</h3>
            {availablePositions.length > 0 && (
              <div className="add-stand-dropdown">
                <label>Adicionar Bancada:</label>
                <div className="stand-position-buttons">
                  {availablePositions.map(pos => (
                    <button
                      key={pos}
                      className="btn btn-sm btn-primary"
                      onClick={() => onAddStand(pos)}
                    >
                      {positionLabels[pos]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <StadiumCanvas2D
            sportCode={sportCode}
            stands={stands}
            selectedStandId={selectedStandId}
            onStandClick={onSelectStand}
          />

          {stands.length === 0 && (
            <div className="empty-canvas-message">
              <p>👆 Adicione a primeira bancada para começar</p>
            </div>
          )}
        </div>

        {/* Right: Configuration Panel */}
        <div className="stadium-config-section">
          <StandConfigPanel
            stand={selectedStand}
            onAddFloor={() => selectedStandId && onAddFloor(selectedStandId)}
            onRemoveFloor={(floorId) => selectedStandId && onRemoveFloor(selectedStandId, floorId)}
            onAddSector={(floorId) => selectedStandId && onAddSector(selectedStandId, floorId)}
            onRemoveSector={(floorId, sectorId) => selectedStandId && onRemoveSector(selectedStandId, floorId, sectorId)}
            onUpdateSector={(floorId, sectorId, updates) => selectedStandId && onUpdateSector(selectedStandId, floorId, sectorId, updates)}
            onConfigureSector={(floorId, sectorId) => handleConfigureSector(floorId, sectorId)}
            onUpdateStandName={(newName) => selectedStandId && onUpdateStandName(selectedStandId, newName)}
            errors={errors}
          />

          {selectedStand && (
            <div className="stand-actions">
              <button
                className="btn btn-danger btn-block"
                onClick={() => selectedStandId && onRemoveStand(selectedStandId)}
              >
                Remover Bancada {selectedStand.name}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sector Configuration Modal */}
      <SectorModal
        isOpen={sectorModalOpen}
        sector={editingSector?.sector || null}
        onClose={() => {
          setSectorModalOpen(false);
          setEditingSector(null);
        }}
        onSave={handleSaveSector}
        onAddRow={handleAddRowToSector}
        onRemoveRow={handleRemoveRowFromSector}
        onUpdateRow={handleUpdateRowInSector}
      />
    </div>
  );
};

export default VenueStadiumTab;
