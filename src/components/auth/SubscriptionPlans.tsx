import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscription } from "@/hooks/use-subscription";
import { Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const premiumFeatures = [
  "Accesso a tutte le ricette",
  "Piano alimentare personalizzato",
  "Supporto via email",
];

const diamondFeatures = [
  ...premiumFeatures,
  "Consulenza nutrizionale personalizzata",
  "Accesso prioritario alle nuove funzionalità",
  "Supporto prioritario 24/7",
];

export const SubscriptionPlans = () => {
  const { createCheckoutSession } = useSubscription();
  const { toast } = useToast();

  const handleSubscribe = async (priceId: string, planType: 'premium' | 'diamond') => {
    try {
      const url = await createCheckoutSession(priceId, planType);
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Si è verificato un errore durante l'elaborazione dell'abbonamento. Riprova più tardi.",
      });
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
      <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
        <CardHeader>
          <CardTitle>Premium</CardTitle>
          <CardDescription>Piano consigliato per iniziare</CardDescription>
          <div className="text-3xl font-bold">€9.99/mese</div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {premiumFeatures.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
            onClick={() => handleSubscribe('price_1QlBThGHSZZ6p99CLlfx7ZRf', 'premium')}
          >
            Inizia ora
          </Button>
        </CardFooter>
      </Card>

      <Card className="relative overflow-hidden border-2 border-primary hover:border-primary/80 transition-colors">
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm">
          Consigliato
        </div>
        <CardHeader>
          <CardTitle>Diamond</CardTitle>
          <CardDescription>Piano completo con tutti i vantaggi</CardDescription>
          <div className="text-3xl font-bold">€19.99/mese</div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {diamondFeatures.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
            onClick={() => handleSubscribe('price_1QlBUAGHSZZ6p99CKtWYlApS', 'diamond')}
          >
            Inizia ora
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};