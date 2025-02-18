import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Per ora solo simuliamo l'invio
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Messaggio inviato con successo!");
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      toast.error("Errore nell'invio del messaggio. Riprova più tardi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Contattaci</h1>
      <div className="bg-card rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Nome
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Il tuo nome"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="La tua email"
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Messaggio
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Il tuo messaggio"
              className="min-h-[150px]"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Invio in corso..." : "Invia messaggio"}
          </Button>
        </form>
      </div>
    </div>
  );
}
