import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";

const dietaryPreferences = [
  "None",
  "Vegetarian",
  "Vegan",
  "Keto",
  "Paleo",
  "Pescatarian",
  "Gluten-Free",
];

const activityLevels = [
  "Sedentary",
  "Lightly Active",
  "Moderately Active",
  "Very Active",
];

const healthGoals = [
  "Weight Loss",
  "Muscle Gain",
  "General Health",
  "Maintenance",
];

const planningPreferences = [
  "Daily Planning",
  "Weekly Planning",
  "No Preference",
];

const cuisineTypes = [
  "Italian",
  "Japanese",
  "Indian",
  "Mediterranean",
  "Mexican",
  "Thai",
  "French",
  "Chinese",
  "Korean",
  "American",
];

const profileSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  avatar_url: z.string().optional(),
  dietary_preferences: z.string(),
  allergies: z.string().optional(),
  health_goal: z.string(),
  activity_level: z.string(),
  planning_preference: z.string(),
  favorite_cuisines: z.string(),
});

const CompleteProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      avatar_url: "",
      dietary_preferences: "None",
      allergies: "",
      health_goal: "General Health",
      activity_level: "Moderately Active",
      planning_preference: "Weekly Planning",
      favorite_cuisines: "Italian",
    },
  });

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to complete your profile",
        });
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          username: values.username,
          avatar_url: values.avatar_url,
          dietary_preferences: values.dietary_preferences,
          allergies: values.allergies,
          health_goal: values.health_goal,
          activity_level: values.activity_level,
          planning_preference: values.planning_preference,
          favorite_cuisines: values.favorite_cuisines,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile completed!",
        description: "Welcome to your personalized nutrition journey!",
      });

      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            Help us personalize your nutrition journey
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avatar_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Picture URL</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={field.value} />
                          <AvatarFallback>
                            {form.watch("first_name")?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <Input placeholder="https://example.com/avatar.jpg" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dietary_preferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dietary Preferences</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select dietary preferences" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dietaryPreferences.map((diet) => (
                          <SelectItem key={diet} value={diet}>
                            {diet}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergies</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., nuts, dairy (optional)" {...field} />
                    </FormControl>
                    <FormDescription>
                      List any food allergies, separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="health_goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Health Goal</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select health goal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {healthGoals.map((goal) => (
                          <SelectItem key={goal} value={goal}>
                            {goal}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activity_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activityLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="planning_preference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meal Planning Preference</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select planning preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {planningPreferences.map((pref) => (
                          <SelectItem key={pref} value={pref}>
                            {pref}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="favorite_cuisines"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Favorite Cuisine</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select favorite cuisine" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cuisineTypes.map((cuisine) => (
                          <SelectItem key={cuisine} value={cuisine}>
                            {cuisine}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              Complete Profile
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CompleteProfile;