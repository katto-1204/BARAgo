import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Shield, LogOut, Stethoscope, Calendar, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useListSchedules, getListSchedulesQueryKey } from "@workspace/api-client-react";

export default function WorkerProfile() {
  const { user, logout } = useAuth();

  const { data: schedules } = useListSchedules({}, {
    query: { queryKey: getListSchedulesQueryKey() },
  });

  const initials = user?.fullName
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "HW";

  // Find schedules assigned to this health worker
  const mySchedules = schedules?.filter(
    (s) => s.assignedStaff === user?.fullName
  ) ?? [];

  const upcomingSchedules = mySchedules.filter((s) => {
    const today = new Date().toISOString().split("T")[0];
    return s.scheduleDate >= today && s.status !== "cancelled";
  });

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        <header>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Your health worker account information.</p>
        </header>

        {/* Profile Card */}
        <Card className="overflow-hidden border-t-4 border-t-primary">
          <CardHeader className="flex flex-row items-center gap-6 bg-gradient-to-r from-primary/5 to-emerald-500/5 pb-8">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-emerald-500 text-white font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-white" />
              </span>
            </div>
            <div className="space-y-1.5">
              <CardTitle className="text-3xl">{user?.fullName}</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  <Stethoscope className="h-3.5 w-3.5" />
                  Health Worker
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold uppercase tracking-wide">
                  Active
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </CardHeader>

          <CardContent className="grid gap-8 md:grid-cols-2 p-8">
            {/* Contact Info */}
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Account Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 group">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Email Address</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Role</p>
                    <p className="font-medium capitalize">{user?.role?.replace("_", " ")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Stats */}
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Schedule Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border bg-muted/30 p-4 text-center">
                  <p className="text-3xl font-black text-primary">{mySchedules.length}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Total Assigned</p>
                </div>
                <div className="rounded-xl border bg-muted/30 p-4 text-center">
                  <p className="text-3xl font-black text-emerald-600">{upcomingSchedules.length}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Upcoming</p>
                </div>
              </div>
            </div>
          </CardContent>

          <div className="p-8 bg-muted/30 border-t flex justify-between items-center">
            <p className="text-sm text-muted-foreground italic">
              Contact administration to update your profile details.
            </p>
            <Button
              variant="outline"
              className="text-destructive border-destructive hover:bg-destructive hover:text-white"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </Card>

        {/* Upcoming Schedules */}
        {upcomingSchedules.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              My Upcoming Schedules
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {upcomingSchedules.slice(0, 6).map((sched) => (
                <Card key={sched.id} className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-primary">
                      <Calendar className="h-4 w-4" />
                      <span className="font-bold text-sm">
                        {new Date(sched.scheduleDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{sched.startTime} – {sched.endTime}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {sched.currentSlots} / {sched.slotLimit} slots filled
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          sched.status === "open"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {sched.status}
                      </span>
                    </div>
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
