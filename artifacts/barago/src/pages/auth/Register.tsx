import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegisterUser } from "@workspace/api-client-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Mail, Lock, Eye, EyeOff, Calendar, Phone, MapPin, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { DAVAO_BARANGAYS } from "@/lib/barangays";
import logo from "@assets/image_1779205170996.png";
import registerIllustration from "@assets/ChatGPT_Image_May_20,_2026,_12_06_31_AM_(3)_1779287509629.png";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
  birthdate: z.string().min(1, "Birthdate is required"),
  gender: z.string().min(1, "Gender is required"),
  address: z.string().min(1, "Address is required"),
  purok: z.string().min(1, "Purok is required"),
  barangay: z.string().min(1, "Barangay is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  terms: z.boolean().refine(v => v === true, "You must agree to the terms"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = useRegisterUser();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [age, setAge] = useState<number | null>(null);

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
      purok: "",
      barangay: "",
      contactNumber: "",
      terms: false,
    },
  });

  const birthdate = form.watch("birthdate");

  useEffect(() => {
    if (birthdate) {
      const birthDate = new Date(birthdate);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge >= 0 ? calculatedAge : 0);
    } else {
      setAge(null);
    }
  }, [birthdate]);

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      // Map barangay + address for API
      const apiData = {
        ...values,
        address: `${values.address}, ${values.barangay}`,
      };
      await registerMutation.mutateAsync({ data: apiData });
      toast({ title: "Registration successful", description: "Please login to continue." });
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please check your information and try again.",
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

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-8 items-start w-full">
          {/* Left Side: Text and Image */}
          <div className="hidden md:flex flex-col gap-6 pt-10">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-slate-900">Create Account</h1>
              <p className="text-lg text-slate-600">
                Join BaraGo to easily book appointments, request emergency assistance, and stay informed about your community's health.
              </p>
            </div>
            <img 
              src={registerIllustration} 
              alt="Registration Illustration" 
              className="w-full max-w-lg rounded-2xl shadow-lg"
            />
          </div>

          {/* Right Side: Registration Form */}
          <div className="w-full">
            <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="md:hidden mb-6 text-center">
                  <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
                  <p className="text-slate-600">Register as a resident</p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                              <Input placeholder="Juan Dela Cruz" className="pl-10 bg-slate-50 border-slate-200" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="birthdate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Birthdate</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input type="date" className="pl-10 bg-slate-50 border-slate-200" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Age</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <Input 
                            type="number" 
                            value={age ?? ""} 
                            readOnly 
                            placeholder="Auto-calculated" 
                            className="pl-10 bg-slate-100 border-slate-200 cursor-not-allowed" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-50 border-slate-200">
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
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input placeholder="Street, House No." className="pl-10 bg-slate-50 border-slate-200" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="barangay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Barangay</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-50 border-slate-200">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-[300px]">
                                {DAVAO_BARANGAYS.map((b) => (
                                  <SelectItem key={b} value={b}>{b}</SelectItem>
                                ))}
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
                            <FormLabel className="font-medium">Contact Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input placeholder="09123456789" className="pl-10 bg-slate-50 border-slate-200" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                              <Input type="email" placeholder="juan@example.com" className="pl-10 bg-slate-50 border-slate-200" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input 
                                  type={showPassword ? "text" : "password"} 
                                  placeholder="••••••••" 
                                  className="pl-10 bg-slate-50 border-slate-200" 
                                  {...field} 
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
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
                            <FormLabel className="font-medium">Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input 
                                  type={showConfirmPassword ? "text" : "password"} 
                                  placeholder="••••••••" 
                                  className="pl-10 bg-slate-50 border-slate-200" 
                                  {...field} 
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
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
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-1">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm text-slate-600">
                              I agree to the <Link href="/terms" className="text-secondary hover:underline">Terms and Conditions</Link> and <Link href="/privacy" className="text-secondary hover:underline">Privacy Policy</Link>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 mt-2 shadow-md" disabled={registerMutation.isPending}>
                      {registerMutation.isPending ? "Registering..." : "Create Account"}
                    </Button>
                  </form>
                </Form>

                <p className="mt-6 text-center text-slate-600">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-secondary hover:underline">
                    Log In
                  </Link>
                </p>
              </CardContent>
            </Card>
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
