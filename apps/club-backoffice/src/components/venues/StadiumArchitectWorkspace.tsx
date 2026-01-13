import React, { useState, useCallback, useRef, useEffect } from 'react';
import './StadiumArchitect.css';
import BlueprintCanvas from './BlueprintCanvas';
import FloatingConfigPanel from './FloatingConfigPanel';
import StatsPanel from './StatsPanel';
import ActionPalette from './ActionPalette';
import TopBar from './TopBar';

interface StadiumArchitectWorkspaceProps {
    venue: any;
    onUpdateVenue?: (updates: any) => void;
    onSave: () => void;
    onClose?: () => void;
    onAddStand: (position: string) => void;
    onUpdateStand: (standId: string, updates: any) => void;
    onRemoveStand: (standId: string) => void;
    onAddSector: (standId: string, floorId: string) => void;
    onRemoveSector: (standId: string, floorId: string, sectorId: string) => void;
    onEditSector: (standId: string, floorId: string, sectorId: string) => void;
    onNext?: () => void;
}

const StadiumArchitectWorkspace: React.FC<StadiumArchitectWorkspaceProps> = ({
    venue,
    onUpdateVenue,
    onSave,
    onClose,
    onAddStand,
    onUpdateStand,
    onRemoveStand,
    onAddSector,
    onRemoveSector,
    onEditSector,
    onNext
}) => {
    const [selectedStandId, setSelectedStandId] = useState<string | null>(null);
    const [canvasZoom, setCanvasZoom] = useState(1);
    const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 });
    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const selectedStand = venue.stands?.find((s: any) => s.id === selectedStandId);

    // Auto-select new stands
    const prevStandCountRef = useRef(venue.stands?.length || 0);
    useEffect(() => {
        const currentCount = venue.stands?.length || 0;
        if (currentCount > prevStandCountRef.current) {
            // New stand added, select the last one
            const newStand = venue.stands[venue.stands.length - 1];
            if (newStand) {
                setSelectedStandId(newStand.id);
            }
        }
        prevStandCountRef.current = currentCount;
    }, [venue.stands]);

    const handleAddStand = useCallback((position: string) => {
        onAddStand(position);

        // Legacy support
        if (onUpdateVenue) {
            const newStand = {
                id: `stand-${Date.now()}`,
                name: `Bancada ${position}`,
                position,
                color: '#00d4ff',
                floors: [
                    {
                        id: `floor-${Date.now()}`,
                        name: 'Piso 1',
                        sectors: []
                    }
                ]
            };
            onUpdateVenue({
                stands: [...(venue.stands || []), newStand]
            });
        }
    }, [venue.stands, onUpdateVenue, onAddStand]);

    const handleUpdateStand = useCallback((standId: string, updates: any) => {
        onUpdateStand(standId, updates);

        if (onUpdateVenue) {
            const updatedStands = venue.stands.map((s: any) =>
                s.id === standId ? { ...s, ...updates } : s
            );
            onUpdateVenue({ stands: updatedStands });
        }
    }, [venue.stands, onUpdateVenue, onUpdateStand]);

    const handleDeleteStand = useCallback((standId: string) => {
        onRemoveStand(standId);

        if (onUpdateVenue) {
            const updatedStands = venue.stands.filter((s: any) => s.id !== standId);
            onUpdateVenue({ stands: updatedStands });
        }

        if (selectedStandId === standId) {
            setSelectedStandId(null);
        }
    }, [venue.stands, selectedStandId, onUpdateVenue, onRemoveStand]);

    const handleSave = useCallback(() => {
        setIsSaving(true);
        // Simulate a real persistence delay for "Digital Twin" feel
        setTimeout(() => {
            setIsSaving(false);
            onSave();
        }, 1200);
    }, [onSave]);

    const totalCapacity = venue.stands?.reduce((sum: number, stand: any) => {
        return sum + (stand.capacity || 0);
    }, 0) || 0;

    const standCount = venue.stands?.length || 0;
    const completionPercentage = Math.min((standCount / 4) * 100, 100);

    return (
        <div className="stadium-architect-workspace stadium-architect">
            {/* Canvas Layer */}
            <div className="stadium-canvas-layer">
                <BlueprintCanvas
                    stands={venue.stands || []}
                    selectedStandId={selectedStandId}
                    onSelectStand={setSelectedStandId}
                    onAddStand={handleAddStand}
                    zoom={canvasZoom}
                    pan={canvasPan}
                    onZoomChange={setCanvasZoom}
                    onPanChange={setCanvasPan}
                    onEditSector={onEditSector}
                />
            </div>

            {/* HUD Layer */}
            <div className="stadium-hud-layer">
                <TopBar
                    venueName={venue.name || 'Novo Estádio'}
                    onSave={handleSave}
                    onToggleConfig={() => setIsConfigPanelOpen(!isConfigPanelOpen)}
                />

                <ActionPalette
                    onUndo={() => console.log('Undo')}
                    onRedo={() => console.log('Redo')}
                    onZoomIn={() => setCanvasZoom(z => Math.min(z + 0.1, 2))}
                    onZoomOut={() => setCanvasZoom(z => Math.max(z - 0.1, 0.5))}
                />

                {isConfigPanelOpen && (
                    <FloatingConfigPanel
                        selectedStand={selectedStand}
                        onUpdateStand={handleUpdateStand}
                        onDeleteStand={handleDeleteStand}
                        onAddSector={onAddSector}
                        onRemoveSector={onRemoveSector}
                        onEditSector={onEditSector}
                    />
                )}

                <StatsPanel
                    totalCapacity={totalCapacity}
                    standCount={standCount}
                    completionPercentage={completionPercentage}
                />

                {/* Saving HUD Overlay */}
                {isSaving && (
                    <div className="stadium-save-overlay stadium-animate-fade-in">
                        <div className="save-card stadium-glass-intense">
                            <div className="save-spinner"></div>
                            <div className="save-text">
                                <div className="stadium-heading-md">A Sincronizar Arquitetura...</div>
                                <div className="stadium-label">Digital Twin Persistence Active</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StadiumArchitectWorkspace;
