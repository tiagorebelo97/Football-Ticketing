import React, { useState } from 'react';
import { Row } from '../../services/venueService';

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
  const [newRowSeats, setNewRowSeats] = useState<number>(10);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingSeats, setEditingSeats] = useState<number>(0);
  const [editingName, setEditingName] = useState<string>('');

  const handleAddRow = () => {
    if (newRowSeats > 0 && configuredSeats + newRowSeats <= totalSeats) {
      onAddRow(newRowSeats);
      setNewRowSeats(10);
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
    <div className="row-config-table">
      <div className="table-header">
        <h4>Configuração de Filas</h4>
        <div className="seats-summary">
          <span className={remainingSeats === 0 ? 'success' : ''}>
            {configuredSeats} / {totalSeats} lugares configurados
          </span>
          {remainingSeats > 0 && (
            <span className="remaining"> ({remainingSeats} restantes)</span>
          )}
        </div>
      </div>

      {rows.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Fila</th>
              <th>Nº de Assentos</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="row-name">
                  {editingRowId === row.id ? (
                    <input
                      type="text"
                      className="form-control-sm"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      autoFocus
                      style={{ width: '80px', marginRight: '5px' }}
                    />
                  ) : (
                    row.name
                  )}
                </td>
                <td>
                  {editingRowId === row.id ? (
                    <input
                      type="number"
                      min="1"
                      max={totalSeats}
                      className="form-control-sm"
                      value={editingSeats}
                      onChange={(e) => setEditingSeats(parseInt(e.target.value) || 0)}
                    />
                  ) : (
                    row.seatsCount
                  )}
                </td>
                <td className="actions">
                  {editingRowId === row.id ? (
                    <div className="edit-actions">
                      <button
                        className="btn btn-xs btn-success"
                        onClick={handleSaveEdit}
                      >
                        ✓
                      </button>
                      <button
                        className="btn btn-xs btn-secondary"
                        onClick={handleCancelEdit}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="row-actions">
                      <button
                        className="btn btn-xs btn-secondary"
                        onClick={() => handleStartEdit(row)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-xs btn-danger"
                        onClick={() => onRemoveRow(row.id!)}
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {canAddRow && (
        <div className="add-row-section">
          <div className="add-row-form">
            <label>Assentos na nova fila:</label>
            <input
              type="number"
              min="1"
              max={remainingSeats}
              className="form-control-sm"
              value={newRowSeats}
              onChange={(e) => setNewRowSeats(parseInt(e.target.value) || 0)}
            />
            <button
              className="btn btn-sm btn-primary"
              onClick={handleAddRow}
              disabled={newRowSeats <= 0 || newRowSeats > remainingSeats}
            >
              + Adicionar Fila
            </button>
          </div>
          {newRowSeats > remainingSeats && (
            <div className="warning-message">
              Número de assentos excede os lugares restantes ({remainingSeats})
            </div>
          )}
        </div>
      )}

      {!canAddRow && rows.length > 0 && (
        <div className="success-message">
          ✓ Todos os assentos do setor foram configurados!
        </div>
      )}

      {rows.length === 0 && (
        <div className="empty-state">
          <p>Nenhuma fila configurada. Adicione a primeira fila para começar.</p>
        </div>
      )}
    </div>
  );
};

export default RowConfigTable;
