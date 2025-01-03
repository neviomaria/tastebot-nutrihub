import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { CouponField } from "@/components/form/CouponField";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  coupon_code: z.string().optional(),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export const SignUpCouponForm = () => {
  const { toast } = useToast();
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      coupon_code: "",
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    try {
      console.log('Signing up user:', values);

      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (error) {
        console.error('Sign up error:', error);
        toast({
          title: "Error",
          description: "Failed to sign up. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Sign up response:', data);

      toast({
        title: "Success",
        description: "Account created successfully! Please check your email to confirm your account.",
      });

      // Clear the form after successful sign-up
      form.reset();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            className="mt-1 block w-full"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <Input
            id="password"
            type="password"
            {...form.register("password")}
            className="mt-1 block w-full"
          />
        </div>

        <CouponField form={form} />

        <Button type="submit" className="w-full">Sign Up</Button>
      </form>
    </Form>
  );
};
