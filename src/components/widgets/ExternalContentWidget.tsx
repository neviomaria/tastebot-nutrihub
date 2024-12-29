import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ExternalContentWidget = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["external-content"],
    queryFn: async () => {
      const { data: functionData, error } = await supabase.functions.invoke('fetch-external-content')
      if (error) throw error
      return functionData
    },
  });

  if (isLoading) {
    return (
      <Card className="w-full bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Loading external content...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
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