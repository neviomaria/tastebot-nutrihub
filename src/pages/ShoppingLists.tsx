import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShoppingLists() {
  const [newListTitle, setNewListTitle] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: shoppingLists, isLoading } = useQuery({
    queryKey: ['shopping-lists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const createList = useMutation({
    mutationFn: async (title: string) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const { data, error } = await supabase
        .from('shopping_lists')
        .insert([{ 
          title,
          user_id: userData.user.id 
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      setNewListTitle("");
      toast({
        title: "Lista creata",
        description: "La tua nuova lista della spesa è stata creata con successo.",
      });
    },
    onError: (error) => {
      console.error('Error creating list:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Non è stato possibile creare la lista. Riprova più tardi.",
      });
    }
  });

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Inserisci un titolo per la lista.",
      });
      return;
    }
    createList.mutate(newListTitle);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Liste della Spesa</h1>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Liste della Spesa</h1>
      
      <form onSubmit={handleCreateList} className="flex gap-4">
        <Input
          placeholder="Nome della nuova lista..."
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          className="max-w-md"
        />
        <Button type="submit" disabled={createList.isPending}>
          <Plus className="h-4 w-4 mr-2" />
          Crea Lista
        </Button>
      </form>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shoppingLists?.map((list) => (
          <Card key={list.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex justify-between items-center">
                <span className="text-lg">{list.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {/* TODO: Implement view list */}}
                >
                  Visualizza
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Creata il {new Date(list.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {shoppingLists?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Non hai ancora creato nessuna lista della spesa.
          </p>
        </div>
      )}
    </div>
  );
}