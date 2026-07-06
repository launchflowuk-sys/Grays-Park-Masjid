import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useLogin, getGetCurrentAdminQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import gpmLogo from "@/assets/GPM_Logo_1783358587809.png";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Please enter your password"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useLogin({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getGetCurrentAdminQueryKey() });
        setLocation("/admin");
      },
      onError: (error: unknown) => {
        toast({
          title: "Login failed",
          description: error instanceof Error ? error.message : "Invalid email or password.",
          variant: "destructive",
        });
      },
    },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/admin");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  function onSubmit(values: LoginForm) {
    mutation.mutate({ data: values });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-6">
      <Card className="w-full max-w-md border-card-border">
        <CardHeader className="text-center">
          <img
            src={gpmLogo}
            alt="Grays Park Masjid"
            className="h-12 w-auto mx-auto mb-2"
            data-testid="img-admin-login-logo"
          />
          <CardTitle className="font-serif text-2xl">Admin Login</CardTitle>
          <CardDescription>Grays Park Masjid content management</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@graysparkmasjid.org" autoComplete="username" data-testid="input-admin-email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" autoComplete="current-password" data-testid="input-admin-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-admin-login">
                {mutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
