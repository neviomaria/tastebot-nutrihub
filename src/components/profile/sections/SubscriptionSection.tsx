import { Diamond, CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const SubscriptionSection = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile-subscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from('profiles')
        .select('access_level')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Subscription</h3>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPremium = profile?.access_level === 'premium';
  const isDiamond = profile?.access_level === 'diamond';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Subscription</h3>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isDiamond ? (
              <>
                <Diamond className="h-5 w-5 text-blue-500" />
                Diamond Plan
              </>
            ) : isPremium ? (
              <>
                <CreditCard className="h-5 w-5 text-purple-500" />
                Premium Plan
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 text-gray-500" />
                Free Plan
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isDiamond ? (
              "You're enjoying our Diamond plan with all premium features and exclusive content."
            ) : isPremium ? (
              "You're on our Premium plan with advanced features and priority support."
            ) : (
              "You're currently on the free plan. Upgrade to access premium features."
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};