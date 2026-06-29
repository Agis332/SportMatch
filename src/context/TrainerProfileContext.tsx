import { createContext, Dispatch, SetStateAction, useCallback, useContext, useState } from 'react';

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

// ─── Session types & mock data ────────────────────────────────────────────────

export interface Session {
  id: string;
  client: string;
  initials: string;
  color: string;
  sport: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  type: 'Individual' | 'Group';
  price: string;
  sortDate: string;
}

export const STATUS_META: Record<Session['status'], { label: string; color: string; bg: string }> = {
  confirmed: { label: 'Confirmed', color: '#16A34A', bg: '#DCFCE7' },
  pending:   { label: 'Pending',   color: '#D97706', bg: '#FEF9C3' },
  completed: { label: 'Completed', color: '#2563EB', bg: '#DBEAFE' },
  cancelled: { label: 'Cancelled', color: '#DC2626', bg: '#FEE2E2' },
};

export const INITIAL_SESSIONS: Session[] = [
  { id: '1',  client: 'Jonas Kazlauskas',   initials: 'JK', color: '#B5C9E4', sport: '⚽ Football',  date: 'Today, Jun 27',    time: '10:00', duration: '60 min', location: 'Vingis Park, Vilnius',          status: 'confirmed', type: 'Individual', price: '€45', sortDate: '2026-06-27' },
  { id: '2',  client: 'Marta Petraitytė',   initials: 'MP', color: '#C8DDB5', sport: '🏃 Running',   date: 'Today, Jun 27',    time: '14:00', duration: '45 min', location: 'Sereikiškių Park, Vilnius',    status: 'confirmed', type: 'Individual', price: '€35', sortDate: '2026-06-27' },
  { id: '3',  client: 'Tomas Butkus',        initials: 'TB', color: '#D4B5E4', sport: '⚽ Football',  date: 'Tomorrow, Jun 28', time: '09:00', duration: '60 min', location: 'Vingis Park, Vilnius',          status: 'pending',   type: 'Individual', price: '€45', sortDate: '2026-06-28' },
  { id: '4',  client: 'Rasa Mockutė',        initials: 'RM', color: '#B5E4D4', sport: '🏃 Running',   date: 'Jun 29',           time: '11:00', duration: '45 min', location: 'Sereikiškių Park, Vilnius',    status: 'confirmed', type: 'Individual', price: '€35', sortDate: '2026-06-29' },
  { id: '5',  client: 'Viktorija Paulė',     initials: 'VP', color: '#C8B5E4', sport: '💪 CrossFit',  date: 'Jun 30',           time: '08:30', duration: '60 min', location: 'FitSpace Gym, Vilnius',        status: 'confirmed', type: 'Group',      price: '€30', sortDate: '2026-06-30' },
  { id: '6',  client: 'Kristina Vaitkutė',   initials: 'KV', color: '#B5D4E4', sport: '⚽ Football',  date: 'Jul 3',            time: '10:00', duration: '60 min', location: 'Vingis Park, Vilnius',          status: 'pending',   type: 'Individual', price: '€45', sortDate: '2026-07-03' },
  { id: '7',  client: 'Eglė Jankutė',        initials: 'EJ', color: '#E4CDB5', sport: '💪 CrossFit',  date: 'Jun 24',           time: '08:00', duration: '60 min', location: 'FitSpace Gym, Vilnius',        status: 'completed', type: 'Group',      price: '€30', sortDate: '2026-06-24' },
  { id: '8',  client: 'Andrius Stankus',      initials: 'AS', color: '#E4B5C8', sport: '⚽ Football',  date: 'Jun 22',           time: '16:00', duration: '60 min', location: 'Vingis Park, Vilnius',          status: 'completed', type: 'Group',      price: '€30', sortDate: '2026-06-22' },
  { id: '9',  client: 'Laurynas Grigas',      initials: 'LG', color: '#E4E4B5', sport: '🏃 Running',   date: 'Jun 20',           time: '07:30', duration: '45 min', location: 'Sereikiškių Park, Vilnius',    status: 'completed', type: 'Individual', price: '€35', sortDate: '2026-06-20' },
  { id: '10', client: 'Darius Paulauskas',    initials: 'DP', color: '#E4B5B5', sport: '💪 CrossFit',  date: 'Jun 18',           time: '10:00', duration: '60 min', location: 'FitSpace Gym, Vilnius',        status: 'cancelled', type: 'Group',      price: '€30', sortDate: '2026-06-18' },
];

// ─── Location data ────────────────────────────────────────────────────────────

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
  autoConfirm: boolean;
  setAutoConfirm: Dispatch<SetStateAction<boolean>>;
  sessions: Session[];
  setSessions: Dispatch<SetStateAction<Session[]>>;
  confirmAllPending: () => void;
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
  autoConfirm: false,
  setAutoConfirm: () => {},
  sessions: INITIAL_SESSIONS,
  setSessions: () => {},
  confirmAllPending: () => {},
});

let locIdCounter = 1;
function nextLocId() { return `tl_${locIdCounter++}`; }

export function TrainerProfileProvider({ children }: { children: React.ReactNode }) {
  const [locations,      setLocations]      = useState<TrainingLocation[]>(INITIAL_LOCATIONS);
  const [schedule,       setSchedule]       = useState<Schedule>(() => makeInitialSchedule(DEFAULT_LOC));
  const [prices,         setPrices]         = useState<Record<number, string>>(INITIAL_PRICES);
  const [sessionDuration, setSessionDuration] = useState(60);
  const [autoConfirm,    setAutoConfirm]    = useState(false);
  const [sessions,       setSessions]       = useState<Session[]>(INITIAL_SESSIONS);

  function addLocation(city: string, address: string) {
    setLocations(prev => [...prev, { id: nextLocId(), city: city.trim(), address: address.trim() }]);
  }

  function removeLocation(id: string) {
    setLocations(prev => prev.filter(l => l.id !== id));
  }

  const confirmAllPending = useCallback(() => {
    setSessions(prev => prev.map(s => s.status === 'pending' ? { ...s, status: 'confirmed' } : s));
  }, []);

  return (
    <TrainerProfileContext.Provider value={{ locations, addLocation, removeLocation, schedule, setSchedule, prices, setPrices, sessionDuration, setSessionDuration, autoConfirm, setAutoConfirm, sessions, setSessions, confirmAllPending }}>
      {children}
    </TrainerProfileContext.Provider>
  );
}

export function useTrainerProfile() {
  return useContext(TrainerProfileContext);
}

// ─── Mock trainer profiles (used by booking screen) ───────────────────────────

export interface TrainerMockProfile {
  id: string;
  locations: TrainingLocation[];
  schedule: Schedule;
  sessionDuration: number;
}

// Helpers to keep mock data concise
function loc(id: string, city: string, address: string): TrainingLocation {
  return { id, city, address };
}
function slot(id: string, start: string, end: string, city: string, address: string, dur: number): AvailabilitySlot {
  return { id, start, end, location: `${city} • ${address}`, notes: '', duration: dur };
}
function day(...slots: AvailabilitySlot[]): DayConfig {
  return { enabled: true, slots };
}
const off: DayConfig = { enabled: false, slots: [] };

export const TRAINERS_MOCK: TrainerMockProfile[] = [
  // ── 1 · Mantas Petrauskas · Football · Vilnius · 1h · Mon/Wed/Fri ──────────
  // Vingis Park on Mon+Fri, Žalgiris Stadium on Wed — picking location affects visible days
  {
    id: '1',
    sessionDuration: 60,
    locations: [
      loc('1_l0', 'Vilnius', 'Vingis Park'),
      loc('1_l1', 'Vilnius', 'Žalgiris Stadium'),
    ],
    schedule: {
      Mon: day(slot('1_m', '09:00', '18:00', 'Vilnius', 'Vingis Park',      60)),
      Tue: off,
      Wed: day(slot('1_w', '09:00', '18:00', 'Vilnius', 'Žalgiris Stadium', 60)),
      Thu: off,
      Fri: day(slot('1_f', '09:00', '18:00', 'Vilnius', 'Vingis Park',      60)),
      Sat: off,
      Sun: off,
    },
  },

  // ── 2 · Rūta Kazlauskaitė · Yoga · Vilnius · 1h · Tue/Thu/Sat ─────────────
  {
    id: '2',
    sessionDuration: 60,
    locations: [
      loc('2_l0', 'Vilnius', 'Yoga Studio Gedimino'),
      loc('2_l1', 'Vilnius', 'Home visits'),
    ],
    schedule: {
      Mon: off,
      Tue: day(slot('2_t', '08:00', '14:00', 'Vilnius', 'Yoga Studio Gedimino', 60)),
      Wed: off,
      Thu: day(slot('2_r', '08:00', '14:00', 'Vilnius', 'Home visits',          60)),
      Fri: off,
      Sat: day(slot('2_s', '08:00', '14:00', 'Vilnius', 'Yoga Studio Gedimino', 60)),
      Sun: off,
    },
  },

  // ── 3 · Lukas Jankauskas · Boxing · Kaunas · 1.5h · Mon–Fri ────────────────
  // Alternates Boxing Club (Mon/Wed/Fri) and Žalgiris Arena (Tue/Thu)
  {
    id: '3',
    sessionDuration: 90,
    locations: [
      loc('3_l0', 'Kaunas', 'Boxing Club'),
      loc('3_l1', 'Kaunas', 'Žalgiris Arena'),
    ],
    schedule: {
      Mon: day(slot('3_m', '14:00', '20:00', 'Kaunas', 'Boxing Club',    90)),
      Tue: day(slot('3_t', '14:00', '20:00', 'Kaunas', 'Žalgiris Arena', 90)),
      Wed: day(slot('3_w', '14:00', '20:00', 'Kaunas', 'Boxing Club',    90)),
      Thu: day(slot('3_r', '14:00', '20:00', 'Kaunas', 'Žalgiris Arena', 90)),
      Fri: day(slot('3_f', '14:00', '20:00', 'Kaunas', 'Boxing Club',    90)),
      Sat: off,
      Sun: off,
    },
  },

  // ── 4 · Aistė Rimkutė · Running · Vilnius · 30min · daily ──────────────────
  // Vingis Park on weekdays, Sereikiškių Park on weekends
  {
    id: '4',
    sessionDuration: 30,
    locations: [
      loc('4_l0', 'Vilnius', 'Vingis Park'),
      loc('4_l1', 'Vilnius', 'Sereikiškių Park'),
    ],
    schedule: {
      Mon: day(slot('4_m', '06:00', '10:00', 'Vilnius', 'Vingis Park',      30)),
      Tue: day(slot('4_t', '06:00', '10:00', 'Vilnius', 'Vingis Park',      30)),
      Wed: day(slot('4_w', '06:00', '10:00', 'Vilnius', 'Vingis Park',      30)),
      Thu: day(slot('4_r', '06:00', '10:00', 'Vilnius', 'Vingis Park',      30)),
      Fri: day(slot('4_f', '06:00', '10:00', 'Vilnius', 'Vingis Park',      30)),
      Sat: day(slot('4_s', '06:00', '10:00', 'Vilnius', 'Sereikiškių Park', 30)),
      Sun: day(slot('4_u', '06:00', '10:00', 'Vilnius', 'Sereikiškių Park', 30)),
    },
  },

  // ── 5 · Jonas Kazlauskas · Tennis · Klaipėda · 1h · Wed/Fri/Sun ────────────
  {
    id: '5',
    sessionDuration: 60,
    locations: [
      loc('5_l0', 'Klaipėda', 'Tennis Club'),
      loc('5_l1', 'Klaipėda', 'City Beach'),
    ],
    schedule: {
      Mon: off,
      Tue: off,
      Wed: day(slot('5_w', '10:00', '16:00', 'Klaipėda', 'Tennis Club', 60)),
      Thu: off,
      Fri: day(slot('5_f', '10:00', '16:00', 'Klaipėda', 'Tennis Club', 60)),
      Sat: off,
      Sun: day(slot('5_u', '10:00', '16:00', 'Klaipėda', 'City Beach',  60)),
    },
  },
];

export function getTrainerMockProfile(id: string): TrainerMockProfile | null {
  return TRAINERS_MOCK.find(t => t.id === id) ?? null;
}
