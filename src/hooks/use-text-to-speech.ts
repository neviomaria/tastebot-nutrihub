import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTextToSpeech = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const generateSpeech = async (text: string) => {
    try {
      setIsLoading(true);
      
      if (!text) {
        throw new Error('No text provided');
      }

      if (text.length > 4096) {
        throw new Error('Text is too long. Maximum length is 4096 characters.');
      }
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate speech');
      }

      if (!data?.audioContent) {
        throw new Error('No audio content received');
      }

      // Clean up previous audio URL if it exists
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mp3' }
      );
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      // Create and play audio
      const audio = new Audio(url);
      await audio.play();

      return url;
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
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