import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Stand, Sector, Row } from '../../services/venueService';
import StadiumArchitectWorkspace from './StadiumArchitectWorkspace';
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
  onDuplicateFloor: (standId: string, floorId: string) => void;
  onUpdateStandColor: (standId: string, color: string) => void;
  onUndo: () => void;
  onNext: () => void;
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
  onUpdateRow,
  onDuplicateFloor,
  onUpdateStandColor,
  onUndo,
  onNext
}) => {
  const [sectorModalOpen, setSectorModalOpen] = useState(false);
  const [selectedSectorContext, setSelectedSectorContext] = useState<{
    standId: string;
    floorId: string;
    sectorId: string;
  } | null>(null);

  // Map old position format to new format
  const positionMap: Record<string, 'north' | 'south' | 'east' | 'west'> = {
    'Norte': 'north',
    'Sul': 'south',
    'Este': 'east',
    'Oeste': 'west'
  };

  const toggleFullscreen = () => {
    // Just force a re-render or do nothing, maybe trigger cancel from parent?
    // Since we are in a portal, closing means unmounting or hiding.
    // The parent controls this via tab selection.
    // Ideally we call onCancel from props? No onCancel in props.
    // We can't easily close it without parent support to switch tabs.
    // Let's assume onSave calls save and closes.
    // For close button, we might want to just notify user or reload.
    window.location.reload(); // Simplest way to 'exit' for now if stuck
  };

  const handleAddStand = (position: string) => {
    const mappedPosition = positionMap[position] || 'north';
    onAddStand(mappedPosition);
  };

  const handleUpdateStand = (standId: string, updates: any) => {
    if (updates.name) {
      onUpdateStandName(standId, updates.name);
    }
    if (updates.color) {
      onUpdateStandColor(standId, updates.color);
    }

    // Handle floor array updates from ConfigPanel
    // If floors changed length, we need to determine if it was add, remove, or duplicate
    // Ideally we should pass specific actions from ConfigPanel, but for now we fallback to checking length
    // OR we just use specific hooks if ConfigPanel supports it?
    // ConfigPanel sends "floors: updatedFloors"

    // Since dealing with full array replace is hard with current hooks, 
    // let's rely on mapping specific helper methods if we passed them to workspace
    // BUT Workspace uses generic onUpdateStand.

    // Hack: check if the update contains specific flags or infer from diff (too hard)
    // Better: Allow onUpdateStand to receive special command keys

    // Handle floor array updates from ConfigPanel
    const currentStand = stands.find(s => s.id === standId);
    if (!currentStand) return; // Guard clause

    const currentFloorsLength = currentStand.floors?.length || 0;
    const newFloorsLength = updates.floors?.length || 0;

    if (updates.floors && newFloorsLength > currentFloorsLength) {
      // Added a floor
      onAddFloor(standId);
    } else if (updates.floors && newFloorsLength < currentFloorsLength) {
      // Removed a floor
      const currentFloors = currentStand.floors || [];
      const newFloorIds = updates.floors.map((f: any) => f.id);
      const removedFloor = currentFloors.find(f => f && !newFloorIds.includes(f.id));

      if (removedFloor && removedFloor.id) {
        onRemoveFloor(standId, removedFloor.id);
      }
    }
  };

  const handleSave = () => {
    // Note: useVenueBuilder already persists to localStorage on every change.
    // We just need to move to the next step (Review) so the user can finalize.
    onNext();
  };

  // Transform stands data for new component - with mock data if empty
  const transformedVenue = {
    name: 'Novo Estádio',
    stands: stands && stands.length > 0
      ? stands.map(stand => ({
        ...stand,
        position: stand.position === 'north' ? 'Norte' :
          stand.position === 'south' ? 'Sul' :
            stand.position === 'east' ? 'Este' : 'Oeste'
      }))
      : [] // Start with empty stands - user will add them
  };

  return (
    <>
      {/* Render Stadium Architect in a Portal to break out of modal */}
      {createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10000,
          background: 'var(--stadium-bg-primary, #0a0e27)'
        }}>
          <StadiumArchitectWorkspace
            venue={transformedVenue}
            onUpdateVenue={(updates: any) => {
              // Legacy support
            }}
            onSave={handleSave}
            onClose={toggleFullscreen} // Use toggle state we will add or just reload
            onAddStand={handleAddStand}
            onUpdateStand={handleUpdateStand}
            onRemoveStand={onRemoveStand}
            onAddSector={(standId, floorId) => {
              onAddSector(standId, floorId);
            }}
            onRemoveSector={onRemoveSector}
            onEditSector={(standId, floorId, sectorId) => {
              // Open Sector Modal for editing
              setSelectedSectorContext({ standId, floorId, sectorId });
              setSectorModalOpen(true);
            }}
            onNext={onNext}
          />
        </div>,
        document.body
      )}

      {/* Sector Modal - Keep for detailed sector configuration */}
      {sectorModalOpen && selectedSectorContext && (() => {
        const stand = stands.find(s => s.id === selectedSectorContext.standId);
        if (!stand || !stand.floors) return null;

        const floor = stand.floors.find(f => f.id === selectedSectorContext.floorId);
        if (!floor || !floor.sectors) return null;

        const sector = floor.sectors.find(sec => sec.id === selectedSectorContext.sectorId);
        if (!sector) return null;

        return createPortal(
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none' // Allow clicks outside modal to pass (if modal has overlay it will block)
          }}>
            <div style={{ pointerEvents: 'auto' }}>
              <SectorModal
                isOpen={true}
                sector={sector}
                onClose={() => {
                  setSectorModalOpen(false);
                  setSelectedSectorContext(null);
                }}
                onSave={(totalSeats, name) => {
                  if (selectedSectorContext && sector) {
                    onUpdateSector(
                      selectedSectorContext.standId,
                      selectedSectorContext.floorId,
                      selectedSectorContext.sectorId,
                      { totalSeats, name: name || sector.name }
                    );
                  }
                }}
                onAddRow={(seatsCount) => {
                  if (selectedSectorContext) {
                    onAddRow(
                      selectedSectorContext.standId,
                      selectedSectorContext.floorId,
                      selectedSectorContext.sectorId,
                      seatsCount
                    );
                  }
                }}
                onRemoveRow={(rowId) => {
                  if (selectedSectorContext) {
                    onRemoveRow(
                      selectedSectorContext.standId,
                      selectedSectorContext.floorId,
                      selectedSectorContext.sectorId,
                      rowId
                    );
                  }
                }}
                onUpdateRow={(rowId, updates) => {
                  if (selectedSectorContext) {
                    onUpdateRow(
                      selectedSectorContext.standId,
                      selectedSectorContext.floorId,
                      selectedSectorContext.sectorId,
                      rowId,
                      updates
                    );
                  }
                }}
              />
            </div>
          </div>,
          document.body
        );
      })()}

    </>
  );
};

export default VenueStadiumTab;
