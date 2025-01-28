import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ExternalContentWidget = () => {
  console.log("[ExternalContentWidget] Starting render");
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["external-content"],
    queryFn: async () => {
      console.log("[ExternalContentWidget] Fetching external content");
      const { data: functionData, error } = await supabase.functions.invoke('fetch-external-content')
      if (error) throw error;
      console.log("[ExternalContentWidget] External content fetched:", functionData);
      return functionData;
    },
  });

  if (isLoading) {
    console.log("[ExternalContentWidget] Loading state");
    return (
      <Card className="w-full bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Loading external content...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    console.error("[ExternalContentWidget] Error state:", error);
    return (
      <Card className="w-full bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Error loading content</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load external content</p>
        </CardContent>
      </Card>
    );
  }

  console.log("[ExternalContentWidget] Rendering with data:", data);
  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader>
        <CardTitle>{data?.title || 'External Content'}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
      </CardContent>
    </Card>
  );
};
