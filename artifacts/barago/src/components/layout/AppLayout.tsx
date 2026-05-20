import { Link, useLocation } from "wouter";
import { ReactNode, ElementType } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Calendar, Truck, Bell, Users, FileText, Clock, LogOut, Menu, Home, User, Shield } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const residentLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/appointments", label: "Appointments", icon: Calendar },
    { href: "/ambulance", label: "Ambulance", icon: Truck },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/appointments", label: "Appointments", icon: Calendar },
    { href: "/admin/ambulance", label: "Ambulance", icon: Truck },
    { href: "/admin/schedules", label: "Schedules", icon: Clock },
    { href: "/admin/residents", label: "Residents", icon: Users },
    { href: "/admin/reports", label: "Reports", icon: FileText },
  ];

  const healthWorkerLinks = [
    { href: "/health-worker", label: "Appointments", icon: Calendar },
  ];

  let links: { href: string; label: string; icon: ElementType }[] = [];
  if (user?.role === "admin") links = adminLinks;
  else if (user?.role === "health_worker") links = healthWorkerLinks;
  else if (user?.role === "resident") links = residentLinks;

  const initials = user?.fullName
    ?.split(" ")
    .map((n: any) => n[0])
    .join("")
    .toUpperCase() || "U";

  const NavLinks = () => (
    <nav className="flex flex-col gap-2 p-4">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = location === link.href || location.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive 
                ? "bg-secondary/10 text-secondary font-medium" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? "text-secondary" : ""}`} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  const getPageTitle = () => {
    if (user?.role === "admin") return "Barangay Health Staff";
    if (user?.role === "health_worker") return "Health Worker";
    return "BaraGo";
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r bg-card">
          <div className="h-16 flex items-center px-6 border-b gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold text-lg">B</div>
            <span className="font-bold text-xl text-primary">BaraGo</span>
          </div>
          <div className="flex-1 overflow-auto">
            <NavLinks />
          </div>
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-4 px-2">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role?.replace("_", " ")}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-start text-destructive" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <header className="md:hidden h-16 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold text-sm">B</div>
              <span className="font-bold text-lg text-primary">{getPageTitle()}</span>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b">
                  <span className="font-bold text-xl text-primary">BaraGo</span>
                </div>
                <div className="flex-1 overflow-auto">
                  <NavLinks />
                </div>
                <div className="p-4 border-t">
                  <Button variant="outline" className="w-full justify-start text-destructive" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </header>

          <main className="flex-1 p-4 md:p-8 overflow-auto pb-24 md:pb-8">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>

          {/* Mobile Bottom Nav */}
          <nav className="md:hidden fixed bottom-16 left-0 right-0 h-16 bg-card border-t flex items-center justify-around px-2 z-20">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href || (link.href !== "/dashboard" && location.startsWith(`${link.href}/`)) || (link.href === "/dashboard" && location === "/");
              return (
                <Link key={link.href} href={link.href} className="flex flex-col items-center gap-1 min-w-[64px]">
                  <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-[10px] ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Blue Footer Bar */}
      <footer className="bg-secondary text-white py-4 px-6 z-30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6" />
            <div>
              <p className="font-semibold text-sm">BaraGo Barangay Healthcare Scheduling System</p>
              <p className="text-xs text-white/80">Improving lives. Building healthier communities.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

