import { useState, useEffect, useCallback } from 'react';
import { AuthService, type AuthUser, type AuthSession, type SignInData, type SignUpData } from '../../lib/auth';
import type { SupabaseClient } from '../../db/supabase.client';

interface UseAuthOptions {
  supabase: SupabaseClient;
  redirectTo?: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (data: SignInData) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: {
    firstName?: string;
    lastName?: string;
    companyName?: string;
    companyAddress?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function useAuth({ supabase, redirectTo }: UseAuthOptions): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authService = new AuthService(supabase);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const currentSession = await authService.getSession();
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user || null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen to auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user || null);
          setIsLoading(false);

          // Handle redirects
          if (event === 'SIGNED_IN' && redirectTo) {
            window.location.href = redirectTo;
          } else if (event === 'SIGNED_OUT') {
            window.location.href = '/login';
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [redirectTo]);

  const signIn = useCallback(
    async (data: SignInData) => {
      try {
        setIsLoading(true);
        const result = await authService.signIn(data);
        
        if (result.success && result.user && result.session) {
          setUser(result.user);
          setSession(result.session);
        }
        
        return {
          success: result.success,
          error: result.error,
        };
      } catch (error) {
        console.error('Error in signIn:', error);
        return {
          success: false,
          error: 'Nieoczekiwany błąd podczas logowania',
        };
      } finally {
        setIsLoading(false);
      }
    },
    [authService]
  );

  const signUp = useCallback(
    async (data: SignUpData) => {
      try {
        setIsLoading(true);
        const result = await authService.signUp(data);
        
        if (result.success && result.user && result.session) {
          setUser(result.user);
          setSession(result.session);
        }
        
        return {
          success: result.success,
          error: result.error,
        };
      } catch (error) {
        console.error('Error in signUp:', error);
        return {
          success: false,
          error: 'Nieoczekiwany błąd podczas rejestracji',
        };
      } finally {
        setIsLoading(false);
      }
    },
    [authService]
  );

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await authService.signOut();
      
      if (result.success) {
        setUser(null);
        setSession(null);
      }
      
      return result;
    } catch (error) {
      console.error('Error in signOut:', error);
      return {
        success: false,
        error: 'Nieoczekiwany błąd podczas wylogowywania',
      };
    } finally {
      setIsLoading(false);
    }
  }, [authService]);

  const updateProfile = useCallback(
    async (updates: {
      firstName?: string;
      lastName?: string;
      companyName?: string;
      companyAddress?: string;
    }) => {
      try {
        setIsLoading(true);
        const result = await authService.updateProfile(updates);
        
        if (result.success && result.user) {
          setUser(result.user);
        }
        
        return {
          success: result.success,
          error: result.error,
        };
      } catch (error) {
        console.error('Error in updateProfile:', error);
        return {
          success: false,
          error: 'Nieoczekiwany błąd podczas aktualizacji profilu',
        };
      } finally {
        setIsLoading(false);
      }
    },
    [authService]
  );

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
} 