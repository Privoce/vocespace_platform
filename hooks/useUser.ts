import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export interface UseUserResult {
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for handling Supabase user authentication
 * 
 * Usage:
 * const { user, loading, error } = useUser();
 * 
 * Features:
 * - Automatically fetches current user on mount
 * - Listens for auth state changes (login/logout)
 * - Handles loading and error states
 * - Returns null for user when not authenticated
 */
export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const client = createClient();

    // Get initial user
    const getInitialUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: userError } = await client.auth.getUser();
        
        if (userError) {
          if (userError.message !== 'Invalid JWT') {
            setError(userError.message);
          }
          setUser(null);
        } else {
          setUser(data.user);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialUser();

    // Listen for auth changes
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        setLoading(false);
        setError(null);
        
        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
            setUser(session?.user ?? null);
            break;
          case 'SIGNED_OUT':
            setUser(null);
            break;
          default:
            // For other events, check current session
            if (session) {
              setUser(session.user);
            } else {
              setUser(null);
            }
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return { user, loading, error };
}

/**
 * Custom hook for user authentication actions
 * 
 * Usage:
 * const { signOut, signIn, signUp } = useAuth();
 */
export function useAuth() {
  const client = createClient();

  const signOut = async () => {
    const { error } = await client.auth.signOut();
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await client.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  return { signOut, signIn, signUp };
}