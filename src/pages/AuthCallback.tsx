import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();
      
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

      toast({
        title: "Email Confirmed",
        description: "Your email has been confirmed successfully.",
      });
      navigate('/');
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