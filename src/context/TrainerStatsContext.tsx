import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useTrainerProfile } from '@/context/TrainerProfileContext';

export interface TrainerStats {
  totalClients:   number;
  totalEarned:    number;
  available:      number;
  withdrawn:      number;
  thisMonth:      number;
  rating:         number;
  todaysSessions: number;
}

const RATING = 4.8;

function parsePrice(price: string): number {
  return parseInt(price.replace(/[^0-9]/g, ''), 10) || 0;
}

const TrainerStatsContext = createContext<TrainerStats>({
  totalClients:   0,
  totalEarned:    0,
  available:      0,
  withdrawn:      0,
  thisMonth:      0,
  rating:         RATING,
  todaysSessions: 0,
});

export function TrainerStatsProvider({ children }: { children: ReactNode }) {
  const { sessions } = useTrainerProfile();

  const stats = useMemo<TrainerStats>(() => {
    const todayStr  = new Date().toISOString().slice(0, 10);
    const yearMonth = todayStr.slice(0, 7);

    const completed = sessions.filter(s => s.status === 'completed');

    const totalClients = new Set(completed.map(s => s.client)).size;

    const totalEarned = completed.reduce((sum, s) => sum + parsePrice(s.price), 0);

    const thisMonth = completed
      .filter(s => s.sortDate.startsWith(yearMonth))
      .reduce((sum, s) => sum + parsePrice(s.price), 0);

    const withdrawn = Math.floor(totalEarned * 0.68);
    const available = totalEarned - withdrawn;

    const todaysSessions = sessions.filter(
      s => s.sortDate === todayStr && s.status === 'confirmed',
    ).length;

    return { totalClients, totalEarned, available, withdrawn, thisMonth, rating: RATING, todaysSessions };
  }, [sessions]);

  return (
    <TrainerStatsContext.Provider value={stats}>
      {children}
    </TrainerStatsContext.Provider>
  );
}

export function useTrainerStats(): TrainerStats {
  return useContext(TrainerStatsContext);
}
