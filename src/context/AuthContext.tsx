import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextValue {
  currentUser: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  loading: true,
  signOut: async () => {},
});

async function ensureProfile(user: User) {
  const { error } = await supabase.from('profiles').upsert(
    { id: user.id, email: user.email },
    { onConflict: 'id', ignoreDuplicates: true }
  );
  if (error) console.error('[auth] profile upsert failed:', error.message);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[auth] loading: true — fetching session');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error('[auth] getSession error:', error.message);
      const user = session?.user ?? null;
      console.log('[auth] session resolved:', user ? `user ${user.id}` : 'no session');
      setCurrentUser(user);
      setLoading(false);
      console.log('[auth] loading: false');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        console.log(`[auth] onAuthStateChange: ${event}`, user ? `user ${user.id}` : 'no user');
        setCurrentUser(user);

        if (event === 'SIGNED_IN' && user) {
          await ensureProfile(user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
