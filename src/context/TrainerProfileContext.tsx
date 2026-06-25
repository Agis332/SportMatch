import { createContext, useContext, useState } from 'react';

export interface TrainingLocation {
  id: string;
  city: string;
  address: string;
}

interface TrainerProfileContextValue {
  locations: TrainingLocation[];
  addLocation: (city: string, address: string) => void;
  removeLocation: (id: string) => void;
}

const TrainerProfileContext = createContext<TrainerProfileContextValue>({
  locations: [],
  addLocation: () => {},
  removeLocation: () => {},
});

let locIdCounter = 1;
function nextLocId() { return `tl_${locIdCounter++}`; }

const INITIAL_LOCATIONS: TrainingLocation[] = [
  { id: 'tl_0', city: 'Vilnius', address: 'Žalgirio g. 90' },
];

export function TrainerProfileProvider({ children }: { children: React.ReactNode }) {
  const [locations, setLocations] = useState<TrainingLocation[]>(INITIAL_LOCATIONS);

  function addLocation(city: string, address: string) {
    setLocations(prev => [...prev, { id: nextLocId(), city: city.trim(), address: address.trim() }]);
  }

  function removeLocation(id: string) {
    setLocations(prev => prev.filter(l => l.id !== id));
  }

  return (
    <TrainerProfileContext.Provider value={{ locations, addLocation, removeLocation }}>
      {children}
    </TrainerProfileContext.Provider>
  );
}

export function useTrainerProfile() {
  return useContext(TrainerProfileContext);
}
