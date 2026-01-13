
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Stand, Floor, Sector, Row, Venue } from '../services/venueService';

export interface VenueDetails {
  clubId?: string;
  name: string;
  city: string;
  address: string;
  sportId: string;
  sportCode?: string;
  sportName?: string;
  photoUrl: string; // Main photo
  interiorPhotos?: string[];
  vipPhotos?: string[];
  facilities?: string[];
  accessibility?: string[];
  capacity: number;
  latitude?: number;
  longitude?: number;
}

export interface VenueBuilderState {
  currentTab: number;
  details: VenueDetails;
  stands: Stand[];
  selectedStandId: string | null;
  errors: { [key: string]: string };
}

const initialState: VenueBuilderState = {
  currentTab: 0,
  details: {
    name: '',
    city: '',
    address: '',
    sportId: '',
    sportCode: '',
    sportName: '',
    photoUrl: '',
    interiorPhotos: [],
    vipPhotos: [],
    facilities: [],
    accessibility: [],
    capacity: 0
  },
  stands: [],
  selectedStandId: null,
  errors: {}
};

const DRAFT_KEY = 'venue_builder_draft';

export const useVenueBuilder = (initialVenue?: Venue) => {
  const [state, setState] = useState<VenueBuilderState>(() => {
    // 1. Try to load from initialVenue (Edit mode)
    if (initialVenue) {
      return {
        currentTab: 0,
        details: {
          clubId: initialVenue.clubId,
          name: initialVenue.name,
          city: initialVenue.city,
          address: initialVenue.address || '',
          sportId: initialVenue.sportId,
          sportCode: initialVenue.sportCode || '',
          sportName: initialVenue.sportName || '',
          photoUrl: initialVenue.photoUrl || '',
          interiorPhotos: initialVenue.interiorPhotos || [],
          vipPhotos: initialVenue.vipPhotos || [],
          facilities: initialVenue.facilities || [],
          accessibility: initialVenue.accessibility || [],
          capacity: initialVenue.capacity || 0,
          latitude: initialVenue.latitude,
          longitude: initialVenue.longitude
        },
        stands: (initialVenue.stands || []).map(s => ({
          ...s,
          id: s.id || uuidv4()
        })),
        selectedStandId: null,
        errors: {}
      };
    }

    // 2. Try to load from localStorage (Draft mode)
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        return { ...parsed, errors: {} };
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }

    return initialState;
  });

  // Persist state to localStorage
  useEffect(() => {
    if (!initialVenue) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
    }
  }, [state, initialVenue]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  // History for Undo
  const historyRef = useRef<Stand[][]>([]);

  const pushToHistory = useCallback((stands: Stand[]) => {
    historyRef.current = [...historyRef.current.slice(-19), JSON.parse(JSON.stringify(stands))];
  }, []);

  const undo = useCallback(() => {
    if (historyRef.current.length > 1) {
      const previous = historyRef.current[historyRef.current.length - 2];
      historyRef.current = historyRef.current.slice(0, -1);
      setState(prev => ({ ...prev, stands: previous }));
      return true;
    }
    return false;
  }, []);

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
    setState(prev => {
      const newErrors = { ...prev.errors };
      // Clear errors for fields being updated
      Object.keys(details).forEach(key => {
        delete newErrors[key];
      });

      return {
        ...prev,
        details: { ...prev.details, ...details },
        errors: newErrors
      };
    });
  }, []);

  const recalculateCapacities = useCallback((stands: Stand[]): Stand[] => {
    return stands.map(stand => {
      const floors = (stand.floors || []).map(floor => {
        const floorCapacity = (floor.sectors || []).reduce((sum, sector) => sum + (sector.totalSeats || 0), 0);
        return { ...floor, totalCapacity: floorCapacity };
      });

      const standCapacity = floors.reduce((sum, floor) => sum + (floor.totalCapacity || 0), 0);
      return { ...stand, floors, totalCapacity: standCapacity };
    });
  }, []);

  // Stand management
  const addStand = useCallback((position: 'north' | 'south' | 'east' | 'west') => {
    setState(prev => {
      pushToHistory(prev.stands);
      const existingStand = prev.stands.find(s => s.position === position);
      if (existingStand) {
        return { ...prev, errors: { ...prev.errors, stands: `Bancada ${position} já existe` } };
      }

      const positionNames = { north: 'Norte', south: 'Sul', east: 'Este', west: 'Oeste' };
      const colors = { north: '#3498db', south: '#2ecc71', east: '#f1c40f', west: '#e74c3c' };

      const defaultFloor: Floor = {
        id: uuidv4(),
        name: 'Piso 1',
        floorNumber: 1,
        totalSectors: 2,
        totalCapacity: 0,
        sectors: []
      };

      const newStand: Stand = {
        id: uuidv4(),
        name: `Bancada ${positionNames[position]}`,
        position,
        color: colors[position],
        totalFloors: 1,
        totalCapacity: 0,
        floors: [defaultFloor]
      };

      return {
        ...prev,
        stands: [...prev.stands, newStand],
        selectedStandId: newStand.id!,
        errors: { ...prev.errors, stands: '' }
      };
    });
  }, [pushToHistory]);

  const removeStand = useCallback((standId: string) => {
    setState(prev => {
      pushToHistory(prev.stands);
      return {
        ...prev,
        stands: prev.stands.filter(s => s.id !== standId),
        selectedStandId: prev.selectedStandId === standId ? null : prev.selectedStandId
      };
    });
  }, [pushToHistory]);

  const selectStand = useCallback((standId: string | null) => {
    setState(prev => ({ ...prev, selectedStandId: standId }));
  }, []);

  const updateStand = useCallback((standId: string, updates: Partial<Stand>) => {
    setState(prev => ({
      ...prev,
      stands: prev.stands.map(s => s.id === standId ? { ...s, ...updates } : s)
    }));
  }, []);

  const updateStandName = useCallback((standId: string, newName: string) => {
    setState(prev => ({
      ...prev,
      stands: prev.stands.map(s => s.id === standId ? { ...s, name: newName } : s)
    }));
  }, []);

  const updateStandColor = useCallback((standId: string, color: string) => {
    setState(prev => ({
      ...prev,
      stands: prev.stands.map(s => s.id === standId ? { ...s, color } : s)
    }));
  }, []);

  const addFloor = useCallback((standId: string) => {
    setState(prev => {
      pushToHistory(prev.stands);
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
          s.id === standId ? { ...s, floors: [...(s.floors || []), newFloor], totalFloors: (s.totalFloors || 0) + 1 } : s
        )
      };
    });
  }, [pushToHistory]);

  const duplicateFloor = useCallback((standId: string, floorId: string) => {
    setState(prev => {
      pushToHistory(prev.stands);
      const stand = prev.stands.find(s => s.id === standId);
      if (!stand) return prev;

      const floorToCopy = stand.floors?.find(f => f.id === floorId);
      if (!floorToCopy) return prev;

      const newFloor: Floor = JSON.parse(JSON.stringify(floorToCopy));
      newFloor.id = uuidv4();
      newFloor.name = `${floorToCopy.name} (Cópia)`;
      newFloor.floorNumber = (stand.floors?.length || 0) + 1;
      newFloor.sectors = (newFloor.sectors || []).map(sec => ({
        ...sec,
        id: uuidv4(),
        rows: (sec.rows || []).map(row => ({ ...row, id: uuidv4() }))
      }));

      const updatedStands = prev.stands.map(s =>
        s.id === standId ? { ...s, floors: [...(s.floors || []), newFloor], totalFloors: (s.totalFloors || 0) + 1 } : s
      );

      return { ...prev, stands: recalculateCapacities(updatedStands) };
    });
  }, [pushToHistory, recalculateCapacities]);

  const removeFloor = useCallback((standId: string, floorId: string) => {
    setState(prev => {
      pushToHistory(prev.stands);
      const updatedStands = prev.stands.map(s =>
        s.id === standId ? { ...s, floors: (s.floors || []).filter(f => f.id !== floorId), totalFloors: Math.max(0, (s.totalFloors || 1) - 1) } : s
      );
      return { ...prev, stands: recalculateCapacities(updatedStands) };
    });
  }, [pushToHistory, recalculateCapacities]);

  // Sector management
  const addSector = useCallback((standId: string, floorId: string) => {
    setState(prev => {
      pushToHistory(prev.stands);
      const stand = prev.stands.find(s => s.id === standId);
      if (!stand) return prev;

      const floor = stand.floors?.find(f => f.id === floorId);
      if (!floor) return prev;

      const sectorNumber = (floor.sectors?.length || 0) + 1;
      const newSector: Sector = {
        id: uuidv4(),
        name: `Setor ${String.fromCharCode(64 + sectorNumber)}`,
        sectorNumber,
        totalSeats: 100, // Smart default
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
                f.id === floorId ? { ...f, sectors: [...(f.sectors || []), newSector], totalSectors: (f.totalSectors || 0) + 1 } : f
              )
            }
            : s
        )
      };
    });
  }, [pushToHistory]);

  const removeSector = useCallback((standId: string, floorId: string, sectorId: string) => {
    setState(prev => {
      pushToHistory(prev.stands);
      const updatedStands = prev.stands.map(s =>
        s.id === standId
          ? {
            ...s,
            floors: (s.floors || []).map(f =>
              f.id === floorId ? { ...f, sectors: (f.sectors || []).filter(sec => sec.id !== sectorId), totalSectors: Math.max(0, (f.totalSectors || 1) - 1) } : f
            )
          }
          : s
      );
      return { ...prev, stands: recalculateCapacities(updatedStands) };
    });
  }, [pushToHistory, recalculateCapacities]);

  const updateSector = useCallback((standId: string, floorId: string, sectorId: string, updates: Partial<Sector>) => {
    setState(prev => {
      const updatedStands = prev.stands.map(s =>
        s.id === standId
          ? {
            ...s,
            floors: (s.floors || []).map(f =>
              f.id === floorId ? { ...f, sectors: (f.sectors || []).map(sec => sec.id === sectorId ? { ...sec, ...updates } : sec) } : f
            )
          }
          : s
      );
      return { ...prev, stands: recalculateCapacities(updatedStands) };
    });
  }, [recalculateCapacities]);

  // Row management
  const addRow = useCallback((standId: string, floorId: string, sectorId: string, seatsCount: number) => {
    setState(prev => {
      const stand = prev.stands.find(s => s.id === standId);
      if (!stand) return prev;
      const floor = stand.floors?.find(f => f.id === floorId);
      const sector = floor?.sectors?.find(sec => sec.id === sectorId);
      if (!sector) return prev;

      pushToHistory(prev.stands);
      const rowNumber = (sector.rows?.length || 0) + 1;
      const newRow: Row = {
        id: uuidv4(),
        name: `Fila ${String.fromCharCode(64 + rowNumber)}`,
        rowNumber,
        seatsCount: seatsCount || 20 // Default if not provided
      };

      if ((sector.configuredSeats || 0) + newRow.seatsCount > (sector.totalSeats || 0)) {
        return {
          ...prev,
          errors: { ...prev.errors, [`sector-${sectorId}`]: 'Excede capacidade do setor' }
        };
      }

      const updatedStands = prev.stands.map(s =>
        s.id === standId ? {
          ...s,
          floors: (s.floors || []).map(f => f.id === floorId ? {
            ...f,
            sectors: (f.sectors || []).map(sec => sec.id === sectorId ? {
              ...sec,
              rows: [...(sec.rows || []), newRow],
              configuredSeats: (sec.configuredSeats || 0) + newRow.seatsCount
            } : sec)
          } : f)
        } : s
      );

      return { ...prev, stands: updatedStands, errors: { ...prev.errors, [`sector-${sectorId}`]: '' } };
    });
  }, [pushToHistory]);

  const removeRow = useCallback((standId: string, floorId: string, sectorId: string, rowId: string) => {
    setState(prev => {
      pushToHistory(prev.stands);
      const updatedStands = prev.stands.map(s =>
        s.id === standId ? {
          ...s,
          floors: (s.floors || []).map(f => f.id === floorId ? {
            ...f,
            sectors: (f.sectors || []).map(sec => {
              if (sec.id !== sectorId) return sec;
              const rowToRemove = (sec.rows || []).find(r => r.id === rowId);
              return {
                ...sec,
                rows: (sec.rows || []).filter(r => r.id !== rowId),
                configuredSeats: Math.max(0, (sec.configuredSeats || 0) - (rowToRemove?.seatsCount || 0))
              };
            })
          } : f)
        } : s
      );
      return { ...prev, stands: updatedStands };
    });
  }, [pushToHistory]);

  const updateRow = useCallback((standId: string, floorId: string, sectorId: string, rowId: string, updates: Partial<Row>) => {
    setState(prev => {
      const updatedStands = prev.stands.map(s =>
        s.id === standId ? {
          ...s,
          floors: (s.floors || []).map(f => f.id === floorId ? {
            ...f,
            sectors: (f.sectors || []).map(sec => {
              if (sec.id !== sectorId) return sec;
              return {
                ...sec,
                rows: (sec.rows || []).map(r => r.id === rowId ? { ...r, ...updates } : r),
                configuredSeats: (sec.rows || []).reduce((sum, r) => sum + (r.id === rowId ? (updates.seatsCount ?? r.seatsCount) : r.seatsCount), 0)
              };
            })
          } : f)
        } : s
      );
      return { ...prev, stands: recalculateCapacities(updatedStands) };
    });
  }, [recalculateCapacities]);

  const validateTab1 = useCallback((): boolean => {
    const errors: { [key: string]: string } = {};
    if (!state.details.name.trim()) errors.name = 'Nome obrigatório';
    if (!state.details.city.trim()) errors.city = 'Cidade obrigatória';
    if (!state.details.sportId) errors.sportId = 'Escolha um desporto';
    setState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  }, [state.details]);

  const validateTab2 = useCallback((): boolean => {
    const errors: { [key: string]: string } = {};
    if (state.stands.length === 0) errors.stands = 'Mínimo uma bancada';
    state.stands.forEach(stand => {
      stand.floors?.forEach(floor => {
        floor.sectors?.forEach(sector => {
          if (!sector.rows?.length) errors[`sector-${sector.id}`] = 'Configure as filas';
          else if (sector.configuredSeats !== sector.totalSeats) errors[`sector-${sector.id}`] = 'Capacidade e filas divergem';
        });
      });
    });
    setState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  }, [state.stands]);

  const calculateTotalCapacity = useCallback(() => {
    return state.stands.reduce((sum, stand) => sum + (stand.totalCapacity || 0), 0);
  }, [state.stands]);

  return {
    state,
    goToTab, nextTab, previousTab,
    updateDetails,
    addStand, removeStand, selectStand, updateStand, updateStandName, updateStandColor,
    addFloor, removeFloor, duplicateFloor,
    addSector, removeSector, updateSector,
    addRow, removeRow, updateRow,
    validateTab1, validateTab2,
    calculateTotalCapacity,
    undo,
    clearDraft,
    isTab1Valid: !Object.keys(state.errors).length,
    reset: () => {
      setState(initialState);
      clearDraft();
    }
  };
};
