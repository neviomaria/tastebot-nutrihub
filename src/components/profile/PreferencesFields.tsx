import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import {
  ProfileFormValues,
  dietaryPreferences,
  allergies,
  healthGoals,
  activityLevels,
  planningPreferences,
  cuisineTypes,
} from "@/schemas/profile";

interface PreferencesFieldsProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const PreferencesFields = ({ form }: PreferencesFieldsProps) => {
  return (
    <div className="space-y-8">
      {/* Dietary Preferences */}
      <FormField
        control={form.control}
        name="dietary_preferences"
        render={() => (
          <FormItem>
            <FormLabel>Dietary Preferences</FormLabel>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {dietaryPreferences.map((item) => (
                <FormField
                  key={item}
                  control={form.control}
                  name="dietary_preferences"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(item)}
                          onCheckedChange={(checked) => {
                            const value = field.value || [];
                            return checked
                              ? field.onChange([...value, item])
                              : field.onChange(value.filter((i) => i !== item));
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">{item}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Other Dietary Preferences */}
      <FormField
        control={form.control}
        name="other_dietary_preferences"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Other Dietary Preferences</FormLabel>
            <FormControl>
              <Input placeholder="Enter any other dietary preferences" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Allergies */}
      <FormField
        control={form.control}
        name="allergies"
        render={() => (
          <FormItem>
            <FormLabel>Allergies</FormLabel>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {allergies.map((item) => (
                <FormField
                  key={item}
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(item)}
                          onCheckedChange={(checked) => {
                            const value = field.value || [];
                            return checked
                              ? field.onChange([...value, item])
                              : field.onChange(value.filter((i) => i !== item));
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">{item}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Other Allergies */}
      <FormField
        control={form.control}
        name="other_allergies"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Other Allergies</FormLabel>
            <FormControl>
              <Input placeholder="Enter any other allergies" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Health Goals */}
      <FormField
        control={form.control}
        name="health_goal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Health Goals</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid grid-cols-2 gap-4"
              >
                {healthGoals.map((goal) => (
                  <FormItem
                    key={goal}
                    className="flex items-center space-x-3 space-y-0"
                  >
                    <FormControl>
                      <RadioGroupItem value={goal} />
                    </FormControl>
                    <FormLabel className="font-normal">{goal}</FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Activity Level */}
      <FormField
        control={form.control}
        name="activity_level"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Activity Level</FormLabel>
            <FormDescription>
              Select your typical weekly activity level
            </FormDescription>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid gap-4"
              >
                {activityLevels.map((level) => (
                  <FormItem
                    key={level}
                    className="flex items-center space-x-3 space-y-0"
                  >
                    <FormControl>
                      <RadioGroupItem value={level} />
                    </FormControl>
                    <FormLabel className="font-normal">{level}</FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Planning Preferences */}
      <FormField
        control={form.control}
        name="planning_preference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Planning Preferences</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid gap-4"
              >
                {planningPreferences.map((pref) => (
                  <FormItem
                    key={pref}
                    className="flex items-center space-x-3 space-y-0"
                  >
                    <FormControl>
                      <RadioGroupItem value={pref} />
                    </FormControl>
                    <FormLabel className="font-normal">{pref}</FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Favorite Cuisines */}
      <FormField
        control={form.control}
        name="favorite_cuisines"
        render={() => (
          <FormItem>
            <FormLabel>Favorite Cuisines</FormLabel>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {cuisineTypes.map((cuisine) => (
                <FormField
                  key={cuisine}
                  control={form.control}
                  name="favorite_cuisines"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(cuisine)}
                          onCheckedChange={(checked) => {
                            const value = field.value || [];
                            return checked
                              ? field.onChange([...value, cuisine])
                              : field.onChange(value.filter((i) => i !== cuisine));
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">{cuisine}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Other Cuisines */}
      <FormField
        control={form.control}
        name="other_cuisines"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Other Cuisines</FormLabel>
            <FormControl>
              <Input placeholder="Enter any other favorite cuisines" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
