import React from 'react';
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
      // We still call onSave to trigger any parent logic, though primarily it's just closing
      onSave(totalSeats, sector.name);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content sector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Configurar {sector.name}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="sector-config-layout">
            {/* Left side: Canvas */}
            <div className="sector-canvas-section">
              <h3>Vista do Setor</h3>
              <SectorCanvas2D
                rows={sector.rows || []}
                totalSeats={totalSeats}
              />
            </div>

            {/* Right side: Configuration */}
            <div className="sector-config-section">
              <div className="sector-summary">
                <p><strong>Setor:</strong> {sector.name}</p>
                <p><strong>Capacidade:</strong> {totalSeats}</p>
                <p className="text-muted small">Para alterar o nome ou a capacidade total, utilize o painel principal na lista de setores.</p>
              </div>

              {totalSeats > 0 && (
                <>
                  <div className="divider"></div>

                  <RowConfigTable
                    rows={sector.rows || []}
                    totalSeats={totalSeats}
                    configuredSeats={configuredSeats}
                    onAddRow={onAddRow}
                    onRemoveRow={onRemoveRow}
                    onUpdateRow={onUpdateRow}
                  />
                </>
              )}

              {!isComplete && totalSeats > 0 && (
                <div className="warning-box">
                  <strong>⚠️ Atenção:</strong> Configure todas as filas para atingir a capacidade total de {totalSeats} assentos.
                </div>
              )}

              {isComplete && (
                <div className="success-box">
                  <strong>✓ Completo:</strong> Todas as {sector.rows?.length || 0} filas estão configuradas corretamente!
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleDone}
            disabled={!isComplete}
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectorModal;
