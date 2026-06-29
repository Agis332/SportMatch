import { createContext, useContext, type ReactNode } from 'react';

export interface TrainerStats {
  totalClients: number;
  totalEarned:  number;
  available:    number;
  withdrawn:    number;
  thisMonth:    number;
  rating:       number;
  todaysSessions: number;
}

const STATS: TrainerStats = {
  totalClients:   8,
  totalEarned:    1240,
  available:      280,
  withdrawn:      920,
  thisMonth:      320,
  rating:         4.8,
  todaysSessions: 2,
};

const TrainerStatsContext = createContext<TrainerStats>(STATS);

export function TrainerStatsProvider({ children }: { children: ReactNode }) {
  return (
    <TrainerStatsContext.Provider value={STATS}>
      {children}
    </TrainerStatsContext.Provider>
  );
}

export function useTrainerStats(): TrainerStats {
  return useContext(TrainerStatsContext);
}
