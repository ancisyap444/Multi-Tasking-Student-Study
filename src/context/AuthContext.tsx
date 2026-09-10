import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { StudentProfile } from '@/types/database.types';
import { mockProfile } from '@/lib/mockData';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: StudentProfile | null;
  isLoading: boolean;
  isDemo: boolean;
  isConfigured: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, pass: string, metadata: { full_name: string; program: string; year: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  deleteAccount: () => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<StudentProfile>) => Promise<void>;
  toggleDemoMode: (enabled: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isConfigured = isSupabaseConfigured();
  
  // Check if demo mode was explicitly requested or default to demo if not configured
  const [isDemo, setIsDemo] = useState<boolean>(() => {
    if (!isConfigured) return true;
    const saved = localStorage.getItem('quicksuite_force_demo');
    return saved === 'true';
  });

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(() => {
    const savedProfile = localStorage.getItem('quicksuite_profile');
    if (savedProfile) {
      try {
        return JSON.parse(savedProfile);
      } catch {
        // ignore
      }
    }
    return mockProfile;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch student profile from Supabase
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Could not fetch profile from Supabase, using defaults:', error.message);
        return;
      }
      if (data) {
        setProfile(data as StudentProfile);
        localStorage.setItem('quicksuite_profile', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
  }, []);

  useEffect(() => {
    if (isDemo || !isConfigured) {
      // Demo mode: mock active session
      setUser({
        id: mockProfile.id,
        email: 'alex.river@university.edu',
        app_metadata: {},
        user_metadata: { full_name: mockProfile.full_name },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User);
      setIsLoading(false);
      return;
    }

    // Live Supabase Mode
    let mounted = true;

    async function initializeAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            await fetchProfile(initialSession.user.id);
          }
        }
      } catch (err) {
        console.error('Supabase session init error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isDemo, isConfigured, fetchProfile]);

  const signIn = async (email: string, pass: string) => {
    if (isDemo) {
      setUser({
        id: mockProfile.id,
        email,
        app_metadata: {},
        user_metadata: { full_name: 'Alex River' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    return { error: error as Error | null };
  };

  const signUp = async (
    email: string,
    pass: string,
    metadata: { full_name: string; program: string; year: string }
  ) => {
    if (isDemo) {
      const updatedProf: StudentProfile = {
        id: 'student-' + Date.now(),
        full_name: metadata.full_name,
        program: metadata.program,
        year: metadata.year as any,
        target_study_hours_week: 25,
      };
      setProfile(updatedProf);
      localStorage.setItem('quicksuite_profile', JSON.stringify(updatedProf));
      return { error: null };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: metadata.full_name,
          program: metadata.program,
          year: metadata.year,
        },
      },
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    if (isDemo) {
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    if (isDemo) {
      return { error: null };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error as Error | null };
  };

  const deleteAccount = async () => {
    if (isDemo) {
      localStorage.clear();
      window.location.reload();
      return { error: null };
    }

    try {
      if (!user) return { error: new Error('No active user') };
      // Delete user's profile row (cascade will delete subjects, events, tasks, documents)
      const { error } = await supabase.from('profiles').delete().eq('id', user.id);
      if (error) throw error;

      await signOut();
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const updateProfile = async (updates: Partial<StudentProfile>) => {
    if (!profile) return;
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    localStorage.setItem('quicksuite_profile', JSON.stringify(newProfile));

    if (!isDemo && isConfigured && user) {
      await supabase.from('profiles').update(updates).eq('id', user.id);
    }
  };

  const toggleDemoMode = (enabled: boolean) => {
    setIsDemo(enabled);
    localStorage.setItem('quicksuite_force_demo', enabled ? 'true' : 'false');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isDemo,
        isConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        deleteAccount,
        updateProfile,
        toggleDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
