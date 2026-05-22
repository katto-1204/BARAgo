import { Link, useLocation } from "wouter";
import { ReactNode, ElementType } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Calendar, Truck, Bell, Users, FileText,
  Clock, LogOut, Menu, Home, User, Shield, Sun, Moon, Search
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";

type NavLink = { href: string; label: string; icon: ElementType };

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  const residentLinks: NavLink[] = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/appointments", label: "Appointments", icon: Calendar },
    { href: "/ambulance", label: "Ambulance", icon: Truck },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const adminLinks: NavLink[] = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/appointments", label: "Appointments", icon: Calendar },
    { href: "/admin/ambulance", label: "Ambulance", icon: Truck },
    { href: "/admin/schedules", label: "Schedules", icon: Clock },
    { href: "/admin/residents", label: "Residents", icon: Users },
    { href: "/admin/reports", label: "Reports", icon: FileText },
  ];

  const healthWorkerLinks: NavLink[] = [
    { href: "/health-worker", label: "Appointments", icon: Calendar },
    { href: "/health-worker/profile", label: "My Profile", icon: User },
  ];

  let links: NavLink[] = [];
  if (user?.role === "admin") links = adminLinks;
  else if (user?.role === "health_worker") links = healthWorkerLinks;
  else links = residentLinks;

  // ─── FIX: longest-match wins — prevents /admin matching /admin/reports ────
  const getActiveLink = () => {
    return links.reduce<NavLink | null>((best, link) => {
      const matches = location === link.href || location.startsWith(link.href + "/");
      if (!matches) return best;
      if (!best || link.href.length > best.href.length) return link;
      return best;
    }, null);
  };
  const activeLink = getActiveLink();
  // ─────────────────────────────────────────────────────────────────────────

  const initials = user?.fullName
    ?.split(" ")
    .map((n: any) => n[0])
    .join("")
    .toUpperCase() || "U";

  const sectionLabel =
    user?.role === "admin" ? "ADMINISTRATION" :
    user?.role === "health_worker" ? "HEALTH TEAM" : "MY PORTAL";

  const NavContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 gap-3 border-b border-white/10">
        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-primary/40">
          B
        </div>
        <span className="font-extrabold text-xl text-white tracking-tight">BaraGo</span>
      </div>

      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search here..."
            className="pl-9 h-9 bg-white/10 border-white/10 text-white placeholder:text-white/40 rounded-xl text-sm focus:bg-white/15 focus:border-white/20"
          />
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3 px-3">
        <p className="text-[10px] font-bold tracking-widest text-white/35 px-3 pb-2 uppercase">{sectionLabel}</p>
        <nav className="flex flex-col gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = activeLink?.href === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9 border-2 border-primary/40">
            <AvatarFallback className="bg-primary/20 text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate text-white">{user?.fullName}</p>
            <p className="text-xs text-white/50 capitalize">{user?.role?.replace("_", " ")}</p>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-muted/30 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-gray-900 dark:bg-gray-950 z-20 shrink-0">
        <NavContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-14 border-b border-border/60 bg-card/95 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-extrabold">
              B
            </div>
            <span className="font-extrabold text-base text-foreground tracking-tight">BaraGo</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-gray-900 dark:bg-gray-950 border-r-0">
                <NavContent />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="hidden lg:block bg-card border-t border-border/60 py-3 px-8">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold text-muted-foreground">BaraGo Barangay Healthcare Scheduling System</p>
              </div>
              <p className="text-xs text-muted-foreground">Improving lives. Building healthier communities.</p>
            </div>
          </footer>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-gray-900 border-t border-white/10 flex items-center justify-around px-2 z-40">
        {links.slice(0, 5).map((link) => {
          const Icon = link.icon;
          const isActive = activeLink?.href === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 min-w-[52px] py-1 px-2 rounded-xl transition-all duration-200`}
            >
              <div className={`p-1.5 rounded-lg transition-all ${isActive ? "bg-primary" : ""}`}>
                <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-white/50"}`} />
              </div>
              <span className={`text-[10px] font-semibold ${isActive ? "text-primary" : "text-white/50"}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
