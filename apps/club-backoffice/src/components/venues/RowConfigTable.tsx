import React, { useState } from 'react';
import { Row } from '../../services/venueService';
import { useTranslation } from 'react-i18next';

interface RowConfigTableProps {
  rows: Row[];
  totalSeats: number;
  configuredSeats: number;
  onAddRow: (seatsCount: number) => void;
  onRemoveRow: (rowId: string) => void;
  onUpdateRow: (rowId: string, updates: Partial<Row>) => void;
}

const RowConfigTable: React.FC<RowConfigTableProps> = ({
  rows,
  totalSeats,
  configuredSeats,
  onAddRow,
  onRemoveRow,
  onUpdateRow
}) => {
  const { t } = useTranslation();
  const [newRowSeats, setNewRowSeats] = useState<number>(10);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingSeats, setEditingSeats] = useState<number>(0);
  const [editingName, setEditingName] = useState<string>('');

  const handleAddRow = () => {
    if (newRowSeats > 0 && configuredSeats + newRowSeats <= totalSeats) {
      onAddRow(newRowSeats);
      setNewRowSeats(1 || 10); // Reset to 10 or minimum
    }
  };

  const handleStartEdit = (row: Row) => {
    setEditingRowId(row.id!);
    setEditingSeats(row.seatsCount);
    setEditingName(row.name);
  };

  const handleSaveEdit = () => {
    if (editingRowId && editingSeats > 0 && editingName.trim()) {
      onUpdateRow(editingRowId, { seatsCount: editingSeats, name: editingName });
      setEditingRowId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
  };

  const remainingSeats = totalSeats - configuredSeats;
  const canAddRow = remainingSeats > 0;

  return (
    <div className="row-config-premium">
      <div className="premium-config-header">
        <div className="header-labels">
          <label>{t('venueWizard.meshConfiguration')}</label>
          <h3>{t('venueWizard.rowManagement')}</h3>
        </div>
        <div className={`seats-counter ${remainingSeats === 0 ? 'fully-configured' : ''}`}>
          <div className="counter-main">
            <span className="current">{configuredSeats}</span>
            <span className="separator">/</span>
            <span className="total">{totalSeats}</span>
          </div>
          <div className="counter-label">{t('venueWizard.allocatedSeats')}</div>
        </div>
      </div>

      <div className="blueprint-divider"></div>

      {rows.length > 0 && (
        <div className="table-container-premium">
          <table className="architect-table">
            <thead>
              <tr>
                <th>CÓDIGO FILA</th>
                <th>{t('venueWizard.capacity').toUpperCase()}</th>
                <th className="text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className={editingRowId === row.id ? 'row-editing' : ''}>
                  <td className="col-id">
                    {editingRowId === row.id ? (
                      <input
                        type="text"
                        className="premium-input-sm"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <span className="row-id-badge">{row.name}</span>
                    )}
                  </td>
                  <td className="col-seats">
                    {editingRowId === row.id ? (
                      <input
                        type="number"
                        min="1"
                        max={totalSeats}
                        className="premium-input-sm"
                        value={editingSeats}
                        onChange={(e) => setEditingSeats(parseInt(e.target.value) || 0)}
                      />
                    ) : (
                      <span className="seats-val">{row.seatsCount} <small>{t('venueWizard.seats').toLowerCase()}</small></span>
                    )}
                  </td>
                  <td className="col-actions text-right">
                    {editingRowId === row.id ? (
                      <div className="action-btns-premium">
                        <button className="btn-icon btn-save" onClick={handleSaveEdit} title={t('venueWizard.save')}>✓</button>
                        <button className="btn-icon btn-cancel" onClick={handleCancelEdit} title={t('venueWizard.cancel')}>✕</button>
                      </div>
                    ) : (
                      <div className="action-btns-premium">
                        <button className="btn-underline" onClick={() => handleStartEdit(row)}>{t('venueWizard.edit')}</button>
                        <button className="btn-underline btn-danger" onClick={() => onRemoveRow(row.id!)}>{t('venueWizard.remove')}</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canAddRow ? (
        <div className="add-row-architect">
          <div className="add-controls">
            <div className="input-group-premium">
              <label>{t('venueWizard.newSeats')}</label>
              <input
                type="number"
                min="1"
                max={remainingSeats}
                className="premium-input-main"
                value={remainingSeats < newRowSeats ? remainingSeats : newRowSeats}
                onChange={(e) => setNewRowSeats(parseInt(e.target.value) || 0)}
              />
            </div>
            <button
              className="btn-architect-primary"
              onClick={handleAddRow}
              disabled={newRowSeats <= 0 || newRowSeats > remainingSeats}
            >
              <span className="plus-icon">+</span> {t('venueWizard.addRowToMesh')}
            </button>
          </div>
          {newRowSeats > remainingSeats && (
            <div className="architect-alert warning">
              <span className="alert-icon">⚠️</span>
              {t('venueWizard.capacityExceeded', { count: remainingSeats })}
            </div>
          )}
        </div>
      ) : (
        rows.length > 0 && (
          <div className="architect-alert success">
            <span className="alert-icon">✓</span>
            {t('venueWizard.occupationValidated')}
          </div>
        )
      )}

      {rows.length === 0 && (
        <div className="architect-empty-state">
          <div className="empty-icon">📐</div>
          <p>{t('venueWizard.startDrawingInstruction')}</p>
        </div>
      )}
    </div>
  );
};

export default RowConfigTable;
