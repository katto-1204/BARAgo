import { Link, useLocation } from "wouter";
import { ReactNode, ElementType } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Calendar, Truck, Bell, Users, FileText, Clock, LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const residentLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/appointments", label: "Appointments", icon: Calendar },
    { href: "/ambulance", label: "Ambulance", icon: Truck },
    { href: "/notifications", label: "Notifications", icon: Bell },
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
                ? "bg-primary/10 text-primary font-medium" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-[100dvh] flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b">
          <span className="font-bold text-xl text-primary">BaraGo</span>
        </div>
        <div className="flex-1 overflow-auto">
          <NavLinks />
        </div>
        <div className="p-4 border-t">
          <div className="mb-4 px-2">
            <p className="text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role?.replace("_", " ")}</p>
          </div>
          <Button variant="outline" className="w-full justify-start text-destructive" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-10">
          <span className="font-bold text-xl text-primary">BaraGo</span>
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

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
