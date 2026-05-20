import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CalendarCheck, Ambulance, Bell, ArrowRight, UserPlus, LogIn, Phone } from "lucide-react";
import logoPath from "@assets/image_1779289197249.png";

export default function Landing() {
  return (
    <PublicLayout>
      <div className="flex-1">
        {/* Hero Section */}
        <section className="py-14 md:py-24 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4 max-w-3xl flex flex-col items-center text-center gap-6">
            <img src={logoPath} alt="BaraGo Logo" className="h-20 w-auto" />
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-3">
                Welcome to
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">BaraGo</h1>
              <p className="text-2xl md:text-3xl font-bold text-primary mt-3">
                Your Barangay, Your Health, <span className="text-[#2563EB]">Our Priority.</span>
              </p>
            </div>
            <p className="text-lg text-muted-foreground max-w-xl">
              Book checkups, request ambulance assistance, and receive important health updates — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md text-base font-semibold bg-[#2563EB] text-white shadow hover:bg-[#2563EB]/90 h-14 px-8 transition-colors"
              >
                <LogIn className="w-5 h-5" />
                Log In
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md text-base font-semibold bg-primary text-primary-foreground shadow hover:bg-primary/90 h-14 px-8 transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                Create Account
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-card p-8 rounded-2xl border shadow-sm flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-5 text-primary">
                  <CalendarCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Book Checkups</h3>
                <p className="text-muted-foreground mb-5 flex-1 text-sm">
                  Schedule appointments with barangay health services and medical professionals.
                </p>
                <Button variant="ghost" className="text-primary font-bold hover:text-primary hover:bg-primary/5 p-0 group" asChild>
                  <Link href="/register">
                    Get Started <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              <div className="bg-card p-8 rounded-2xl border shadow-sm flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-5 text-destructive">
                  <Ambulance className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Request Ambulance</h3>
                <p className="text-muted-foreground mb-5 flex-1 text-sm">
                  Request emergency transportation quickly and get the help you need.
                </p>
                <Button variant="ghost" className="text-primary font-bold hover:text-primary hover:bg-primary/5 p-0 group" asChild>
                  <Link href="/register">
                    Get Started <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              <div className="bg-card p-8 rounded-2xl border shadow-sm flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#2563EB]/10 rounded-full flex items-center justify-center mb-5 text-[#2563EB]">
                  <Bell className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Get Notified</h3>
                <p className="text-muted-foreground mb-5 flex-1 text-sm">
                  Receive important health announcements, schedule reminders, and updates from your barangay.
                </p>
                <Button variant="ghost" className="text-primary font-bold hover:text-primary hover:bg-primary/5 p-0 group" asChild>
                  <Link href="/register">
                    Get Started <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Banner */}
        <section className="bg-destructive/5 py-10 border-y border-destructive/20">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 bg-white p-6 rounded-2xl border-2 border-destructive shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-destructive rounded-xl flex items-center justify-center text-white shrink-0">
                  <Phone className="w-7 h-7 animate-pulse" />
                </div>
                <div>
                  <p className="font-bold text-destructive text-lg">For life-threatening emergencies,</p>
                  <p className="text-muted-foreground text-sm">contact your emergency hotline immediately.</p>
                </div>
              </div>
              <Button size="lg" className="bg-destructive text-white hover:bg-destructive/90 font-bold h-12 px-6 rounded-xl shrink-0" asChild>
                <a href="tel:911">Call Now (911)</a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
