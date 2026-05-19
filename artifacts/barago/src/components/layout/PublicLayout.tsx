import { Link } from "wouter";
import { ReactNode } from "react";
import logoPath from "@assets/image_1779205170996.png";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img 
              src={logoPath} 
              alt="BaraGo Logo" 
              className="h-8 w-8 object-contain"
              style={{ filter: "invert(40%) sepia(85%) saturate(350%) hue-rotate(95deg) brightness(95%) contrast(90%)" }}
            />
            <span className="font-bold text-xl text-primary">BaraGo</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Login
            </Link>
            <Link href="/register" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
              Register
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="border-t bg-card py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} BaraGo. Barangay health services, ready to go.
        </div>
      </footer>
    </div>
  );
}
