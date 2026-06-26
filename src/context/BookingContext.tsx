import { createContext, useContext, useState } from 'react';

interface BookingContextValue {
  bookSlot: (trainerId: string, date: Date, slotId: string) => void;
  isBooked: (trainerId: string, date: Date, slotId: string) => boolean;
}

const BookingContext = createContext<BookingContextValue>({
  bookSlot: () => {},
  isBooked: () => false,
});

function makeKey(trainerId: string, date: Date, slotId: string): string {
  return `${trainerId}_${date.toISOString().slice(0, 10)}_${slotId}`;
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookedKeys, setBookedKeys] = useState<ReadonlySet<string>>(new Set());

  function bookSlot(trainerId: string, date: Date, slotId: string) {
    const key = makeKey(trainerId, date, slotId);
    setBookedKeys(prev => new Set([...prev, key]));
  }

  function isBooked(trainerId: string, date: Date, slotId: string): boolean {
    return bookedKeys.has(makeKey(trainerId, date, slotId));
  }

  return (
    <BookingContext.Provider value={{ bookSlot, isBooked }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}
