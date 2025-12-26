import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Stand, Floor, Sector, Row, Venue } from '../services/venueService';

export interface VenueDetails {
  name: string;
  city: string;
  address: string;
  sportId: string;
  sportName?: string;
  photoUrl: string;
  capacity: number;
}

export interface VenueBuilderState {
  // Tab state
  currentTab: number;
  
  // Venue details (Tab 1)
  details: VenueDetails;
  
  // Stadium configuration (Tab 2)
  stands: Stand[];
  
  // Selected stand for editing
  selectedStandId: string | null;
  
  // Validation errors
  errors: {
    [key: string]: string;
  };
}

const initialState: VenueBuilderState = {
  currentTab: 0,
  details: {
    name: '',
    city: '',
    address: '',
    sportId: '',
    sportName: '',
    photoUrl: '',
    capacity: 0
  },
  stands: [],
  selectedStandId: null,
  errors: {}
};

export const useVenueBuilder = (initialVenue?: Venue) => {
  const [state, setState] = useState<VenueBuilderState>(() => {
    if (initialVenue) {
      return {
        currentTab: 0,
        details: {
          name: initialVenue.name,
          city: initialVenue.city,
          address: initialVenue.address || '',
          sportId: initialVenue.sportId,
          sportName: initialVenue.sportName || '',
          photoUrl: initialVenue.photoUrl || '',
          capacity: initialVenue.capacity || 0
        },
        stands: initialVenue.stands || [],
        selectedStandId: null,
        errors: {}
      };
    }
    return initialState;
  });

  // Tab navigation
  const goToTab = useCallback((tab: number) => {
    setState(prev => ({ ...prev, currentTab: tab }));
  }, []);

  const nextTab = useCallback(() => {
    setState(prev => ({ ...prev, currentTab: prev.currentTab + 1 }));
  }, []);

  const previousTab = useCallback(() => {
    setState(prev => ({ ...prev, currentTab: Math.max(0, prev.currentTab - 1) }));
  }, []);

  // Details management
  const updateDetails = useCallback((details: Partial<VenueDetails>) => {
    setState(prev => ({
      ...prev,
      details: { ...prev.details, ...details },
      errors: { ...prev.errors, details: '' }
    }));
  }, []);

  // Stand management
  const addStand = useCallback((position: 'north' | 'south' | 'east' | 'west') => {
    const existingStand = state.stands.find(s => s.position === position);
    if (existingStand) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, stands: `Bancada ${position} já existe` }
      }));
      return;
    }

    const positionNames = {
      north: 'Norte',
      south: 'Sul',
      east: 'Este',
      west: 'Oeste'
    };

    const colors = {
      north: '#2196F3',
      south: '#4CAF50',
      east: '#FF9800',
      west: '#E91E63'
    };

    const newStand: Stand = {
      id: uuidv4(),
      name: `Bancada ${positionNames[position]}`,
      position,
      color: colors[position],
      totalFloors: 0,
      totalCapacity: 0,
      floors: []
    };

    setState(prev => ({
      ...prev,
      stands: [...prev.stands, newStand],
      selectedStandId: newStand.id!,
      errors: { ...prev.errors, stands: '' }
    }));
  }, [state.stands]);

  const removeStand = useCallback((standId: string) => {
    setState(prev => ({
      ...prev,
      stands: prev.stands.filter(s => s.id !== standId),
      selectedStandId: prev.selectedStandId === standId ? null : prev.selectedStandId
    }));
  }, []);

  const selectStand = useCallback((standId: string | null) => {
    setState(prev => ({ ...prev, selectedStandId: standId }));
  }, []);

  const updateStand = useCallback((standId: string, updates: Partial<Stand>) => {
    setState(prev => ({
      ...prev,
      stands: prev.stands.map(s => s.id === standId ? { ...s, ...updates } : s)
    }));
  }, []);

  // Floor management
  const addFloor = useCallback((standId: string) => {
    setState(prev => {
      const stand = prev.stands.find(s => s.id === standId);
      if (!stand) return prev;

      const floorNumber = (stand.floors?.length || 0) + 1;
      const newFloor: Floor = {
        id: uuidv4(),
        name: `Piso ${floorNumber}`,
        floorNumber,
        totalSectors: 0,
        totalCapacity: 0,
        sectors: []
      };

      return {
        ...prev,
        stands: prev.stands.map(s => 
          s.id === standId 
            ? { 
                ...s, 
                floors: [...(s.floors || []), newFloor],
                totalFloors: (s.totalFloors || 0) + 1
              }
            : s
        )
      };
    });
  }, []);

  const removeFloor = useCallback((standId: string, floorId: string) => {
    setState(prev => ({
      ...prev,
      stands: prev.stands.map(s => 
        s.id === standId 
          ? { 
              ...s, 
              floors: (s.floors || []).filter(f => f.id !== floorId),
              totalFloors: Math.max(0, (s.totalFloors || 1) - 1)
            }
          : s
      )
    }));
  }, []);

  const updateFloor = useCallback((standId: string, floorId: string, updates: Partial<Floor>) => {
    setState(prev => ({
      ...prev,
      stands: prev.stands.map(s => 
        s.id === standId 
          ? {
              ...s,
              floors: (s.floors || []).map(f => 
                f.id === floorId ? { ...f, ...updates } : f
              )
            }
          : s
      )
    }));
  }, []);

  // Sector management
  const addSector = useCallback((standId: string, floorId: string) => {
    setState(prev => {
      const stand = prev.stands.find(s => s.id === standId);
      if (!stand) return prev;

      const floor = stand.floors?.find(f => f.id === floorId);
      if (!floor) return prev;

      const sectorNumber = (floor.sectors?.length || 0) + 1;
      const newSector: Sector = {
        id: uuidv4(),
        name: `Setor ${String.fromCharCode(64 + sectorNumber)}`, // A, B, C...
        sectorNumber,
        totalSeats: 0,
        configuredSeats: 0,
        rows: []
      };

      return {
        ...prev,
        stands: prev.stands.map(s => 
          s.id === standId 
            ? {
                ...s,
                floors: (s.floors || []).map(f => 
                  f.id === floorId 
                    ? {
                        ...f,
                        sectors: [...(f.sectors || []), newSector],
                        totalSectors: (f.totalSectors || 0) + 1
                      }
                    : f
                )
              }
            : s
        )
      };
    });
  }, []);

  const removeSector = useCallback((standId: string, floorId: string, sectorId: string) => {
    setState(prev => ({
      ...prev,
      stands: prev.stands.map(s => 
        s.id === standId 
          ? {
              ...s,
              floors: (s.floors || []).map(f => 
                f.id === floorId 
                  ? {
                      ...f,
                      sectors: (f.sectors || []).filter(sec => sec.id !== sectorId),
                      totalSectors: Math.max(0, (f.totalSectors || 1) - 1)
                    }
                  : f
              )
            }
          : s
      )
    }));
  }, []);

  const updateSector = useCallback((standId: string, floorId: string, sectorId: string, updates: Partial<Sector>) => {
    setState(prev => ({
      ...prev,
      stands: prev.stands.map(s => 
        s.id === standId 
          ? {
              ...s,
              floors: (s.floors || []).map(f => 
                f.id === floorId 
                  ? {
                      ...f,
                      sectors: (f.sectors || []).map(sec => 
                        sec.id === sectorId ? { ...sec, ...updates } : sec
                      )
                    }
                  : f
              )
            }
          : s
      )
    }));
  }, []);

  // Row management
  const addRow = useCallback((standId: string, floorId: string, sectorId: string, seatsCount: number) => {
    setState(prev => {
      const stand = prev.stands.find(s => s.id === standId);
      if (!stand) return prev;

      const floor = stand.floors?.find(f => f.id === floorId);
      if (!floor) return prev;

      const sector = floor.sectors?.find(sec => sec.id === sectorId);
      if (!sector) return prev;

      const rowNumber = (sector.rows?.length || 0) + 1;
      const newRow: Row = {
        id: uuidv4(),
        name: `Fila ${String.fromCharCode(64 + rowNumber)}`, // A, B, C...
        rowNumber,
        seatsCount
      };

      // Check if adding this row would exceed sector capacity
      const currentConfigured = sector.configuredSeats || 0;
      if (currentConfigured + seatsCount > sector.totalSeats) {
        return {
          ...prev,
          errors: {
            ...prev.errors,
            [`sector-${sectorId}`]: 'Número de assentos excede a capacidade do setor'
          }
        };
      }

      return {
        ...prev,
        stands: prev.stands.map(s => 
          s.id === standId 
            ? {
                ...s,
                floors: (s.floors || []).map(f => 
                  f.id === floorId 
                    ? {
                        ...f,
                        sectors: (f.sectors || []).map(sec => 
                          sec.id === sectorId 
                            ? {
                                ...sec,
                                rows: [...(sec.rows || []), newRow],
                                configuredSeats: currentConfigured + seatsCount
                              }
                            : sec
                        )
                      }
                    : f
                )
              }
            : s
        ),
        errors: { ...prev.errors, [`sector-${sectorId}`]: '' }
      };
    });
  }, []);

  const removeRow = useCallback((standId: string, floorId: string, sectorId: string, rowId: string) => {
    setState(prev => ({
      ...prev,
      stands: prev.stands.map(s => 
        s.id === standId 
          ? {
              ...s,
              floors: (s.floors || []).map(f => 
                f.id === floorId 
                  ? {
                      ...f,
                      sectors: (f.sectors || []).map(sec => {
                        if (sec.id !== sectorId) return sec;
                        
                        const rowToRemove = (sec.rows || []).find(r => r.id === rowId);
                        const seatsToRemove = rowToRemove?.seatsCount || 0;
                        
                        return {
                          ...sec,
                          rows: (sec.rows || []).filter(r => r.id !== rowId),
                          configuredSeats: Math.max(0, (sec.configuredSeats || 0) - seatsToRemove)
                        };
                      })
                    }
                  : f
              )
            }
          : s
      )
    }));
  }, []);

  const updateRow = useCallback((standId: string, floorId: string, sectorId: string, rowId: string, updates: Partial<Row>) => {
    setState(prev => ({
      ...prev,
      stands: prev.stands.map(s => 
        s.id === standId 
          ? {
              ...s,
              floors: (s.floors || []).map(f => 
                f.id === floorId 
                  ? {
                      ...f,
                      sectors: (f.sectors || []).map(sec => {
                        if (sec.id !== sectorId) return sec;
                        
                        const oldRow = (sec.rows || []).find(r => r.id === rowId);
                        const oldSeats = oldRow?.seatsCount || 0;
                        const newSeats = updates.seatsCount !== undefined ? updates.seatsCount : oldSeats;
                        const seatsDiff = newSeats - oldSeats;
                        
                        return {
                          ...sec,
                          rows: (sec.rows || []).map(r => 
                            r.id === rowId ? { ...r, ...updates } : r
                          ),
                          configuredSeats: (sec.configuredSeats || 0) + seatsDiff
                        };
                      })
                    }
                  : f
              )
            }
          : s
      )
    }));
  }, []);

  // Validation
  const validateTab1 = useCallback((): boolean => {
    const errors: { [key: string]: string } = {};

    if (!state.details.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }
    if (!state.details.city.trim()) {
      errors.city = 'Cidade é obrigatória';
    }
    if (!state.details.sportId) {
      errors.sportId = 'Desporto é obrigatório';
    }

    setState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  }, [state.details]);

  const validateTab2 = useCallback((): boolean => {
    const errors: { [key: string]: string } = {};

    if (state.stands.length === 0) {
      errors.stands = 'Adicione pelo menos uma bancada';
    }

    // Check if all sectors have rows configured
    state.stands.forEach(stand => {
      stand.floors?.forEach(floor => {
        floor.sectors?.forEach(sector => {
          if (!sector.rows || sector.rows.length === 0) {
            errors[`sector-${sector.id}`] = 'Configure as filas do setor';
          }
          if ((sector.configuredSeats || 0) !== sector.totalSeats) {
            errors[`sector-${sector.id}`] = 'Total de assentos não corresponde às filas configuradas';
          }
        });
      });
    });

    setState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  }, [state.stands]);

  // Calculate total capacity
  const calculateTotalCapacity = useCallback(() => {
    let total = 0;
    state.stands.forEach(stand => {
      stand.floors?.forEach(floor => {
        floor.sectors?.forEach(sector => {
          total += sector.configuredSeats || 0;
        });
      });
    });
    return total;
  }, [state.stands]);

  // Reset state
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    // State
    state,
    
    // Tab navigation
    goToTab,
    nextTab,
    previousTab,
    
    // Details
    updateDetails,
    
    // Stands
    addStand,
    removeStand,
    selectStand,
    updateStand,
    
    // Floors
    addFloor,
    removeFloor,
    updateFloor,
    
    // Sectors
    addSector,
    removeSector,
    updateSector,
    
    // Rows
    addRow,
    removeRow,
    updateRow,
    
    // Validation
    validateTab1,
    validateTab2,
    
    // Utilities
    calculateTotalCapacity,
    reset
  };
};
