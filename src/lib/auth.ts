import type { SupabaseClient } from '../db/supabase.client';
import type { User, Session } from '@supabase/supabase-js';
import { CompanySchema, UserSchema } from './schemas';
import type { Company } from '../types';

export interface AuthUser extends User {
  company?: Company;
  profile?: {
    first_name: string;
    last_name: string;
    company_id: string | null;
  };
}

export interface AuthSession extends Session {
  user: AuthUser;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  companyAddress?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  session?: AuthSession;
  error?: string;
}

/**
 * Authentication service using Supabase Auth with extended user profiles
 */
export class AuthService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Sign up a new user with company information
   */
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      // 1. Create company first
      const { data: companyData, error: companyError } = await this.supabase
        .from('companies')
        .insert({
          name: data.companyName,
          address: data.companyAddress || null,
        })
        .select()
        .single();

      if (companyError) {
        console.error('Error creating company:', companyError);
        return {
          success: false,
          error: 'Błąd podczas tworzenia firmy',
        };
      }

      // 2. Sign up user with Supabase Auth
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            company_id: companyData.id,
          },
        },
      });

      if (authError) {
        console.error('Error signing up:', authError);
        // Cleanup: remove company if user creation failed
        await this.supabase.from('companies').delete().eq('id', companyData.id);
        return {
          success: false,
          error: authError.message,
        };
      }

      // 3. Log auth event
      if (authData.user) {
        await this.logAuthEvent(authData.user.id, 'registration', {
          email: data.email,
          company_id: companyData.id,
          company_name: data.companyName,
        });
      }

      // 4. Get complete user profile
      const userProfile = await this.getUserProfile(authData.user?.id);

      return {
        success: true,
        user: userProfile,
        session: authData.session as AuthSession,
      };
    } catch (error) {
      console.error('Unexpected error during sign up:', error);
      return {
        success: false,
        error: 'Nieoczekiwany błąd podczas rejestracji',
      };
    }
  }

  /**
   * Sign in existing user
   */
  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        console.error('Error signing in:', authError);
        return {
          success: false,
          error: authError.message,
        };
      }

      // Log auth event
      if (authData.user) {
        await this.logAuthEvent(authData.user.id, 'login', {
          email: data.email,
        });
      }

      // Get complete user profile
      const userProfile = await this.getUserProfile(authData.user?.id);

      return {
        success: true,
        user: userProfile,
        session: authData.session as AuthSession,
      };
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      return {
        success: false,
        error: 'Nieoczekiwany błąd podczas logowania',
      };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return {
        success: false,
        error: 'Błąd podczas wylogowywania',
      };
    }
  }

  /**
   * Get current user session
   */
  async getSession(): Promise<AuthSession | null> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error || !session) {
        return null;
      }

      // Get complete user profile
      const userProfile = await this.getUserProfile(session.user.id);
      
      return {
        ...session,
        user: userProfile,
      } as AuthSession;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Get complete user profile with company information
   */
  async getUserProfile(userId?: string): Promise<AuthUser> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      // Get user metadata from Supabase Auth
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not found');
      }

      // Get company information if company_id exists
      let company: Company | undefined;
      const companyId = user.user_metadata?.company_id;
      
      if (companyId) {
        const { data: companyData, error: companyError } = await this.supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single();

        if (!companyError && companyData) {
          company = companyData;
        }
      }

      return {
        ...user,
        company,
        profile: {
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          company_id: companyId || null,
        },
      } as AuthUser;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Log authentication events
   */
  private async logAuthEvent(
    userId: string,
    eventType: 'login' | 'registration' | 'logout',
    authData: Record<string, any>
  ): Promise<void> {
    try {
      await this.supabase.from('auth_events').insert({
        user_id: userId,
        event_type: eventType,
        auth_data: authData,
        processed: false,
      });
    } catch (error) {
      // Don't fail auth process if logging fails
      console.error('Error logging auth event:', error);
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: AuthSession | null) => void) {
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      let authSession: AuthSession | null = null;
      
      if (session?.user) {
        try {
          const userProfile = await this.getUserProfile(session.user.id);
          authSession = {
            ...session,
            user: userProfile,
          } as AuthSession;
        } catch (error) {
          console.error('Error getting user profile in auth state change:', error);
          authSession = session as AuthSession;
        }
      }
      
      callback(event, authSession);
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: {
    firstName?: string;
    lastName?: string;
    companyName?: string;
    companyAddress?: string;
  }): Promise<AuthResponse> {
    try {
      const currentUser = await this.getUserProfile();
      if (!currentUser) {
        return {
          success: false,
          error: 'Użytkownik nie jest zalogowany',
        };
      }

      // Update user metadata
      const userUpdates: Record<string, any> = {};
      if (updates.firstName) userUpdates.first_name = updates.firstName;
      if (updates.lastName) userUpdates.last_name = updates.lastName;

      if (Object.keys(userUpdates).length > 0) {
        const { error: userError } = await this.supabase.auth.updateUser({
          data: userUpdates,
        });

        if (userError) {
          return {
            success: false,
            error: userError.message,
          };
        }
      }

      // Update company if provided
      if ((updates.companyName || updates.companyAddress) && currentUser.company) {
        const companyUpdates: Partial<Company> = {};
        if (updates.companyName) companyUpdates.name = updates.companyName;
        if (updates.companyAddress) companyUpdates.address = updates.companyAddress;

        const { error: companyError } = await this.supabase
          .from('companies')
          .update(companyUpdates)
          .eq('id', currentUser.company.id);

        if (companyError) {
          return {
            success: false,
            error: 'Błąd podczas aktualizacji danych firmy',
          };
        }
      }

      // Get updated profile
      const updatedProfile = await this.getUserProfile(currentUser.id);

      return {
        success: true,
        user: updatedProfile,
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: 'Nieoczekiwany błąd podczas aktualizacji profilu',
      };
    }
  }
} 