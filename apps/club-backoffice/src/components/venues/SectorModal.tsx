import React from 'react';
import { createPortal } from 'react-dom';
import { Sector, Row } from '../../services/venueService';
import SectorCanvas2D from './SectorCanvas2D';
import RowConfigTable from './RowConfigTable';

interface SectorModalProps {
  isOpen: boolean;
  sector: Sector | null;
  onClose: () => void;
  onSave: (totalSeats: number, name?: string) => void;
  onAddRow: (seatsCount: number) => void;
  onRemoveRow: (rowId: string) => void;
  onUpdateRow: (rowId: string, updates: Partial<Row>) => void;
}

const SectorModal: React.FC<SectorModalProps> = ({
  isOpen,
  sector,
  onClose,
  onSave,
  onAddRow,
  onRemoveRow,
  onUpdateRow
}) => {
  if (!isOpen || !sector) {
    return null;
  }

  const totalSeats = sector.totalSeats || 0;
  const configuredSeats = sector.configuredSeats || 0;
  const isComplete = configuredSeats === totalSeats && totalSeats > 0;

  const handleDone = () => {
    if (isComplete) {
      onSave(totalSeats, sector.name);
      onClose();
    }
  };

  return createPortal(
    <div className="architect-overlay" onClick={onClose}>
      <div className="inspector-panel-container" onClick={(e) => e.stopPropagation()}>
        {/* Header with Blueprint Metadata */}
        <div className="inspector-header">
          <div className="header-identity">
            <span className="inspector-badge">MODO INSPEÇÃO: SETOR</span>
            <h2>{sector.name} <small>Architecture ID: {sector.id?.slice(0, 8)}</small></h2>
          </div>
          <button className="inspector-close" onClick={onClose} title="Fechar Inspetor">✕</button>
        </div>

        <div className="inspector-body">
          <div className="sector-architect-grid">
            {/* Left side: Immersive Canvas */}
            <div className="inspector-canvas-area">
              <div className="canvas-label-architect">PROJEÇÃO DE MALHA 2D</div>
              <SectorCanvas2D
                rows={sector.rows || []}
                totalSeats={totalSeats}
              />
              <div className="canvas-footer-blueprint">
                <span>COORDENADAS LOCAIS VALIDATED</span>
                <span className="blink">● REC</span>
              </div>
            </div>

            {/* Right side: Specialized Configuration Panel */}
            <div className="inspector-config-area">
              <RowConfigTable
                rows={sector.rows || []}
                totalSeats={totalSeats}
                configuredSeats={configuredSeats}
                onAddRow={onAddRow}
                onRemoveRow={onRemoveRow}
                onUpdateRow={onUpdateRow}
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="inspector-actions">
          <div className="actions-info">
            <span className="info-icon">🛈</span>
            Exatidão de assentos é crítica para o sistema de bilhética.
          </div>
          <div className="actions-btns">
            <button className="btn-architect-secondary" onClick={onClose}>
              DESCARTAR
            </button>
            <button
              className="btn-architect-primary"
              onClick={handleDone}
              disabled={!isComplete}
            >
              FINALIZAR E VALIDAR
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SectorModal;
