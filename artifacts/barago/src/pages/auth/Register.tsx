import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegisterUser } from "@workspace/api-client-react";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Mail, Lock, Eye, EyeOff, Calendar, Phone, MapPin, Shield, User, Check, ChevronsUpDown, ArrowRight, HeartPulse, Stethoscope, Sparkles, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { DAVAO_BARANGAYS } from "@/lib/barangays";
import { useTheme } from "next-themes";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  birthdate: z.string().min(1, "Birthdate is required"),
  gender: z.string().min(1, "Gender is required"),
  address: z.string().min(1, "Address is required"),
  barangay: z.string().min(1, "Barangay is required"),
  contactNumber: z.string().min(7, "Contact number is required"),
  terms: z.boolean().refine((v) => v === true, "You must agree to the terms"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

type RegisterErrorModal = {
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

function getRegisterError(error: unknown): RegisterErrorModal {
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
      description: "The app cannot reach the registration server right now.",
      details: "Check that the backend is running and that your internet or local network connection is available.",
    };
  }

  if (/email already registered/i.test(serverMessage ?? "")) {
    return {
      title: "Email already registered",
      description: "An account already exists with this email address.",
      details: "Use the login page instead, or register with a different email address.",
    };
  }

  if (apiError.status === 400) {
    return {
      title: "Registration details need correction",
      description: "Some required information is missing or invalid.",
      details: serverMessage,
    };
  }

  return {
    title: "Registration unavailable",
    description: "The server could not create your account.",
    details: serverMessage || "Please try again, then contact support if the problem continues.",
  };
}

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = useRegisterUser();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [age, setAge] = useState<number | null>(null);
  const [errorModal, setErrorModal] = useState<RegisterErrorModal | null>(null);
  const { theme, setTheme } = useTheme();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      birthdate: "",
      gender: "",
      address: "",
      barangay: "",
      contactNumber: "",
      terms: false,
    },
  });

  const birthdate = form.watch("birthdate");

  useEffect(() => {
    if (birthdate) {
      const birth = new Date(birthdate);
      const today = new Date();
      let a = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) a--;
      setAge(a >= 0 ? a : 0);
    } else {
      setAge(null);
    }
  }, [birthdate]);

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync({
        data: {
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          birthdate: values.birthdate,
          age: age ?? undefined,
          gender: values.gender,
          address: `${values.address}, ${values.barangay}`,
          purok: "N/A",
          contactNumber: values.contactNumber,
        },
      });
      toast({ title: "Account created!", description: "Please log in to continue." });
      setLocation("/login");
    } catch (err: unknown) {
      const error = getRegisterError(err);
      setErrorModal(error);
      toast({ title: error.title, description: error.description, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden font-sans selection:bg-primary/20">
      <div className="absolute top-[-18%] left-[-12%] w-[48%] h-[48%] rounded-full bg-gradient-to-tr from-primary/10 via-emerald-500/5 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-teal-400/10 via-blue-500/5 to-transparent blur-[120px] pointer-events-none" />

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
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9.5 w-9.5 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted border border-border/30 hover:border-border/80 transition-all duration-300 shadow-sm"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </header>

      <main className="flex-1 flex z-10">
        <div className="hidden xl:flex w-[38%] bg-gradient-to-br from-primary/95 via-emerald-500/90 to-teal-400/95 flex-col justify-between p-12 2xl:p-16 relative overflow-hidden border-r border-border/10">
          <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-white/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-15%] left-[-10%] w-80 h-80 bg-white/5 rounded-full blur-[80px]" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 w-fit shadow-sm">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-[10px] text-white font-extrabold uppercase tracking-wider">Resident Enrollment</span>
            </div>
            <h2 className="text-5xl font-black text-white leading-tight tracking-tight mb-4">
              Start your<br />care journey.
            </h2>
            <p className="text-white/85 text-lg font-medium leading-relaxed max-w-sm">
              Create a secure resident profile for appointments, ambulance requests, and barangay health updates.
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            {[
              "Submit complete resident details once",
              "Book checkups with barangay health schedules",
              "Receive updates from the healthcare team",
            ].map((item) => (
              <div key={item} className="flex items-center gap-4">
                <div className="h-9 w-9 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0 shadow-md">
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-white/95">{item}</span>
              </div>
            ))}
            <div className="pt-8 border-t border-white/15 flex justify-between items-center text-white/80 text-xs">
              <div className="flex items-center gap-1.5 font-semibold">
                <Shield className="h-4 w-4 text-white" /> SECURE REGISTRATION
              </div>
              <p className="italic">Healthier communities</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
          <div className="w-full max-w-3xl space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                <HeartPulse className="h-3.5 w-3.5" />
                Resident Portal
              </div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Create Account</h1>
              <p className="text-sm text-muted-foreground font-medium">
                Register as a barangay resident to access healthcare scheduling and emergency assistance.
              </p>
            </div>

            <Card className="backdrop-blur-xl bg-card/75 border border-border/40 rounded-3xl shadow-2xl shadow-primary/5 overflow-hidden">
            <CardContent className="p-6 sm:p-8">

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                            <Input placeholder="Juan Dela Cruz" autoComplete="name" className="pl-10 h-11.5 bg-muted/30 border-border/50 hover:border-border/90 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-medium" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="birthdate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Birthdate</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                              <Input type="date" className="pl-10 h-11.5 bg-muted/30 border-border/50 hover:border-border/90 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-medium" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Age
                      </label>
                      <Input
                        type="number"
                        value={age ?? ""}
                        readOnly
                        placeholder="Auto-calculated"
                        className="h-11.5 bg-muted/50 border-border/50 cursor-not-allowed rounded-2xl text-muted-foreground font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11.5 bg-muted/30 border-border/50 hover:border-border/90 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all duration-300">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Contact Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                              <Input placeholder="09123456789" autoComplete="tel" className="pl-10 h-11.5 bg-muted/30 border-border/50 hover:border-border/90 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-medium" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="barangay"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Barangay (Davao City)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full h-11.5 justify-between bg-muted/30 border-border/50 hover:border-border/90 rounded-2xl font-medium",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? DAVAO_BARANGAYS.find((b) => b === field.value)
                                  : "Select your barangay..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0 max-h-[300px] overflow-y-auto">
                            <Command>
                              <CommandInput placeholder="Search barangay..." />
                              <CommandList>
                                <CommandEmpty>No barangay found.</CommandEmpty>
                                <CommandGroup>
                                  {DAVAO_BARANGAYS.map((b) => (
                                    <CommandItem
                                      value={b}
                                      key={b}
                                      onSelect={() => {
                                        form.setValue("barangay", b);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          b === field.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {b}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Street Address / House No.</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                            <Input placeholder="123 Rizal St, Purok 4" autoComplete="street-address" className="pl-10 h-11.5 bg-muted/30 border-border/50 hover:border-border/90 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-medium" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                            <Input type="email" placeholder="juan@example.com" autoComplete="email" className="pl-10 h-11.5 bg-muted/30 border-border/50 hover:border-border/90 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-medium" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Min 6 characters"
                                autoComplete="new-password"
                                className="pl-10 pr-10 h-11.5 bg-muted/30 border-border/50 hover:border-border/90 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-medium"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Repeat password"
                                autoComplete="new-password"
                                className="pl-10 pr-10 h-11.5 bg-muted/30 border-border/50 hover:border-border/90 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-medium"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-2xl border border-border/40 bg-muted/20 p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm text-muted-foreground font-medium cursor-pointer leading-relaxed">
                            I agree to the{" "}
                            <Link href="/terms" className="text-[#2563EB] hover:underline font-medium">Terms and Conditions</Link>
                            {" "}and{" "}
                            <Link href="/privacy" className="text-[#2563EB] hover:underline font-medium">Privacy Policy</Link>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-11.5 font-bold rounded-2xl bg-gradient-to-r from-primary via-emerald-500 to-teal-400 hover:opacity-95 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 gap-2 text-sm"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating account...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" /> Create Resident Account
                      </span>
                    )}
                  </Button>
                </form>
              </Form>

              <p className="mt-6 text-center text-sm text-muted-foreground font-medium">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-primary hover:underline">
                  Log In
                </Link>
              </p>
            </CardContent>
          </Card>
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
