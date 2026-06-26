import { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';

export interface TrainingLocation {
  id: string;
  city: string;
  address: string;
}

export interface AvailabilitySlot {
  id: string;
  start: string;
  end: string;
  location: string;
  notes: string;
  duration: number; // session duration in minutes: 30 | 45 | 60 | 90 | 120
}

export interface DayConfig {
  enabled: boolean;
  slots: AvailabilitySlot[];
}

export type Schedule = Record<string, DayConfig>;

const INITIAL_LOCATIONS: TrainingLocation[] = [
  { id: 'tl_0', city: 'Vilnius', address: 'Žalgirio g. 90' },
];

const DEFAULT_LOC = `${INITIAL_LOCATIONS[0].city} • ${INITIAL_LOCATIONS[0].address}`;

function makeInitialSchedule(defaultLoc: string): Schedule {
  const s = (id: string, start: string, end: string): AvailabilitySlot =>
    ({ id, start, end, location: defaultLoc, notes: '', duration: 60 });
  return {
    Mon: { enabled: true,  slots: [s('1', '09:00', '18:00')] },
    Tue: { enabled: true,  slots: [s('2', '09:00', '18:00')] },
    Wed: { enabled: true,  slots: [s('3', '09:00', '18:00')] },
    Thu: { enabled: true,  slots: [s('4', '09:00', '18:00')] },
    Fri: { enabled: true,  slots: [s('5', '09:00', '17:00')] },
    Sat: { enabled: false, slots: [s('6', '10:00', '14:00')] },
    Sun: { enabled: false, slots: []                          },
  };
}

const INITIAL_PRICES: Record<number, string> = {
  30: '20',
  45: '28',
  60: '35',
  90: '50',
  120: '70',
};

interface TrainerProfileContextValue {
  locations: TrainingLocation[];
  addLocation: (city: string, address: string) => void;
  removeLocation: (id: string) => void;
  schedule: Schedule;
  setSchedule: Dispatch<SetStateAction<Schedule>>;
  prices: Record<number, string>;
  setPrices: Dispatch<SetStateAction<Record<number, string>>>;
  sessionDuration: number;
  setSessionDuration: Dispatch<SetStateAction<number>>;
}

const TrainerProfileContext = createContext<TrainerProfileContextValue>({
  locations: [],
  addLocation: () => {},
  removeLocation: () => {},
  schedule: makeInitialSchedule(DEFAULT_LOC),
  setSchedule: () => {},
  prices: INITIAL_PRICES,
  setPrices: () => {},
  sessionDuration: 60,
  setSessionDuration: () => {},
});

let locIdCounter = 1;
function nextLocId() { return `tl_${locIdCounter++}`; }

export function TrainerProfileProvider({ children }: { children: React.ReactNode }) {
  const [locations, setLocations] = useState<TrainingLocation[]>(INITIAL_LOCATIONS);
  const [schedule, setSchedule] = useState<Schedule>(() => makeInitialSchedule(DEFAULT_LOC));
  const [prices, setPrices] = useState<Record<number, string>>(INITIAL_PRICES);
  const [sessionDuration, setSessionDuration] = useState(60);

  function addLocation(city: string, address: string) {
    setLocations(prev => [...prev, { id: nextLocId(), city: city.trim(), address: address.trim() }]);
  }

  function removeLocation(id: string) {
    setLocations(prev => prev.filter(l => l.id !== id));
  }

  return (
    <TrainerProfileContext.Provider value={{ locations, addLocation, removeLocation, schedule, setSchedule, prices, setPrices, sessionDuration, setSessionDuration }}>
      {children}
    </TrainerProfileContext.Provider>
  );
}

export function useTrainerProfile() {
  return useContext(TrainerProfileContext);
}
