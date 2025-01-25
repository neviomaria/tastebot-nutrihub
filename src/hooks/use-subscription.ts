import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export type SubscriptionPlan = 'freemium' | 'premium' | 'diamond';

interface UseSubscriptionReturn {
  isLoading: boolean;
  currentPlan: SubscriptionPlan;
  createCheckoutSession: (priceId: string, planType: SubscriptionPlan) => Promise<string | null>;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>('freemium');
  const { toast } = useToast();

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const { data: { error } } = await supabase.functions.invoke('check-subscription');
        
        if (error) {
          console.error('Error checking subscription:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to check subscription status",
          });
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('access_level')
          .single();

        if (profile?.access_level) {
          setCurrentPlan(profile.access_level as SubscriptionPlan);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [toast]);

  const createCheckoutSession = async (priceId: string, planType: SubscriptionPlan): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, planType }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create checkout session",
        });
        return null;
      }

      return data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create checkout session",
      });
      return null;
    }
  };

  return {
    isLoading,
    currentPlan,
    createCheckoutSession,
  };
};