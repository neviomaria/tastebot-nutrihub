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
  const [newItemQuantity, setNewItemQuantity] = useState("");
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
    mutationFn: async ({ listId, ingredient, quantity }: { listId: string; ingredient: string; quantity?: string }) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('shopping_list_items')
        .insert([{
          shopping_list_id: listId,
          ingredient,
          quantity,
          checked: false
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ listId, ingredient, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['shopping-lists'] });
      
      const previousLists = queryClient.getQueryData<ShoppingList[]>(['shopping-lists']);
      
      const tempId = generateUUID();
      
      queryClient.setQueryData<ShoppingList[]>(['shopping-lists'], (old) => {
        if (!old) return [];
        return old.map(list => {
          if (list.id === listId) {
            const newItem = {
              id: tempId,
              ingredient,
              quantity,
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

      if (selectedList?.id === listId) {
        setSelectedList(prev => {
          if (!prev) return null;
          return {
            ...prev,
            items: [...(prev.items || []), { id: tempId, ingredient, quantity, checked: false }]
          };
        });
      }

      return { previousLists, tempId };
    },
    onError: (err, variables, context) => {
      if (context?.previousLists) {
        queryClient.setQueryData(['shopping-lists'], context.previousLists);
        
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
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      setNewItem("");
      setNewItemQuantity("");
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
    addItem.mutate({ 
      listId: selectedList.id, 
      ingredient: newItem.trim(),
      quantity: newItemQuantity.trim() || undefined
    });
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

  const prepareWhatsAppShare = (list: ShoppingList) => {
    const title = encodeURIComponent(`📝 Shopping List from Pybher: ${list.title}`);
    const items = list.items
      ?.map(item => `${item.ingredient}${item.quantity ? ` (${item.quantity})` : ''}`)
      .join('\n- ');
    const marketingMessage = "\n\n🌟 Create your own shopping lists and meal plans at https://pybher.com";
    const encodedItems = encodeURIComponent(`${items}${marketingMessage}`);
    const text = `${title}\n\n- ${encodedItems}`;
    return `https://wa.me/?text=${text}`;
  };

  const handleShare = async (list: ShoppingList) => {
    // On mobile, directly open WhatsApp
    if (window.innerWidth < 768) {
      const whatsappUrl = prepareWhatsAppShare(list);
      window.open(whatsappUrl, '_blank');
      return;
    }

    // On desktop, try native sharing first
    if (navigator.share) {
      try {
        const items = list.items?.map(item => 
          `${item.ingredient}${item.quantity ? ` (${item.quantity})` : ''}`
        ).join('\n- ');
        
        const marketingMessage = "\n\n🌟 Create your own shopping lists and meal plans at https://pybher.com";
        const text = `📝 Shopping List: ${list.title}\n\n- ${items}${marketingMessage}`;
        
        await navigator.share({
          title: `Shopping List from Pybher: ${list.title}`,
          text: text,
        });
        
        toast({
          title: "Success",
          description: "List shared successfully!",
        });
      } catch (error) {
        // Don't show error for user cancellation
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
          // Show dialog with alternative sharing options
          setSelectedList(list);
          setShareDialogOpen(true);
        }
      }
    } else {
      // Show dialog with WhatsApp and Email options if native sharing is not available
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
                className="flex-1"
              />
              <Input
                placeholder="Quantity (optional)"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
                className="w-32"
              />
              <Button type="submit" disabled={addItem.isPending}>
                Add
              </Button>
            </form>

            <div className="space-y-2">
              {selectedList.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 p-2 bg-background rounded-lg border">
                  <div className="flex items-center gap-2 flex-1">
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
                      {item.quantity && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({item.quantity})
                        </span>
                      )}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Shopping List</DialogTitle>
            <DialogDescription>
              Choose how you want to share this list
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Button
              onClick={() => {
                if (!selectedList) return;
                const whatsappUrl = prepareWhatsAppShare(selectedList);
                window.open(whatsappUrl, '_blank');
                setShareDialogOpen(false);
                toast({
                  title: "Success",
                  description: "Opening WhatsApp to share the list!",
                });
              }}
              className="w-full"
              variant="secondary"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Share via WhatsApp
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
            <form onSubmit={handleEmailShare} className="space-y-4">
              <Input
                type="email"
                placeholder="Enter email address"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
              />
              <Button type="submit" disabled={sendEmail.isPending} className="w-full">
                Share via Email
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
