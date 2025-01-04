import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useAiGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateContent = async (prompt: string) => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a prompt for content generation.",
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-with-ai', {
        body: { prompt },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate content');
      }

      if (!data?.generatedText) {
        throw new Error('No content was generated');
      }

      return data.generatedText;
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate content. Please try again.",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateContent,
    isLoading,
  };
};