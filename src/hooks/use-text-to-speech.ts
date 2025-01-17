import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useTextToSpeech = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const generateSpeech = async (text: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text },
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate speech');
      }

      if (!data?.audioContent) {
        throw new Error('No audio content received');
      }

      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mp3' }
      );
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return url;

    } catch (error) {
      console.error('Error generating speech:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate speech. Please try again.",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const cleanup = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  return {
    generateSpeech,
    isLoading,
    cleanup,
  };
};