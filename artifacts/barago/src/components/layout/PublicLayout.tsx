import { Link } from "wouter";
import { ReactNode } from "react";
import logoPath from "@assets/image_1779289197249.png";
import { Shield } from "lucide-react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src={logoPath} alt="BaraGo Logo" className="h-9 w-auto object-contain" />
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium border border-primary text-primary px-4 py-2 rounded-md hover:bg-primary/5">
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
      <footer className="bg-[#2563EB] py-6">
        <div className="container mx-auto px-4 flex flex-col items-center text-center text-white">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">BaraGo Barangay Healthcare Scheduling System</span>
          </div>
          <p className="text-sm opacity-90">Improving lives. Building healthier communities.</p>
          <div className="mt-4 text-xs opacity-75">
            &copy; {new Date().getFullYear()} BaraGo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
