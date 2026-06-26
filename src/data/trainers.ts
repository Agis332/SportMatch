export interface Trainer {
  id: string;
  name: string;
  sport: string;
  rating: number;
  price: number;
  prices?: number[];
  city: string;
  initials: string;
  verified: boolean;
}

export const TRAINERS: Trainer[] = [
  { id: '1', name: 'Mantas Petrauskas',   sport: 'Football',    rating: 4.8, price: 25, prices: [25, 35, 55], city: 'Vilnius',   initials: 'MP', verified: true  },
  { id: '2', name: 'Rūta Kazlauskaitė',   sport: 'Yoga',        rating: 4.9, price: 30, prices: [30, 45, 65], city: 'Vilnius',   initials: 'RK', verified: true  },
  { id: '3', name: 'Tomas Žukauskas',     sport: 'Basketball',  rating: 4.7, price: 30,                       city: 'Kaunas',    initials: 'TŽ', verified: false },
  { id: '4', name: 'Aistė Mikalauskaitė', sport: 'Tennis',      rating: 4.6, price: 35, prices: [35, 50, 80], city: 'Vilnius',   initials: 'AM', verified: false },
  { id: '5', name: 'Darius Paulauskas',   sport: 'Boxing',      rating: 4.9, price: 28, prices: [28, 40, 60], city: 'Klaipėda', initials: 'DP', verified: true  },
  { id: '6', name: 'Laura Stankevičiūtė', sport: 'CrossFit',   rating: 4.5, price: 35,                       city: 'Vilnius',   initials: 'LS', verified: false },
  { id: '7', name: 'Erikas Butkus',       sport: 'Running',     rating: 4.7, price: 28, prices: [20, 28],     city: 'Kaunas',    initials: 'EB', verified: false },
  { id: '8', name: 'Ingrida Vaitkutė',   sport: 'Swimming',    rating: 4.8, price: 55,                       city: 'Vilnius',   initials: 'IV', verified: true  },
  { id: '9', name: 'Aurimas Grigas',      sport: 'Martial Arts', rating: 4.6, price: 38, prices: [25, 38, 60], city: 'Vilnius', initials: 'AG', verified: false },
];

export const SPORT_EMOJI: Record<string, string> = {
  Football: '⚽',
  Basketball: '🏀',
  Tennis: '🎾',
  Swimming: '🏊',
  Boxing: '🥊',
  Yoga: '🧘',
  CrossFit: '💪',
  Running: '🏃',
  'Martial Arts': '🥋',
  Cycling: '🚴',
};

export const AVATAR_COLORS = [
  '#B5C9E4', '#C8DDB5', '#E4CDB5', '#D4B5E4', '#B5E4D4',
  '#E4B5C8', '#C8B5E4', '#E4E4B5',
];

export function avatarColor(id: string) {
  return AVATAR_COLORS[parseInt(id, 10) % AVATAR_COLORS.length];
}
