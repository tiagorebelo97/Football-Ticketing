import React, { useState, useCallback, useRef, useEffect } from 'react';
import './StadiumArchitect.css';
import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BlueprintCanvas from './BlueprintCanvas';
import StadiumConfigSidebar from './StadiumConfigSidebar';
import StatsPanel from './StatsPanel';
import ActionPalette from './ActionPalette';
import { Venue, Stand } from '../../services/venueService';

interface StadiumArchitectWorkspaceProps {
    venue: Partial<Venue>;
    onUpdateVenue?: (updates: any) => void;
    onSave: () => void;
    onClose?: () => void;
    onAddStand: (position: 'north' | 'south' | 'east' | 'west') => void;
    onUpdateStand: (standId: string, updates: Partial<Stand>) => void;
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
    const { t } = useTranslation();
    const [selectedStandId, setSelectedStandId] = useState<string | null>(null);
    const [canvasZoom, setCanvasZoom] = useState(1);
    const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 });
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(selectedStandId === null);
    const [isSaving, setIsSaving] = useState(false);

    const selectedStand = venue.stands?.find((s: any) => s.id === selectedStandId);

    // Auto-select new stands and expand sidebar
    const prevStandCountRef = useRef(venue.stands?.length || 0);
    useEffect(() => {
        const stands = venue.stands || [];
        const currentCount = stands.length;
        if (currentCount > prevStandCountRef.current) {
            // New stand added, select the last one and expand sidebar
            const newStand = stands[currentCount - 1];
            if (newStand && newStand.id) {
                setSelectedStandId(newStand.id);
                setIsSidebarCollapsed(false);
            }
        }
        prevStandCountRef.current = currentCount;
    }, [venue.stands]);

    // Expand sidebar when a stand is manually selected
    useEffect(() => {
        // Trigger sidebar auto-retract
        window.dispatchEvent(new CustomEvent('stadium-architect-opened'));
    }, []);

    const handleSelectStand = useCallback((id: string | null) => {
        setSelectedStandId(id);
        setIsSidebarCollapsed(id === null);
    }, []);

    const handleAddStand = useCallback((position: 'north' | 'south' | 'east' | 'west') => {
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

    const handleUpdateStand = useCallback((standId: string, updates: Partial<Stand>) => {
        onUpdateStand(standId, updates);

        if (onUpdateVenue && venue.stands) {
            const updatedStands = venue.stands.map((s: any) =>
                s.id === standId ? { ...s, ...updates } : s
            );
            onUpdateVenue({ stands: updatedStands });
        }
    }, [venue.stands, onUpdateVenue, onUpdateStand]);

    const handleDeleteStand = useCallback((standId: string) => {
        onRemoveStand(standId);

        if (onUpdateVenue && venue.stands) {
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
        <div
            className="stadium-architect-workspace stadium-architect"
        >

            {/* Canvas Layer */}
            <div className={`stadium-canvas-layer ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <BlueprintCanvas
                    stands={venue.stands || []}
                    selectedStandId={selectedStandId}
                    onSelectStand={handleSelectStand}
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
                {/* Top Dashboard HUD - Consolidates actions and stats */}
                <div
                    className="stadium-top-dashboard"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="dashboard-stats-section">
                        <StatsPanel
                            totalCapacity={totalCapacity}
                            standCount={standCount}
                            completionPercentage={completionPercentage}
                        />
                    </div>

                    <div className="dashboard-actions-section">
                        <button
                            className="stadium-btn stadium-btn-primary save-btn"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            <Save size={18} />
                            {isSaving ? t('venueWizard.saving') : t('venueWizard.save')}
                        </button>
                    </div>
                </div>
                {/* TopBar removed as per requirements */}

                <ActionPalette
                    onUndo={() => console.log('Undo')}
                    onRedo={() => console.log('Redo')}
                    onZoomIn={() => setCanvasZoom(z => Math.min(z + 0.1, 2))}
                    onZoomOut={() => setCanvasZoom(z => Math.max(z - 0.1, 0.5))}
                />

                <StadiumConfigSidebar
                    selectedStand={selectedStand}
                    isCollapsed={isSidebarCollapsed}
                    onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    onSave={handleSave}
                    onUpdateStand={handleUpdateStand}
                    onDeleteStand={handleDeleteStand}
                    onAddSector={onAddSector}
                    onRemoveSector={onRemoveSector}
                    onEditSector={onEditSector}
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
