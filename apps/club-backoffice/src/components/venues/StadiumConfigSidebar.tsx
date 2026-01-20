import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Copy, Edit2, ChevronLeft } from 'lucide-react';
import { Stand, Floor, Sector } from '../../services/venueService';

interface StadiumConfigSidebarProps {
    selectedStand: Stand | null | undefined;
    isCollapsed: boolean;
    onToggle: () => void;
    onSave: () => void;
    onUpdateStand: (standId: string, updates: Partial<Stand>) => void;
    onDeleteStand: (standId: string) => void;
    onAddSector: (standId: string, floorId: string) => void;
    onRemoveSector: (standId: string, floorId: string, sectorId: string) => void;
    onEditSector: (standId: string, floorId: string, sectorId: string) => void;
}

const StadiumConfigSidebar: React.FC<StadiumConfigSidebarProps> = ({
    selectedStand,
    isCollapsed,
    onToggle,
    onSave,
    onUpdateStand,
    onDeleteStand,
    onAddSector,
    onRemoveSector,
    onEditSector
}) => {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        info: true,
        floors: true
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <div
            className={`stadium-config-sidebar stadium-glass-intense ${isCollapsed ? 'collapsed' : ''}`}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Retract Toggle */}
            <button
                className="stadium-sidebar-toggle"
                onClick={onToggle}
                title={isCollapsed ? "Expandir Configurações" : "Recolher Configurações"}
            >
                {isCollapsed ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
            </button>

            <div className="stadium-sidebar-content">
                {!selectedStand ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 'calc(100% - 100px)',
                        textAlign: 'center',
                        padding: '40px 20px'
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🏟️</div>
                        <div className="stadium-heading-md" style={{ marginBottom: 8 }}>
                            Selecione uma Bancada
                        </div>
                        <div className="stadium-label">
                            Clique numa zona do mapa para adicionar ou selecionar uma bancada
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Stand Info Section */}
                        <div className="stadium-config-section">
                            <div
                                className="stadium-config-section-header"
                                onClick={() => toggleSection('info')}
                            >
                                <div className="stadium-heading-md">
                                    {selectedStand.name}
                                </div>
                                {expandedSections.info ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </div>

                            {expandedSections.info && (
                                <div className="stadium-animate-fade-in">
                                    <div style={{ marginBottom: 12 }}>
                                        <label className="stadium-label" style={{ display: 'block', marginBottom: 6 }}>
                                            Nome da Bancada
                                        </label>
                                        <input
                                            type="text"
                                            className="stadium-input"
                                            value={selectedStand.name}
                                            onChange={(e) => selectedStand.id && onUpdateStand(selectedStand.id, { name: e.target.value })}
                                            placeholder="Ex: Bancada Norte"
                                        />
                                    </div>

                                    <div style={{ marginBottom: 12 }}>
                                        <label className="stadium-label" style={{ display: 'block', marginBottom: 6 }}>
                                            Cor
                                        </label>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            {['#00d4ff', '#00ff88', '#ffaa00', '#ff4466', '#a855f7'].map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => selectedStand.id && onUpdateStand(selectedStand.id, { color })}
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: 8,
                                                        background: color,
                                                        border: selectedStand.color === color ? '3px solid white' : '1px solid rgba(255,255,255,0.2)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <span className="stadium-badge stadium-badge-info">
                                            {selectedStand.position}
                                        </span>
                                        <span className="stadium-badge stadium-badge-success">
                                            {selectedStand.totalCapacity || 0} lugares
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Floors Section */}
                        <div className="stadium-config-section">
                            <div
                                className="stadium-config-section-header"
                                onClick={() => toggleSection('floors')}
                            >
                                <div className="stadium-heading-md">
                                    Pisos ({selectedStand.floors?.length || 0})
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <button
                                        className="stadium-btn stadium-btn-ghost"
                                        style={{ padding: '6px 12px' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (selectedStand.id) {
                                                const newFloor = {
                                                    id: `floor-${Date.now()}`,
                                                    name: `Piso ${(selectedStand.floors?.length || 0) + 1}`,
                                                    floorNumber: (selectedStand.floors?.length || 0) + 1,
                                                    sectors: []
                                                };
                                                onUpdateStand(selectedStand.id, {
                                                    floors: [...(selectedStand.floors || []), newFloor]
                                                });
                                            }
                                        }}
                                    >
                                        <Plus size={16} />
                                    </button>
                                    {expandedSections.floors ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                </div>
                            </div>

                            {expandedSections.floors && (
                                <div className="stadium-animate-fade-in">
                                    {selectedStand.floors?.map((floor: any, index: number) => (
                                        <div key={floor.id} className="stadium-card">
                                            <div className="stadium-card-header">
                                                <div>
                                                    <div style={{ fontWeight: 600, color: 'white' }}>{floor.name}</div>
                                                    <div className="stadium-label" style={{ marginTop: 4 }}>
                                                        {floor.sectors?.length || 0} setores
                                                    </div>

                                                    {/* Sector List */}
                                                    {floor.sectors && floor.sectors.length > 0 && (
                                                        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                            {floor.sectors.map((sector: any) => (
                                                                <div key={sector.id} style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    background: 'rgba(255,255,255,0.05)',
                                                                    padding: '4px 8px',
                                                                    borderRadius: 4
                                                                }}>
                                                                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                                                                        {sector.name}
                                                                    </span>
                                                                    <div style={{ display: 'flex', gap: 4 }}>
                                                                        <button
                                                                            className="stadium-btn stadium-btn-ghost"
                                                                            style={{ padding: 4 }}
                                                                            onClick={() => selectedStand.id && onEditSector(selectedStand.id, floor.id, sector.id)}
                                                                            title="Editar Setor"
                                                                        >
                                                                            <Edit2 size={12} />
                                                                        </button>
                                                                        <button
                                                                            className="stadium-btn stadium-btn-ghost"
                                                                            style={{ padding: 4, color: '#ff4d4d' }}
                                                                            onClick={() => selectedStand.id && onRemoveSector(selectedStand.id, floor.id, sector.id)}
                                                                            title="Remover Setor"
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <button
                                                        className="stadium-btn stadium-btn-ghost"
                                                        style={{ padding: 6 }}
                                                        title="Adicionar Setor"
                                                        onClick={() => selectedStand.id && onAddSector(selectedStand.id, floor.id)}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                    <button
                                                        className="stadium-btn stadium-btn-ghost"
                                                        style={{ padding: 6 }}
                                                        title="Duplicar piso"
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                    <button
                                                        className="stadium-btn stadium-btn-ghost"
                                                        style={{ padding: 6 }}
                                                        title="Remover piso"
                                                        onClick={() => {
                                                            if (selectedStand.id) {
                                                                const updatedFloors = (selectedStand.floors || []).filter((_: any, i: number) => i !== index);
                                                                onUpdateStand(selectedStand.id, { floors: updatedFloors });
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {(!selectedStand.floors || selectedStand.floors.length === 0) && (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '20px',
                                            color: 'rgba(255,255,255,0.4)'
                                        }}>
                                            Nenhum piso adicionado
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <button
                                className="stadium-btn stadium-btn-secondary"
                                style={{ width: '100%', justifyContent: 'center' }}
                                onClick={() => selectedStand.id && onDeleteStand(selectedStand.id)}
                            >
                                <Trash2 size={16} />
                                Remover Bancada
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default StadiumConfigSidebar;
