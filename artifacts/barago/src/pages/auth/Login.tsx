import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginUser, useGetCurrentUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Eye, EyeOff, ArrowRight, Headset, Shield, UserPlus } from "lucide-react";
import { useState } from "react";
import logoPath from "@assets/image_1779289197249.png";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLoginUser();
  const { refetch } = useGetCurrentUser({ query: { enabled: false, queryKey: getGetCurrentUserQueryKey() } });
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync({ data });
      const { data: user } = await refetch();
      toast({ title: "Welcome back!" });
      if (user?.role === "admin") {
        setLocation("/admin");
      } else if (user?.role === "health_worker") {
        setLocation("/health-worker");
      } else {
        setLocation("/dashboard");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Invalid email or password. Please try again.";
      toast({ title: "Login failed", description: msg, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="p-4 flex justify-center items-center bg-white border-b">
        <Link href="/">
          <img src={logoPath} alt="BaraGo Logo" className="h-10 w-auto object-contain" />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-1 mb-7">
                <h1 className="text-2xl font-bold text-slate-900">Welcome Back!</h1>
                <p className="text-sm text-slate-500 text-center">
                  Log in to access your barangay health services.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Email or Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="name@example.com"
                            autoComplete="email"
                            className="h-11 bg-slate-50 border-slate-200"
                            {...field}
                          />
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
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-slate-700 font-medium">Password</FormLabel>
                          <Link href="/forgot-password" className="text-xs font-medium text-[#2563EB] hover:underline">
                            Forgot Password?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              autoComplete="current-password"
                              className="pl-9 pr-10 h-11 bg-slate-50 border-slate-200"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-11 font-semibold bg-[#2563EB] hover:bg-[#2563EB]/90"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Logging in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Log In <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <span className="relative px-3 bg-white text-xs text-slate-400 uppercase">or</span>
              </div>

              <Button
                variant="outline"
                className="w-full h-11 font-semibold border-primary text-primary hover:bg-primary/5"
                asChild
              >
                <Link href="/register">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </Link>
              </Button>

              <div className="mt-6 flex items-start gap-3 text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <Headset className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  Need help? Contact your barangay health center or call the{" "}
                  <a href="tel:911" className="text-destructive font-semibold">emergency hotline</a>{" "}
                  for assistance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-[#2563EB] text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <p className="font-semibold uppercase tracking-wide text-xs">BaraGo Barangay Healthcare Scheduling System</p>
          </div>
          <p className="text-xs opacity-90 italic">"Improving lives. Building healthier communities."</p>
        </div>
      </footer>
    </div>
  );
}
