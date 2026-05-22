import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginUser, useGetCurrentUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff, ArrowRight, Headset, Shield, UserPlus, LogIn, Heart } from "lucide-react";
import { useState } from "react";
import logoPath from "@assets/image_1779289197249.png";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

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
  const { theme, setTheme } = useTheme();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync({ data });
      const { data: user } = await refetch();
      toast({ title: "Welcome back!" });
      if (user?.role === "admin") setLocation("/admin");
      else if (user?.role === "health_worker") setLocation("/health-worker");
      else setLocation("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Invalid email or password. Please try again.";
      toast({ title: "Login failed", description: msg, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border/60 bg-card/80 backdrop-blur-md flex items-center justify-between px-6">
        <Link href="/">
          <img src={logoPath} alt="BaraGo Logo" className="h-9 w-auto object-contain" />
        </Link>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </header>

      <main className="flex-1 flex">
        {/* Left Decorative Panel — hidden on mobile */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary via-emerald-500 to-teal-400 flex-col items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10 text-center text-white">
            <Heart className="h-20 w-20 mx-auto mb-6 opacity-90" />
            <h2 className="text-4xl font-extrabold mb-4 tracking-tight">BaraGo</h2>
            <p className="text-xl font-medium text-white/90 max-w-xs leading-relaxed">
              Your trusted barangay health companion.
            </p>
            <div className="mt-8 space-y-3 text-left">
              {["Book health checkups instantly", "Emergency ambulance dispatch", "Real-time health notifications"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowRight className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm text-white/90">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="flex flex-col items-center gap-1 mb-8 text-center">
              <div className="lg:hidden mb-3">
                <img src={logoPath} alt="BaraGo Logo" className="h-14 w-auto object-contain mx-auto" />
              </div>
              <h1 className="text-2xl font-extrabold text-foreground">Welcome Back</h1>
              <p className="text-sm text-muted-foreground">
                Log in to access your barangay health services.
              </p>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-8 shadow-sm">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Email or Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="name@example.com"
                            autoComplete="email"
                            className="h-11 bg-muted/50 border-border/80 rounded-xl focus:ring-2 focus:ring-primary/20"
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
                        <div className="flex items-center justify-between mb-1">
                          <FormLabel className="font-semibold">Password</FormLabel>
                          <Link href="/forgot-password" className="text-xs font-semibold text-secondary hover:underline">
                            Forgot Password?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              autoComplete="current-password"
                              className="pl-9 pr-10 h-11 bg-muted/50 border-border/80 rounded-xl focus:ring-2 focus:ring-primary/20"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                    className="w-full h-11 font-semibold rounded-xl bg-gradient-to-r from-secondary to-blue-500 hover:from-secondary/90 hover:to-blue-400 shadow-sm gap-2"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Logging in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" /> Log In
                      </span>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/60" />
                </div>
                <span className="relative px-3 bg-card text-xs text-muted-foreground uppercase font-medium">or</span>
              </div>

              <Button
                variant="outline"
                className="w-full h-11 font-semibold border-border/80 rounded-xl hover:bg-primary/5 hover:border-primary hover:text-primary gap-2"
                asChild
              >
                <Link href="/register">
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </Link>
              </Button>

              <div className="mt-5 flex items-start gap-3 text-muted-foreground bg-muted/50 p-3 rounded-xl border border-border/60">
                <Headset className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  Need help? Contact your barangay health center or call the{" "}
                  <a href="tel:911" className="text-destructive font-semibold hover:underline">
                    emergency hotline
                  </a>{" "}
                  for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gradient-to-r from-primary to-emerald-500 text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 opacity-80" />
            <p className="font-semibold text-xs uppercase tracking-wide">BaraGo Barangay Healthcare Scheduling System</p>
          </div>
          <p className="text-xs opacity-80 italic">"Improving lives. Building healthier communities."</p>
        </div>
      </footer>
    </div>
  );
}
