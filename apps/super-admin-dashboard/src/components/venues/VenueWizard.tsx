import React from 'react';
import { useVenueBuilder } from '../../hooks/useVenueBuilder';
import { Venue } from '../../services/venueService';
import VenueDetailsTab from './VenueDetailsTab';
import VenueStadiumTab from './VenueStadiumTab';
import ErrorBoundary from '../ErrorBoundary';
import './VenueWizard.css';

interface VenueWizardProps {
  initialVenue?: Venue;
  onSave: (venue: Venue) => Promise<void>;
  onCancel: () => void;
  isSuperAdmin?: boolean;
  initialData?: Venue;
}

const VenueWizard: React.FC<VenueWizardProps> = ({ initialVenue, onSave, onCancel, isSuperAdmin = false, initialData }) => {
  const {
    state,
    goToTab,
    nextTab,
    previousTab,
    updateDetails,
    addStand,
    removeStand,
    selectStand,
    updateStand,
    updateStandName,
    addFloor,
    removeFloor,
    updateFloor,
    addSector,
    removeSector,
    updateSector,
    addRow,
    removeRow,
    updateRow,
    validateTab1,
    validateTab2,
    isTab1Valid,
    calculateTotalCapacity
  } = useVenueBuilder(initialVenue || initialData);

  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string>('');

  const tabs = [
    { id: 0, label: 'Detalhes da Venue', icon: '📋' },
    { id: 1, label: 'Configuração do Estádio', icon: '🏟️' }
  ];

  const handleNext = () => {
    if (state.currentTab === 0) {
      // Validate basic fields using the hook's validation
      if (!validateTab1()) {
        return;
      }

      // Additional validation for super admin: clubId is required
      if (isSuperAdmin && !state.details.clubId) {
        setSaveError('Por favor, selecione um clube');
        return;
      }

      nextTab();
    }
  };

  const handlePrevious = () => {
    previousTab();
  };

  const handleSave = async () => {
    if (!validateTab2()) {
      return;
    }

    setSaving(true);
    setSaveError('');

    try {
      const totalCapacity = calculateTotalCapacity();

      const venue: Venue = {
        id: initialVenue?.id || initialData?.id,
        clubId: state.details.clubId,
        name: state.details.name,
        city: state.details.city,
        address: state.details.address,
        sportId: state.details.sportId,
        photoUrl: state.details.photoUrl,
        capacity: totalCapacity,
        stands: state.stands
      };

      await onSave(venue);
    } catch (error: any) {
      console.error('Error saving venue:', error);
      setSaveError(error.message || 'Erro ao guardar venue');
      setSaving(false);
    }
  };

  return (
    <div className="venue-wizard">
      <div className="wizard-header">
        <h1>{initialVenue ? 'Editar Venue' : 'Criar Nova Venue'}</h1>

        {/* Tab Navigation */}
        <div className="wizard-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`wizard-tab ${state.currentTab === tab.id ? 'active' : ''} ${tab.id > 0 && !isTab1Valid ? 'disabled' : ''
                }`}
              onClick={() => tab.id <= state.currentTab && goToTab(tab.id)}
              disabled={tab.id > 0 && state.currentTab < tab.id && !isTab1Valid}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="wizard-body">
        {/* Tab 1: Details */}
        {state.currentTab === 0 && (
          <VenueDetailsTab
            details={state.details}
            errors={state.errors}
            onUpdate={updateDetails}
            isSuperAdmin={isSuperAdmin}
          />
        )}

        {/* Tab 2: Stadium Configuration */}
        {state.currentTab === 1 && (
          <ErrorBoundary>
            <VenueStadiumTab
              sportCode={state.details.sportCode || 'football'}
              stands={state.stands}
              selectedStandId={state.selectedStandId}
              errors={state.errors}
              onAddStand={addStand}
              onRemoveStand={removeStand}
              onSelectStand={selectStand}
              onUpdateStandName={updateStandName}
              onAddFloor={addFloor}
              onRemoveFloor={removeFloor}
              onAddSector={addSector}
              onRemoveSector={removeSector}
              onUpdateSector={updateSector}
              onAddRow={addRow}
              onRemoveRow={removeRow}
              onUpdateRow={updateRow}
            />
          </ErrorBoundary>
        )}
      </div>

      {saveError && (
        <div className="wizard-error">
          <strong>Erro:</strong> {saveError}
        </div>
      )}

      <div className="wizard-footer">
        <div className="footer-left">
          <button className="btn btn-secondary" onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
        </div>

        <div className="footer-center">
          {state.currentTab === 1 && (
            <div className="capacity-display">
              <span className="capacity-label">Capacidade Total:</span>
              <span className="capacity-value">{calculateTotalCapacity()}</span>
              <span className="capacity-unit">lugares</span>
            </div>
          )}
        </div>

        <div className="footer-right">
          {state.currentTab > 0 && (
            <button className="btn btn-secondary" onClick={handlePrevious} disabled={saving}>
              ← Anterior
            </button>
          )}

          {state.currentTab < tabs.length - 1 ? (
            <button className="btn btn-primary" onClick={handleNext}>
              Seguinte →
            </button>
          ) : (
            <button
              className="btn btn-success"
              onClick={handleSave}
              disabled={saving || state.stands.length === 0}
            >
              {saving ? 'A guardar...' : initialVenue ? 'Atualizar Venue' : 'Criar Venue'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VenueWizard;
