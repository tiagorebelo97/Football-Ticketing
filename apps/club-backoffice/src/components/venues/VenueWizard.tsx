import React, { useState, useMemo } from 'react';
import { useVenueBuilder } from '../../hooks/useVenueBuilder';
import { Venue } from '../../services/venueService';
import VenueDetailsTab from './VenueDetailsTab';
import VenueStadiumTab from './VenueStadiumTab';
import VenueReviewTab from './VenueReviewTab';
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
    duplicateFloor,
    addSector,
    removeSector,
    updateSector,
    addRow,
    removeRow,
    updateRow,
    validateTab1,
    validateTab2,
    isTab1Valid,
    calculateTotalCapacity,
    undo,
    clearDraft,
    updateStandColor
  } = useVenueBuilder(initialVenue || initialData);

  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string>('');

  const tabs = [
    { id: 0, label: 'Identidade', icon: '🆔', description: 'Dados básicos' },
    { id: 1, label: 'Arquitetura', icon: '🏟️', description: 'Desenho do estádio' },
    { id: 2, label: 'Publicação', icon: '🚀', description: 'Revisão final' }
  ];

  // Memoize total capacity calculation to ensure it updates when stands change
  const totalCapacity = useMemo(() => calculateTotalCapacity(), [state.stands]);

  const handleNext = () => {
    if (state.currentTab === 0) {
      if (!validateTab1()) return;
      if (isSuperAdmin && !state.details.clubId) {
        setSaveError('Por favor, selecione um clube');
        return;
      }
      nextTab();
    } else if (state.currentTab === 1) {
      if (!validateTab2()) return;
      nextTab();
    }
  };

  const handlePrevious = () => {
    previousTab();
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');

    try {
      const venue: Venue = {
        id: initialVenue?.id || initialData?.id,
        clubId: state.details.clubId,
        name: state.details.name,
        city: state.details.city,
        address: state.details.address,
        sportId: state.details.sportId,
        photoUrl: state.details.photoUrl,
        interiorPhotos: state.details.interiorPhotos,
        vipPhotos: state.details.vipPhotos,
        facilities: state.details.facilities,
        accessibility: state.details.accessibility,
        capacity: totalCapacity,
        stands: state.stands,
        latitude: state.details.latitude,
        longitude: state.details.longitude
      };

      await onSave(venue);
      clearDraft();
    } catch (error: any) {
      console.error('Error saving venue:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao guardar venue';
      setSaveError(errorMessage);
      setSaving(false);
    }
  };

  return (
    <div className="venue-wizard">
      <div className="wizard-header">
        <div className="header-main">
          <h1>{initialVenue ? 'Editar Arquitetura' : 'Nova Infraestrutura'}</h1>
          <div className="header-badge">Executive Architect v2.0</div>
        </div>

        {/* Premium Stepper */}
        <div className="wizard-stepper">
          {tabs.map((tab, index) => (
            <React.Fragment key={tab.id}>
              <div
                className={`stepper-item ${state.currentTab === tab.id ? 'active' : ''} ${state.currentTab > tab.id ? 'completed' : ''} ${tab.id > 0 && !isTab1Valid ? 'disabled' : ''}`}
                onClick={() => (state.currentTab > tab.id || (tab.id === 1 && isTab1Valid)) && goToTab(tab.id)}
              >
                <div className="stepper-icon-container">
                  <div className="stepper-icon">{state.currentTab > tab.id ? '✓' : tab.icon}</div>
                </div>
                <div className="stepper-content">
                  <div className="stepper-label">{tab.label}</div>
                  <div className="stepper-desc">{tab.description}</div>
                </div>
              </div>
              {index < tabs.length - 1 && (
                <div className={`stepper-connector ${state.currentTab > tab.id ? 'active' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="wizard-body">
        {/* Tab 0: Details (Identity) */}
        {state.currentTab === 0 && (
          <VenueDetailsTab
            details={state.details}
            errors={state.errors}
            onUpdate={updateDetails}
            isSuperAdmin={isSuperAdmin}
          />
        )}

        {/* Tab 1: Stadium Configuration (Architecture) */}
        {state.currentTab === 1 && (
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
            onDuplicateFloor={duplicateFloor}
            onUpdateStandColor={updateStandColor}
            onUndo={undo}
            onNext={nextTab}
          />
        )}

        {/* Tab 2: Publication (Review) */}
        {state.currentTab === 2 && (
          <VenueReviewTab
            details={state.details}
            stands={state.stands}
            totalCapacity={totalCapacity}
          />
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
              <span className="capacity-value">{totalCapacity}</span>
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
