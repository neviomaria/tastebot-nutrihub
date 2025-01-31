import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Timer } from "@/components/timer/Timer";
import { MoreVertical } from "lucide-react";

interface Timer {
  id: number;
  title: string;
  description?: string;
  duration: number;
}

const Timers = () => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [showNewTimer, setShowNewTimer] = useState(false);
  const [editingTimer, setEditingTimer] = useState<Timer | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "", duration: 0 });
  const [timeUnit, setTimeUnit] = useState<"seconds" | "minutes" | "hours">("seconds");

  useEffect(() => {
    // Fetch timers from an API or local storage
    // setTimers(fetchedTimers);
  }, []);

  const handleEdit = (timer: Timer) => {
    setEditingTimer(timer);
    setFormData({ title: timer.title, description: timer.description || "", duration: timer.duration });
  };

  const handleDelete = (id: number) => {
    setTimers(timers.filter(timer => timer.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add new timer logic
    setShowNewTimer(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update timer logic
    setEditingTimer(null);
  };

  const convertToSeconds = (duration: number, unit: "seconds" | "minutes" | "hours") => {
    switch (unit) {
      case "minutes":
        return duration * 60;
      case "hours":
        return duration * 3600;
      default:
        return duration;
    }
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Timers</h1>
          <Button onClick={() => setShowNewTimer(true)}>
            Add Timer
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {timers.map((timer) => (
            <Card key={timer.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold">
                  {timer.title}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(timer)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDelete(timer.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                {timer.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {timer.description}
                  </p>
                )}
                <Timer
                  duration={timer.duration}
                  size="large"
                  className="mx-auto"
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={showNewTimer} onOpenChange={setShowNewTimer}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Timer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <div className="flex gap-2">
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <Select
                    value={timeUnit}
                    onValueChange={(value) => {
                      setTimeUnit(value as "seconds" | "minutes" | "hours");
                      const newDuration = convertToSeconds(
                        formData.duration,
                        value as "seconds" | "minutes" | "hours"
                      );
                      setFormData({ ...formData, duration: newDuration });
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seconds">Seconds</SelectItem>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Timer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingTimer} onOpenChange={() => setEditingTimer(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Timer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (optional)</Label>
                <Input
                  id="edit-description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <Select
                    value={timeUnit}
                    onValueChange={(value) => {
                      setTimeUnit(value as "seconds" | "minutes" | "hours");
                      const newDuration = convertToSeconds(
                        formData.duration,
                        value as "seconds" | "minutes" | "hours"
                      );
                      setFormData({ ...formData, duration: newDuration });
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seconds">Seconds</SelectItem>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Timers;
