import { useEffect, useState } from 'react';

const _ids = new Set<string>();
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach(l => l());
}

export function toggleFavorite(id: string): void {
  _ids.has(id) ? _ids.delete(id) : _ids.add(id);
  notify();
}

export function isFavorite(id: string): boolean {
  return _ids.has(id);
}

export function useFavoriteIds(): Set<string> {
  const [snapshot, setSnapshot] = useState(() => new Set(_ids));
  useEffect(() => {
    const listener = () => setSnapshot(new Set(_ids));
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);
  return snapshot;
}
