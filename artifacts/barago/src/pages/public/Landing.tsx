import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  CalendarCheck, Ambulance, Bell, ArrowRight, UserPlus, LogIn,
  Phone, Shield, CheckCircle, Star, ChevronRight, Stethoscope, Heart
} from "lucide-react";
import logoPath from "@assets/image_1779289197249.png";

const features = [
  {
    icon: CalendarCheck,
    title: "Book Checkups",
    desc: "Schedule appointments with barangay health services and medical professionals at your convenience.",
    color: "from-emerald-500 to-green-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Ambulance,
    title: "Request Ambulance",
    desc: "Request emergency transportation quickly and get the help you need in life-threatening situations.",
    color: "from-red-500 to-rose-400",
    bg: "bg-red-50 dark:bg-red-950/40",
    iconColor: "text-red-600 dark:text-red-400",
  },
  {
    icon: Bell,
    title: "Get Notified",
    desc: "Receive important health announcements, schedule reminders, and updates from your barangay.",
    color: "from-blue-500 to-indigo-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
];

const stats = [
  { value: "100+", label: "Barangays Covered", icon: Shield },
  { value: "24/7", label: "Emergency Support", icon: Heart },
  { value: "5k+", label: "Residents Served", icon: Star },
];

export default function Landing() {
  return (
    <PublicLayout>
      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-28">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-blue-50 dark:from-emerald-950/30 dark:via-background dark:to-blue-950/30" />
          {/* Decorative blobs */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-100/40 dark:bg-emerald-900/20 rounded-full blur-3xl" />

          <div className="container relative mx-auto px-4 max-w-4xl flex flex-col items-center text-center gap-8">
            <div className="flex flex-col items-center gap-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
                <Stethoscope className="h-4 w-4" />
                Barangay Health Services — Davao City
              </div>

              <div className="flex items-center justify-center gap-3 mb-2">
                <img src={logoPath} alt="BaraGo Logo" className="h-20 w-auto drop-shadow-md" />
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                Bara<span className="text-primary">Go</span>
              </h1>

              <p className="text-2xl md:text-3xl font-bold text-foreground/80">
                Your Barangay, Your Health,{" "}
                <span className="text-secondary">Our Priority.</span>
              </p>
            </div>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Book checkups, request ambulance assistance, and receive important health updates — all in one place, right from your device.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-13 px-8 text-base font-semibold rounded-xl border-2 gap-2 hover:bg-secondary/5 hover:border-secondary hover:text-secondary transition-all">
                  <LogIn className="w-5 h-5" />
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto h-13 px-8 text-base font-semibold rounded-xl gap-2 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-400 shadow-lg shadow-primary/30 transition-all">
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </Button>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-8 pt-4">
              {stats.map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-extrabold text-foreground">{value}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-foreground mb-3">What BaraGo Offers</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                A complete digital health platform built specifically for Davao City barangay residents.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {features.map(({ icon: Icon, title, desc, bg, iconColor }) => (
                <div
                  key={title}
                  className={`${bg} p-8 rounded-2xl border border-border/60 hover-lift flex flex-col items-center text-center group`}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-white dark:bg-card shadow-sm flex items-center justify-center mb-5 ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">{desc}</p>
                  <Button variant="ghost" className="mt-5 text-primary font-bold hover:text-primary hover:bg-primary/5 p-0 group/btn" asChild>
                    <Link href="/register" className="flex items-center gap-1">
                      Get Started
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h2 className="text-2xl font-extrabold mb-3 text-foreground">Trusted by Barangay Communities</h2>
                  <div className="space-y-3">
                    {[
                      "HIPAA-ready privacy practices for all patient data",
                      "Real-time appointment status and notifications",
                      "Secure ambulance dispatch with location tracking",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2.5">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/register">
                    <Button className="mt-6 rounded-xl gap-2 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-400 shadow-sm">
                      Join BaraGo Today <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="hidden md:flex flex-col items-center justify-center w-56 h-56 bg-gradient-to-br from-primary/10 to-emerald-100 dark:from-primary/20 dark:to-emerald-900/30 rounded-3xl border border-primary/20">
                  <Heart className="h-24 w-24 text-primary/40" />
                  <span className="text-xs font-bold text-primary/60 tracking-widest uppercase mt-2">BaraGo Health</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Banner */}
        <section className="py-10 bg-destructive/5 border-y border-destructive/15">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 bg-card p-6 rounded-2xl border-2 border-destructive/50 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-destructive to-red-400 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md">
                  <Phone className="w-7 h-7 animate-pulse" />
                </div>
                <div>
                  <p className="font-bold text-destructive text-lg">For life-threatening emergencies,</p>
                  <p className="text-muted-foreground text-sm">contact your emergency hotline immediately.</p>
                </div>
              </div>
              <Button size="lg" className="bg-destructive text-white hover:bg-destructive/90 font-bold h-12 px-6 rounded-xl shrink-0 shadow-sm" asChild>
                <a href="tel:911">Call Now (911)</a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
