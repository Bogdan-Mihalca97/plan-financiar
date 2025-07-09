
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (firstName: string, lastName: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Clean up all auth-related storage
const cleanupAuthState = () => {
  try {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if present
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error cleaning up auth state:', error);
  }
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const checkPendingInvitation = () => {
    const pendingInvitation = localStorage.getItem('pendingInvitation');
    if (pendingInvitation) {
      localStorage.removeItem('pendingInvitation');
      // Redirect to invitation page after successful auth
      setTimeout(() => {
        window.location.href = `/invitation/${pendingInvitation}`;
      }, 1000);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user profile when user signs in
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
            // Check for pending invitation after profile is loaded
            if (event === 'SIGNED_IN') {
              setTimeout(checkPendingInvitation, 500);
            }
          }, 0);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Clean up existing state before login
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log('Global signout failed, continuing with login');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Conectare Reușită!",
          description: "Bun venit înapoi la BugetControl",
        });
        
        // Check for pending invitation before redirect
        const pendingInvitation = localStorage.getItem('pendingInvitation');
        const skipAuthRedirect = localStorage.getItem('skipAuthRedirect');
        
        if (pendingInvitation) {
          localStorage.removeItem('pendingInvitation');
          setTimeout(() => {
            window.location.href = `/invitation/${pendingInvitation}`;
          }, 500);
        } else if (skipAuthRedirect) {
          // Don't redirect if skipAuthRedirect flag is set
          localStorage.removeItem('skipAuthRedirect');
        } else {
          // Navigate to dashboard without full page reload
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 500);
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Eroare la conectare",
        description: error.message || "Email sau parolă incorectă",
        variant: "destructive"
      });
      throw error;
    }
  };

  const register = async (userData: { firstName: string; lastName: string; email: string; password: string }) => {
    try {
      // Clean up existing state before register
      cleanupAuthState();
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Cont Creat cu Succes!",
          description: "Te-am conectat automat. Bun venit la BugetControl!",
        });
        
        // Redirect to dashboard after successful registration
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (error: any) {
      console.error('Register error:', error);
      toast({
        title: "Eroare la înregistrare",
        description: error.message || "A apărut o problemă la crearea contului",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateProfile = async (firstName: string, lastName: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setUserProfile(prev => prev ? {
        ...prev,
        first_name: firstName,
        last_name: lastName,
      } : null);

    } catch (error: any) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      // First delete all user data from profiles table
      // This will cascade delete all related data due to foreign key constraints
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        // Continue even if profile deletion fails
      }

      // Clean up local state first
      cleanupAuthState();
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      // Sign out the user globally
      await supabase.auth.signOut({ scope: 'global' });
      
      toast({
        title: "Cont șters",
        description: "Datele tale au fost eliminate cu succes din aplicație.",
      });
      
      // Redirect to home page
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      
    } catch (error: any) {
      console.error('Delete account error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Starting logout process...');
      
      // Clean up auth state first
      cleanupAuthState();
      
      // Clear local state
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      // Attempt global sign out
      try {
        const { error } = await supabase.auth.signOut({ scope: 'global' });
        if (error) {
          console.error('Supabase signout error:', error);
        }
      } catch (error) {
        console.error('Error during Supabase signout:', error);
        // Continue with logout even if Supabase signout fails
      }
      
      toast({
        title: "Deconectat cu succes",
        description: "Te-ai deconectat din cont",
      });
      
      // Navigate to home without full page reload
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      
    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Force cleanup and redirect even if there's an error
      cleanupAuthState();
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      toast({
        title: "Deconectat",
        description: "Sesiunea a fost închisă",
      });
      
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    }
  };

  const value = {
    user,
    session,
    userProfile,
    login,
    register,
    logout,
    updateProfile,
    deleteAccount,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
