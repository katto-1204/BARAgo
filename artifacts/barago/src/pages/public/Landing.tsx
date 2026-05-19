import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Shield, Clock, HeartPulse } from "lucide-react";

export default function Landing() {
  return (
    <PublicLayout>
      <div className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-primary/5">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              Barangay health services, <span className="text-primary">ready to go.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10">
              BaraGo is your trusted community portal for scheduling checkups, requesting emergency assistance, and staying connected with your local health center.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 px-8">
                Create an Account
              </Link>
              <Link href="/login" className="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-12 px-8">
                Login to Portal
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg border shadow-sm text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Scheduling</h3>
                <p className="text-muted-foreground">Book health center checkups at your convenience without waiting in long lines.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm text-center">
                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4 text-destructive">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Emergency Response</h3>
                <p className="text-muted-foreground">Request an ambulance instantly with exact location details for rapid dispatch.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-secondary">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Records</h3>
                <p className="text-muted-foreground">Your health requests and appointment history are kept private and secure.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
