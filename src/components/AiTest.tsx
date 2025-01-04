import { useState } from "react";
import { useAiGeneration } from "@/hooks/use-ai-generation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export const AiTest = () => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const { generateContent, isLoading } = useAiGeneration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await generateContent(prompt);
    if (response) {
      setResult(response);
    }
  };

  return (
    <Card className="p-4 max-w-xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">AI Integration Test</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Textarea
            placeholder="Enter your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <Button type="submit" disabled={isLoading || !prompt.trim()}>
          {isLoading ? "Generating..." : "Generate Content"}
        </Button>
      </form>
      {result && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Generated Result:</h3>
          <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
            {result}
          </div>
        </div>
      )}
    </Card>
  );
};