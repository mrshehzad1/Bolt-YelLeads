import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const { setAuth, logout } = useAuthStore();

  useEffect(() => {
    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: businessData } = await supabase
            .from('businesses')
            .select('business_name')
            .eq('id', session.user.id)
            .maybeSingle();

          setAuth(session.access_token, {
            id: session.user.id,
            email: session.user.email!,
            businessName: businessData?.business_name || ''
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        toast.error('Authentication error occurred');
        logout();
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (event === 'SIGNED_IN' && session) {
            const { data: businessData } = await supabase
              .from('businesses')
              .select('business_name')
              .eq('id', session.user.id)
              .maybeSingle();

            setAuth(session.access_token, {
              id: session.user.id,
              email: session.user.email!,
              businessName: businessData?.business_name || ''
            });
            navigate('/');
          }

          if (event === 'SIGNED_OUT') {
            logout();
            navigate('/login');
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          toast.error('Authentication error occurred');
          logout();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, setAuth, logout]);

  return <>{children}</>;
}