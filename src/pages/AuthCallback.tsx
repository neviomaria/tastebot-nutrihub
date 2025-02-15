import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
 
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Starting auth callback handling...");
        
        // Get the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        console.log("Hash params:", { accessToken: !!accessToken, refreshToken: !!refreshToken });

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Error setting session:', error);
            toast({
              variant: "destructive",
              title: "Authentication Error",
              description: "There was a problem confirming your email. Please try again.",
            });
            navigate('/auth');
            return;
          }

          if (data.session) {
            console.log('Session confirmed:', data.session);
            toast({
              title: "Email Confirmed",
              description: "Your email has been confirmed successfully. Welcome!",
            });
            navigate('/');
            return;
          }
        }

        // Fallback: check current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error during auth callback:', error);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "There was a problem confirming your email. Please try again.",
          });
          navigate('/auth');
          return;
        }

        if (session) {
          console.log('Session found:', session);
          toast({
            title: "Welcome Back",
            description: "You are now signed in.",
          });
          navigate('/');
        } else {
          console.log('No session found during callback');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Confirming your email...</h2>
        <p className="text-gray-600">Please wait while we verify your account.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
