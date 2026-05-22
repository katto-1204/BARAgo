import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginUser, useGetCurrentUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff, ArrowRight, Headset, Shield, UserPlus, LogIn, Heart, Stethoscope, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type AuthErrorModal = {
  title: string;
  description: string;
  details?: string;
};

function getApiErrorData(error: unknown) {
  return error as {
    status?: number;
    message?: string;
    data?: { error?: string; message?: string; details?: string };
    response?: { data?: { error?: string; message?: string; details?: string } };
  };
}

function getLoginError(error: unknown): AuthErrorModal {
  const apiError = getApiErrorData(error);
  const serverMessage =
    apiError.data?.error ||
    apiError.data?.message ||
    apiError.response?.data?.error ||
    apiError.response?.data?.message ||
    apiError.message;

  if (error instanceof TypeError || /failed to fetch|network/i.test(serverMessage ?? "")) {
    return {
      title: "Connection problem",
      description: "The app cannot reach the login server right now.",
      details: "Check that the backend is running and that your internet or local network connection is available.",
    };
  }

  if (apiError.status === 401 && /disabled|banned|blocked/i.test(serverMessage ?? "")) {
    return {
      title: "Account disabled",
      description: "This account is disabled and cannot log in.",
      details: "Contact the barangay administrator to reactivate or review the account.",
    };
  }

  if (apiError.status === 401 || /invalid credentials/i.test(serverMessage ?? "")) {
    return {
      title: "Wrong email or password",
      description: "The email and password combination does not match any active account.",
      details: "Check the spelling of your email and enter the correct password.",
    };
  }

  if (apiError.status === 400) {
    return {
      title: "Missing login details",
      description: "Please enter both your email and password.",
      details: serverMessage,
    };
  }

  return {
    title: "Login unavailable",
    description: "The server could not complete your login request.",
    details: serverMessage || "Please try again, then contact support if the problem continues.",
  };
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLoginUser();
  const { refetch } = useGetCurrentUser({ query: { enabled: false, queryKey: getGetCurrentUserQueryKey() } });
  const [showPassword, setShowPassword] = useState(false);
  const [errorModal, setErrorModal] = useState<AuthErrorModal | null>(null);
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
      const error = getLoginError(err);
      setErrorModal(error);
      toast({ title: error.title, description: error.description, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden font-sans selection:bg-primary/20">
      {/* Dynamic Background Mesh Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-primary/10 via-emerald-500/5 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-teal-400/10 via-blue-500/5 to-transparent blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="h-16 border-b border-border/40 bg-background/60 backdrop-blur-xl flex items-center justify-between px-6 z-10 sticky top-0">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-primary/15 transition-transform group-hover:scale-105 duration-300">
            <Stethoscope className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-primary via-emerald-500 to-teal-400 bg-clip-text text-transparent tracking-tight">
            Bara<span className="text-foreground group-hover:text-primary transition-colors">Go</span>
          </span>
        </Link>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9.5 w-9.5 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted border border-border/30 hover:border-border/80 transition-all duration-300 shadow-sm"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </header>

      <main className="flex-1 flex z-10">
        {/* Left Decorative Panel — hidden on mobile */}
        <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-primary/95 via-emerald-500/90 to-teal-400/95 flex-col justify-between p-16 relative overflow-hidden border-r border-border/10">
          <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-white/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-15%] left-[-10%] w-80 h-80 bg-white/5 rounded-full blur-[80px]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 w-fit shadow-sm">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-[10px] text-white font-extrabold uppercase tracking-wider">Barangay Medical Suite</span>
            </div>
            <h2 className="text-5xl font-black text-white leading-tight tracking-tight mb-4">
              Care at your<br />fingertips.
            </h2>
            <p className="text-white/85 text-lg font-medium leading-relaxed max-w-sm">
              Connecting residents, administrators, and health workers in one unified digital ecosystem.
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="space-y-4">
              {[
                "Book doctor appointments & checkups instantly",
                "Instant request for ambulance dispatches",
                "Stay informed with real-time health notifications",
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 group">
                  <div className="h-9 w-9 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 transition-transform group-hover:scale-105 duration-300 shrink-0 shadow-md">
                    <ArrowRight className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white/95">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-white/15 flex justify-between items-center text-white/80 text-xs">
              <div className="flex items-center gap-1.5 font-semibold">
                <Shield className="h-4 w-4 text-white" /> SECURE ACCESS
              </div>
              <p className="italic">Improving community wellbeing</p>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-[420px] space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Welcome Back</h1>
              <p className="text-sm text-muted-foreground font-medium">
                Log in to securely access your health portal dashboard.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/75 border border-border/40 rounded-3xl p-8 shadow-2xl shadow-primary/5 hover:border-border/60 transition-all duration-500 relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Email or Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="name@example.com"
                            autoComplete="email"
                            className="h-11.5 bg-muted/30 border-border/50 hover:border-border/90 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-medium"
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
                      <FormItem className="space-y-1.5">
                        <div className="flex items-center justify-between mb-0.5">
                          <FormLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Password</FormLabel>
                          <Link href="/forgot-password" className="text-xs font-bold text-primary hover:underline hover:text-emerald-500 transition-colors">
                            Forgot?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              autoComplete="current-password"
                              className="pl-10 pr-10 h-11.5 bg-muted/30 border-border/50 hover:border-border/90 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-medium"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                            >
                              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-11.5 font-bold rounded-2xl bg-gradient-to-r from-primary via-emerald-500 to-teal-400 hover:opacity-95 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 gap-2 text-sm"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Logging you in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" /> Log In to Dashboard
                      </span>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/40" />
                </div>
                <span className="relative px-3.5 bg-card text-[10px] text-muted-foreground uppercase font-black tracking-widest">or</span>
              </div>

              <Button
                variant="outline"
                className="w-full h-11.5 font-bold border-border/60 hover:border-primary hover:text-primary rounded-2xl hover:bg-primary/5 transition-all duration-300 gap-2 text-sm"
                asChild
              >
                <Link href="/register">
                  <UserPlus className="h-4 w-4" />
                  Create Resident Account
                </Link>
              </Button>

              <div className="mt-6 flex items-start gap-3 text-muted-foreground bg-muted/20 hover:bg-muted/40 p-4.5 rounded-2xl border border-border/40 transition-colors duration-300">
                <Headset className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed font-medium">
                  Need assistance? Contact the barangay center or call the{" "}
                  <a href="tel:911" className="text-destructive font-black hover:underline">
                    911 Emergency Hotline
                  </a>{" "}
                  immediately for critical situations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-md py-4.5 px-6 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <p className="font-bold text-xs uppercase tracking-wider">BaraGo Medical Coordination Platform</p>
          </div>
          <p className="text-xs text-muted-foreground/80 font-medium italic">"Improving lives. Building healthier, safer communities together."</p>
        </div>
      </footer>

      <AlertDialog open={!!errorModal} onOpenChange={(open) => !open && setErrorModal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{errorModal?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {errorModal?.description}
              {errorModal?.details && (
                <span className="mt-3 block rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                  {errorModal.details}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorModal(null)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
