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
import { User, Lock, Eye, EyeOff, ArrowRight, Headset, Shield } from "lucide-react";
import { useState } from "react";
import logo from "@assets/image_1779205170996.png";
import loginIllustration from "@assets/ChatGPT_Image_May_20,_2026,_12_06_30_AM_(2)_1779287509628.png";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
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
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Header */}
      <header className="p-4 md:p-6 flex justify-center items-center bg-white border-b">
        <div className="flex items-center gap-2">
          <img src={logo} alt="BaraGo Logo" className="h-10 w-10 object-contain" />
          <span className="text-2xl font-bold text-primary">BaraGo</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row items-center justify-center p-4 md:p-8 gap-8 max-w-7xl mx-auto w-full">
        {/* Left Side: Text and Image on Desktop */}
        <div className="hidden md:flex flex-1 flex-col justify-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">Welcome Back!</h1>
            <p className="text-lg text-slate-600">
              Log in to access your barangay health services and stay updated with your healthcare needs.
            </p>
          </div>
          <img 
            src={loginIllustration} 
            alt="Healthcare Illustration" 
            className="w-full max-w-lg rounded-2xl shadow-lg"
          />
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full max-w-md">
          <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="md:hidden mb-6 text-center">
                <h1 className="text-2xl font-bold text-slate-900">Welcome Back!</h1>
                <p className="text-slate-600">Log in to access your account</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Email or Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input 
                              placeholder="name@example.com" 
                              className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary transition-all" 
                              {...field} 
                            />
                          </div>
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
                          <Link href="/forgot-password" title="Forgot Password?" className="text-sm font-medium text-secondary hover:underline">
                            Forgot Password?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              className="pl-10 pr-10 h-12 bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary transition-all" 
                              {...field} 
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-12 text-lg font-semibold bg-secondary hover:bg-secondary/90 shadow-md" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? "Logging in..." : (
                      <span className="flex items-center gap-2">
                        Log In <ArrowRight className="h-5 w-5" />
                      </span>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="relative my-8 text-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <span className="relative px-4 bg-white text-sm text-slate-500 uppercase font-medium">or</span>
              </div>

              <Button variant="outline" className="w-full h-12 text-lg font-semibold border-secondary text-secondary hover:bg-secondary/5" asChild>
                <Link href="/register">
                  <span className="flex items-center gap-2">
                    Create Account <User className="h-5 w-5" />
                  </span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <div className="mt-8 flex items-center gap-3 text-slate-500 bg-white/50 p-4 rounded-xl border border-dashed border-slate-300">
            <Headset className="h-6 w-6 text-slate-400 shrink-0" />
            <p className="text-sm leading-relaxed">
              Need help? Contact your barangay health center or call the emergency hotline for assistance.
            </p>
          </div>
        </div>
      </main>

      {/* Blue Footer Bar */}
      <footer className="mt-auto bg-secondary text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6" />
            <p className="font-semibold uppercase tracking-wide text-sm">BaraGo Barangay Healthcare Scheduling System</p>
          </div>
          <p className="text-sm opacity-90 italic">"Improving lives. Building healthier communities."</p>
        </div>
      </footer>
    </div>
  );
}
