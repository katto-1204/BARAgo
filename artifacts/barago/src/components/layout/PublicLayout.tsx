import { Link } from "wouter";
import { useLocation } from "wouter";
import { ReactNode } from "react";
import { BookOpen, Shield, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  const showManualButton = location !== "/user-manual";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-extrabold text-xl tracking-tight text-foreground">
              Bara<span className="text-primary">Go</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mr-1"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link
              href="/login"
              className="text-sm font-semibold border border-border text-foreground px-4 py-2 rounded-xl hover:bg-muted transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      {showManualButton && (
        <Link
          href="/user-manual"
          className="fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-card/95 px-4 py-3 text-sm font-bold text-primary shadow-lg shadow-primary/10 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground"
        >
          <BookOpen className="h-4 w-4" />
          User Manual
        </Link>
      )}
      <footer className="bg-gradient-to-r from-primary to-emerald-500 py-8">
        <div className="container mx-auto px-4 flex flex-col items-center text-center text-white gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 opacity-80" />
            <span className="font-bold tracking-wide">BaraGo Barangay Healthcare Scheduling System</span>
          </div>
          <p className="text-sm opacity-80 italic">Improving lives. Building healthier communities.</p>
          <div className="text-xs opacity-60 mt-1">
            &copy; {new Date().getFullYear()} BaraGo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
