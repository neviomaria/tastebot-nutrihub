import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Timer } from "@/components/timer/Timer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Plus } from "lucide-react";
import { SelectField } from "@/components/form/SelectField";
import { useForm, Form } from "react-hook-form";
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
import { Form as ShadcnForm } from "@/components/ui/form";

interface TimerFormData {
  title: string;
  description?: string;
  duration: number;
  timeUnit: "seconds" | "minutes" | "hours";
}

export default function Timers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<TimerFormData>({
    defaultValues: {
      title: "",
      description: "",
      duration: 60,
      timeUnit: "seconds",
    },
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
      
      const durationInSeconds = convertToSeconds(data.duration, data.timeUnit);
      
      const { error } = await supabase.from("timers").insert([{
        title: data.title,
        description: data.description,
        duration: durationInSeconds,
        user_id: userData.user.id
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timers"] });
      setIsOpen(false);
      form.reset();
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

  const handleSubmit = (data: TimerFormData) => {
    createTimer.mutate(data);
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div>
                  <Input
                    placeholder="Timer title"
                    {...form.register("title", { required: true })}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Description (optional)"
                    {...form.register("description")}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Duration"
                      {...form.register("duration", { 
                        required: true,
                        valueAsNumber: true,
                        min: 1 
                      })}
                    />
                  </div>
                  <div className="flex-1">
                    <ShadcnForm>
                      <SelectField
                        form={form}
                        name="timeUnit"
                        label=""
                        options={["seconds", "minutes", "hours"]}
                      />
                    </ShadcnForm>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Create Timer
                </Button>
              </form>
            </Form>
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

const convertToSeconds = (value: number, unit: "seconds" | "minutes" | "hours") => {
  switch (unit) {
    case "minutes":
      return value * 60;
    case "hours":
      return value * 3600;
    default:
      return value;
  }
};