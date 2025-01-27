import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Timer } from "@/components/timer/Timer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface TimerFormData {
  title: string;
  description?: string;
  duration: number;
}

export default function Timers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<TimerFormData>({
    title: "",
    description: "",
    duration: 60,
  });

  const { data: timers, isLoading } = useQuery({
    queryKey: ["timers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("timers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createTimer = useMutation({
    mutationFn: async (data: TimerFormData) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const { error } = await supabase.from("timers").insert([{
        ...data,
        user_id: userData.user.id
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timers"] });
      setIsOpen(false);
      setFormData({ title: "", description: "", duration: 60 });
      toast({
        title: "Timer created",
        description: "Your timer has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create timer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteTimer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("timers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timers"] });
      toast({
        title: "Timer deleted",
        description: "Your timer has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete timer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTimer.mutate(formData);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Timers</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Timer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Timer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Timer title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Textarea
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Duration (seconds)"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value) || 60,
                    })
                  }
                  min="1"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Create Timer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {timers?.map((timer) => (
          <Card key={timer.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{timer.title}</CardTitle>
                  {timer.description && (
                    <CardDescription>{timer.description}</CardDescription>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTimer.mutate(timer.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Timer duration={timer.duration} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}