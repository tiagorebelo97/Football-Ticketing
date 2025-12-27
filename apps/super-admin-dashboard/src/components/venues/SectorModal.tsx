import React, { useState, useEffect } from 'react';
import { Sector } from '../../services/venueService';
import SectorCanvas2D from './SectorCanvas2D';
import RowConfigTable from './RowConfigTable';

interface SectorModalProps {
  isOpen: boolean;
  sector: Sector | null;
  onClose: () => void;
  onSave: (totalSeats: number, name?: string) => void;
  onAddRow: (seatsCount: number) => void;
  onRemoveRow: (rowId: string) => void;
  onUpdateRow: (rowId: string, seatsCount: number) => void;
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
  const [totalSeats, setTotalSeats] = useState<number>(0);
  const [sectorName, setSectorName] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (sector) {
      setTotalSeats(sector.totalSeats || 0);
      setSectorName(sector.name || '');
      setHasChanges(false);
    }
  }, [sector]);

  const handleSave = () => {
    if (sector && (sector.configuredSeats || 0) === totalSeats) {
      onSave(totalSeats, sectorName.trim() || sector.name);
      onClose();
    }
  };

  const handleTotalSeatsChange = (value: number) => {
    if (value >= (sector?.configuredSeats || 0)) {
      setTotalSeats(value);
      setHasChanges(true);
    }
  };

  if (!isOpen || !sector) {
    return null;
  }

  const isComplete = (sector.configuredSeats || 0) === totalSeats && totalSeats > 0;
  const canSave = isComplete;

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
              <div className="form-group">
                <label htmlFor="sectorName">Nome do Setor *</label>
                <input
                  id="sectorName"
                  type="text"
                  className="form-control"
                  value={sectorName}
                  onChange={(e) => setSectorName(e.target.value)}
                  placeholder="Ex: Setor A"
                />
              </div>

              <div className="form-group">
                <label htmlFor="totalSeats">Capacidade Total do Setor *</label>
                <input
                  id="totalSeats"
                  type="number"
                  min="1"
                  max="10000"
                  className="form-control"
                  value={totalSeats}
                  onChange={(e) => handleTotalSeatsChange(parseInt(e.target.value) || 0)}
                />
                <small className="form-text">
                  Defina o número total de assentos disponíveis neste setor.
                </small>
              </div>

              {totalSeats > 0 && (
                <>
                  <div className="divider"></div>

                  <RowConfigTable
                    rows={sector.rows || []}
                    totalSeats={totalSeats}
                    configuredSeats={sector.configuredSeats || 0}
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
            onClick={handleSave}
            disabled={!canSave}
          >
            Guardar Configuração
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectorModal;
