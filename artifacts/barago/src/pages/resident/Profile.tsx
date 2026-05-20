import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { findNearestHospitals } from "@/lib/nearestHospital";
import { MapPin, Phone, Mail, Calendar, User, HeartPulse, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { user, logout } = useAuth();
  
  const nearestHospitals = user?.resident?.purok 
    ? findNearestHospitals(user.resident.purok)
    : [];

  const initials = user?.fullName
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        <header>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Your personal information and health preferences.</p>
        </header>

        <Card className="overflow-hidden border-t-4 border-t-primary">
          <CardHeader className="flex flex-row items-center gap-6 bg-muted/30 pb-8">
            <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-3xl">{user?.fullName}</CardTitle>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold capitalize tracking-wide">
                  {user?.role?.replace("_", " ")}
                </span>
                <span className="text-sm text-muted-foreground">Resident ID: BG-{String(user?.id).padStart(6, '0')}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-8 md:grid-cols-2 p-8">
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact Information</h3>
              <div className="grid gap-4">
                <div className="flex items-center gap-4 group">
                  <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Email Address</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Contact Number</p>
                    <p className="font-medium">{user?.resident?.contactNumber || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Complete Address</p>
                    <p className="font-medium">
                      {user?.resident?.address}, {user?.resident?.purok}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Personal Details</h3>
              <div className="grid gap-4">
                <div className="flex items-center gap-4 group">
                  <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Birthdate</p>
                    <p className="font-medium">{user?.resident?.birthdate ? new Date(user.resident.birthdate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Gender</p>
                    <p className="font-medium capitalize">{user?.resident?.gender || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="p-8 bg-muted/30 border-t flex justify-between items-center">
            <p className="text-sm text-muted-foreground italic">You can update your profile information at the Barangay Health Center.</p>
            <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-white" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </Card>

        {nearestHospitals.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <HeartPulse className="h-6 w-6 text-destructive" />
                Nearest Healthcare Facilities
              </h2>
              <span className="text-xs font-medium bg-destructive/10 text-destructive px-2 py-1 rounded">Based on your Barangay</span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {nearestHospitals.map((hospital) => (
                <Card key={hospital.name} className="hover:shadow-md transition-shadow border-l-4 border-l-destructive">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-primary">{hospital.name}</CardTitle>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-semibold uppercase">{hospital.category}</span>
                      <span className="text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded font-semibold uppercase">{hospital.sector}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                      {hospital.address}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
