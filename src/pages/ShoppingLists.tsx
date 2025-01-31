import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Pencil, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ShoppingListItem {
  id: string;
  ingredient: string;
  checked: boolean;
  quantity?: string;
}

interface ShoppingList {
  id: string;
  title: string;
  created_at: string;
  items?: ShoppingListItem[];
}

export default function ShoppingLists() {
  const [newListTitle, setNewListTitle] = useState("");
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [newItem, setNewItem] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Helper function to generate a UUID
  const generateUUID = () => {
    return crypto.randomUUID();
  };

  const { data: shoppingLists, isLoading } = useQuery({
    queryKey: ['shopping-lists'],
    queryFn: async () => {
      const { data: lists, error: listsError } = await supabase
        .from('shopping_lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (listsError) throw listsError;

      const listsWithItems = await Promise.all(lists.map(async (list) => {
        const { data: items, error: itemsError } = await supabase
          .from('shopping_list_items')
          .select('*')
          .eq('shopping_list_id', list.id)
          .order('created_at', { ascending: true });

        if (itemsError) throw itemsError;

        return {
          ...list,
          items: items || []
        };
      }));

      return listsWithItems;
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
        title: "Success",
        description: "Shopping list created successfully.",
      });
    }
  });

  const addItem = useMutation({
    mutationFn: async ({ listId, ingredient }: { listId: string; ingredient: string }) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('shopping_list_items')
        .insert([{
          shopping_list_id: listId,
          ingredient,
          checked: false
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ listId, ingredient }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['shopping-lists'] });
      
      // Snapshot the previous value
      const previousLists = queryClient.getQueryData<ShoppingList[]>(['shopping-lists']);
      
      // Create a temporary ID for optimistic update
      const tempId = generateUUID();
      
      // Optimistically update the cache
      queryClient.setQueryData<ShoppingList[]>(['shopping-lists'], (old) => {
        if (!old) return [];
        return old.map(list => {
          if (list.id === listId) {
            const newItem = {
              id: tempId,
              ingredient,
              checked: false,
            };
            return {
              ...list,
              items: [...(list.items || []), newItem]
            };
          }
          return list;
        });
      });

      // Also update the selected list if it matches
      if (selectedList?.id === listId) {
        setSelectedList(prev => {
          if (!prev) return null;
          return {
            ...prev,
            items: [...(prev.items || []), { id: tempId, ingredient, checked: false }]
          };
        });
      }

      // Return a context object with the snapshotted value
      return { previousLists, tempId };
    },
    onError: (err, variables, context) => {
      if (context?.previousLists) {
        // Revert to the snapshot on error
        queryClient.setQueryData(['shopping-lists'], context.previousLists);
        
        // Also revert the selected list if needed
        if (selectedList?.id === variables.listId) {
          setSelectedList(prev => {
            if (!prev) return null;
            return {
              ...prev,
              items: prev.items?.filter(item => item.id !== context.tempId)
            };
          });
        }
      }
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      setNewItem("");
    }
  });

  const deleteItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      return itemId;
    },
    onMutate: async (itemId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['shopping-lists'] });
      
      // Snapshot the previous value
      const previousLists = queryClient.getQueryData<ShoppingList[]>(['shopping-lists']);
      
      // Optimistically update the cache
      queryClient.setQueryData<ShoppingList[]>(['shopping-lists'], (old) => {
        if (!old) return [];
        return old.map(list => ({
          ...list,
          items: list.items?.filter(item => item.id !== itemId)
        }));
      });

      // Also update the selected list if needed
      if (selectedList) {
        setSelectedList(prev => {
          if (!prev) return null;
          return {
            ...prev,
            items: prev.items?.filter(item => item.id !== itemId)
          };
        });
      }

      return { previousLists };
    },
    onError: (err, itemId, context) => {
      if (context?.previousLists) {
        // Revert to the snapshot on error
        queryClient.setQueryData(['shopping-lists'], context.previousLists);
      }
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    }
  });

  const updateListTitle = useMutation({
    mutationFn: async ({ listId, title }: { listId: string; title: string }) => {
      const { data, error } = await supabase
        .from('shopping_lists')
        .update({ title })
        .eq('id', listId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      setEditingListId(null);
      setEditingTitle("");
      toast({
        title: "Success",
        description: "List renamed successfully.",
      });
    }
  });

  const handleRename = (e: React.FormEvent, listId: string) => {
    e.preventDefault();
    if (!editingTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a title for the list.",
      });
      return;
    }
    updateListTitle.mutate({ listId, title: editingTitle });
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a title for the list.",
      });
      return;
    }
    createList.mutate(newListTitle);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedList) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a list first.",
      });
      return;
    }
    if (!newItem.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an item.",
      });
      return;
    }
    addItem.mutate({ listId: selectedList.id, ingredient: newItem.trim() });
  };

  // Add deleteList mutation
  const deleteList = useMutation({
    mutationFn: async (listId: string) => {
      // First delete all items in the list
      const { error: itemsError } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('shopping_list_id', listId);

      if (itemsError) throw itemsError;

      // Then delete the list itself
      const { error: listError } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', listId);

      if (listError) throw listError;
      return listId;
    },
    onMutate: async (listId) => {
      await queryClient.cancelQueries({ queryKey: ['shopping-lists'] });
      
      const previousLists = queryClient.getQueryData<ShoppingList[]>(['shopping-lists']);
      
      queryClient.setQueryData<ShoppingList[]>(['shopping-lists'], (old) => {
        if (!old) return [];
        return old.filter(list => list.id !== listId);
      });

      if (selectedList?.id === listId) {
        setSelectedList(null);
      }

      return { previousLists };
    },
    onError: (err, listId, context) => {
      if (context?.previousLists) {
        queryClient.setQueryData(['shopping-lists'], context.previousLists);
      }
      toast({
        title: "Error",
        description: "Failed to delete list. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    }
  });

  // Add toggleItem mutation
  const toggleItem = useMutation({
    mutationFn: async ({ itemId, checked }: { itemId: string; checked: boolean }) => {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .update({ checked })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ itemId, checked }) => {
      await queryClient.cancelQueries({ queryKey: ['shopping-lists'] });
      
      const previousLists = queryClient.getQueryData<ShoppingList[]>(['shopping-lists']);
      
      queryClient.setQueryData<ShoppingList[]>(['shopping-lists'], (old) => {
        if (!old) return [];
        return old.map(list => ({
          ...list,
          items: list.items?.map(item => 
            item.id === itemId ? { ...item, checked } : item
          )
        }));
      });

      if (selectedList) {
        setSelectedList(prev => {
          if (!prev) return null;
          return {
            ...prev,
            items: prev.items?.map(item =>
              item.id === itemId ? { ...item, checked } : item
            )
          };
        });
      }

      return { previousLists };
    },
    onError: (err, variables, context) => {
      if (context?.previousLists) {
        queryClient.setQueryData(['shopping-lists'], context.previousLists);
      }
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    }
  });

  const handleShare = async (list: ShoppingList) => {
    // Check if the Web Share API is supported
    if (navigator.share) {
      try {
        const items = list.items?.map(item => `${item.ingredient}${item.quantity ? ` (${item.quantity})` : ''}`).join('\n- ');
        const text = `Shopping List: ${list.title}\n\n- ${items}`;
        
        await navigator.share({
          title: `Shopping List: ${list.title}`,
          text: text,
        });
        
        toast({
          title: "Success",
          description: "List shared successfully!",
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast({
            title: "Error",
            description: "Failed to share the list.",
            variant: "destructive",
          });
        }
      }
    } else {
      setSelectedList(list);
      setShareDialogOpen(true);
    }
  };

  const sendEmail = useMutation({
    mutationFn: async ({ listId, email }: { listId: string; email: string }) => {
      const { data, error } = await supabase.functions.invoke('send-shopping-list', {
        body: { listId, recipientEmail: email },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Shopping list sent successfully!",
      });
      setShareDialogOpen(false);
      setShareEmail("");
    },
    onError: (error) => {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send the shopping list. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEmailShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedList) return;
    
    if (!shareEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    sendEmail.mutate({ 
      listId: selectedList.id, 
      email: shareEmail 
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Shopping Lists</h1>
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
      <h1 className="text-3xl font-bold">Shopping Lists</h1>
      
      <form onSubmit={handleCreateList} className="flex gap-4">
        <Input
          placeholder="New list name..."
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          className="max-w-md"
        />
        <Button type="submit" disabled={createList.isPending}>
          <Plus className="h-4 w-4 mr-2" />
          Create List
        </Button>
      </form>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Lists</h2>
          <div className="grid gap-4">
            {shoppingLists?.map((list) => (
              <Card 
                key={list.id} 
                className={`hover:shadow-lg transition-shadow cursor-pointer ${
                  selectedList?.id === list.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  if (editingListId !== list.id) {
                    setSelectedList(list);
                  }
                }}
              >
                <CardHeader className="p-4">
                  <CardTitle className="flex justify-between items-center text-lg">
                    {editingListId === list.id ? (
                      <form onSubmit={(e) => handleRename(e, list.id)} className="flex-1 mr-2">
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setEditingListId(null);
                              setEditingTitle("");
                            }
                          }}
                          autoFocus
                        />
                      </form>
                    ) : (
                      <div className="flex items-center justify-between flex-1">
                        <span>{list.title}</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(list);
                            }}
                            className="hover:bg-[#F1F0FB]"
                          >
                            <Share2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingListId(list.id);
                              setEditingTitle(list.title);
                            }}
                            className="hover:bg-[#F1F0FB]"
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this list?')) {
                                deleteList.mutate(list.id);
                              }
                            }}
                            className="hover:bg-[#F1F0FB]"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {list.items?.length || 0} items
                  </p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {selectedList && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {selectedList.title}
            </h2>
            
            <form onSubmit={handleAddItem} className="flex gap-2">
              <Input
                placeholder="Add new item..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
              />
              <Button type="submit" disabled={addItem.isPending}>
                Add
              </Button>
            </form>

            <div className="space-y-2">
              {selectedList.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 p-2 bg-background rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={(checked) => {
                        toggleItem.mutate({ 
                          itemId: item.id, 
                          checked: checked as boolean 
                        });
                      }}
                    />
                    <span className={item.checked ? 'line-through text-muted-foreground' : ''}>
                      {item.ingredient}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteItem.mutate(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {shoppingLists?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            You haven't created any shopping lists yet.
          </p>
        </div>
      )}

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Shopping List</DialogTitle>
            <DialogDescription>
              Enter an email address to share this shopping list
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailShare} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter email address"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShareDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={sendEmail.isPending}>
                Send
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
