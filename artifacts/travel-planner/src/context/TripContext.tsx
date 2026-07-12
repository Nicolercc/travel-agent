import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Trip, TripDay, SavedPlace, DaySection } from '../types';
import { mockTrip, mockDays, mockPlaces } from '../data/mockData';
import { clearPackingStorage } from '../lib/packing-storage';

type ItemActionState = 'done' | 'skipped';

interface TripContextType {
  trip: Trip;
  days: TripDay[];
  places: SavedPlace[];
  itemStates: Record<string, ItemActionState>;
  movePlace: (placeId: string, dayId: string | null, section?: DaySection) => void;
  updatePlace: (placeId: string, updates: Partial<SavedPlace>) => void;
  addPlace: (place: SavedPlace) => void;
  toggleItemDone: (placeId: string) => void;
  toggleItemSkipped: (placeId: string) => void;
  resetDemoState: () => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);
const PLACES_STORAGE_KEY = 'tripcanvas:places:v1';
const ITEM_STATES_STORAGE_KEY = 'tripcanvas:item-states:v1';

function readStoredState<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function TripProvider({ children }: { children: ReactNode }) {
  const [trip] = useState<Trip>(mockTrip);
  const [days] = useState<TripDay[]>(mockDays);
  const [places, setPlaces] = useState<SavedPlace[]>(() =>
    readStoredState(PLACES_STORAGE_KEY, mockPlaces),
  );
  const [itemStates, setItemStates] = useState<Record<string, ItemActionState>>(() =>
    readStoredState(ITEM_STATES_STORAGE_KEY, {}),
  );

  useEffect(() => {
    window.localStorage.setItem(PLACES_STORAGE_KEY, JSON.stringify(places));
  }, [places]);

  useEffect(() => {
    window.localStorage.setItem(ITEM_STATES_STORAGE_KEY, JSON.stringify(itemStates));
  }, [itemStates]);

  const movePlace = (placeId: string, dayId: string | null, section?: DaySection) => {
    setPlaces(prev => prev.map(p => {
      if (p.id === placeId) {
        return {
          ...p,
          assigned_day_id: dayId,
          day_section: dayId === null ? undefined : section !== undefined ? section : p.day_section
        };
      }
      return p;
    }));
  };

  const updatePlace = (placeId: string, updates: Partial<SavedPlace>) => {
    setPlaces(prev => prev.map(p => p.id === placeId ? { ...p, ...updates } : p));
  };

  const addPlace = (place: SavedPlace) => {
    setPlaces(prev => [place, ...prev]);
  };

  const toggleItemDone = (placeId: string) => {
    setItemStates(prev => {
      if (prev[placeId] === 'done') {
        const { [placeId]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [placeId]: 'done' };
    });
  };

  const toggleItemSkipped = (placeId: string) => {
    setItemStates(prev => {
      if (prev[placeId] === 'skipped') {
        const { [placeId]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [placeId]: 'skipped' };
    });
  };

  const resetDemoState = () => {
    setPlaces(mockPlaces);
    setItemStates({});
    window.localStorage.removeItem(PLACES_STORAGE_KEY);
    window.localStorage.removeItem(ITEM_STATES_STORAGE_KEY);
    clearPackingStorage();
  };

  return (
    <TripContext.Provider
      value={{
        trip,
        days,
        places,
        itemStates,
        movePlace,
        updatePlace,
        addPlace,
        toggleItemDone,
        toggleItemSkipped,
        resetDemoState,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}
