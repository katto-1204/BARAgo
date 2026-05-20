import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Shield, Clock, HeartPulse, Bell, ArrowRight, UserPlus, LogIn, Phone } from "lucide-react";
import heroImage from "@assets/ChatGPT_Image_May_20,_2026,_12_06_30_AM_(1)_1779287509627.png";

export default function Landing() {
  return (
    <PublicLayout>
      <div className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-20 bg-blue-50/50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                  Welcome to
                </span>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-4">
                  BaraGo
                </h1>
                <p className="text-2xl md:text-3xl font-bold text-primary mb-6">
                  Your Barangay, Your Health, Our Priority.
                </p>
                <p className="text-lg text-muted-foreground mb-10 max-w-lg">
                  BaraGo is your community-focused health portal. We make it easy to schedule checkups, request emergency assistance, and stay updated with your local health center.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link href="/login" className="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-[#2563EB] text-white shadow hover:bg-[#2563EB]/90 h-14 px-8 gap-2">
                    <LogIn className="w-5 h-5" />
                    Log In
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="/register" className="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-14 px-8 gap-2">
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </Link>
                </div>
              </div>
              <div className="relative hidden md:block">
                <img 
                  src={heroImage} 
                  alt="BaraGo Health Center Illustration" 
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-card p-8 rounded-2xl border shadow-sm flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Book Checkups</h3>
                <p className="text-muted-foreground mb-6 flex-1">
                  Schedule your health center appointments online. Save time and avoid long queues.
                </p>
                <Button variant="ghost" className="text-primary font-bold hover:text-primary hover:bg-primary/5 p-0 group" asChild>
                  <Link href="/register">
                    Get Started <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              {/* Feature 2 */}
              <div className="bg-card p-8 rounded-2xl border shadow-sm flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6 text-destructive">
                  <HeartPulse className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Request Ambulance</h3>
                <p className="text-muted-foreground mb-6 flex-1">
                  Immediate emergency response at your fingertips. Get the help you need, fast.
                </p>
                <Button variant="ghost" className="text-primary font-bold hover:text-primary hover:bg-primary/5 p-0 group" asChild>
                  <Link href="/register">
                    Get Started <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              {/* Feature 3 */}
              <div className="bg-card p-8 rounded-2xl border shadow-sm flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#2563EB]/10 rounded-full flex items-center justify-center mb-6 text-[#2563EB]">
                  <Bell className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Get Notified</h3>
                <p className="text-muted-foreground mb-6 flex-1">
                  Stay updated with your appointment status and health center announcements.
                </p>
                <Button variant="ghost" className="text-primary font-bold hover:text-primary hover:bg-primary/5 p-0 group" asChild>
                  <Link href="/register">
                    Get Started <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Banner */}
        <section className="bg-destructive/10 py-12 border-y border-destructive/20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 md:p-10 rounded-3xl border-2 border-destructive shadow-lg">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-destructive rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
                  <Phone className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">
                    Emergency Hotline
                  </h3>
                  <p className="text-muted-foreground">
                    For life-threatening emergencies, contact your emergency hotline immediately.
                  </p>
                </div>
              </div>
              <Button size="lg" className="bg-destructive text-white hover:bg-destructive/90 text-lg font-bold h-14 px-8 rounded-2xl" asChild>
                <a href="tel:911">Call Now (911)</a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
