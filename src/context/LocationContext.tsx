import React, { createContext, useContext, useState } from 'react';

export const CITIES = [
  'Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys',
  'Alytus', 'Marijampolė', 'Mažeikiai', 'Jonava', 'Utena',
];

interface LocationContextValue {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [selectedCity, setSelectedCity] = useState('Vilnius');
  return (
    <LocationContext.Provider value={{ selectedCity, setSelectedCity }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
