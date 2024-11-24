import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

export function useAuth() {
  const navigate = useNavigate();
  const { setAuth, logout } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuth(session.access_token, {
          id: session.user.id,
          email: session.user.email!,
          businessName: '' // Will be updated after business data fetch
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: businessData } = await supabase
          .from('businesses')
          .select('business_name')
          .eq('id', session.user.id)
          .single();

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
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, setAuth, logout]);

  return { supabase };
}