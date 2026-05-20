import { Link } from "wouter";
import { useGetResidentDashboard, getGetResidentDashboardQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, UrgencyBadge } from "@/components/shared/StatusBadges";
import { Calendar, Truck, Bell, Clock, User, ClipboardList, CheckCircle2, Clock3, ArrowRight, Droplet, Apple } from "lucide-react";
import { useState, useEffect } from "react";
import residentDashboardImg from "@assets/ChatGPT_Image_May_20,_2026,_12_06_31_AM_(4)_1779287509629.png";

export default function ResidentDashboard() {
  const { user } = useAuth();
  const { data: dashboard, isLoading } = useGetResidentDashboard({
    query: { queryKey: getGetResidentDashboardQueryKey() },
  });

  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const firstName = user?.fullName?.split(" ")[0];

  const appointmentCounts = {
    upcoming: dashboard?.upcomingAppointment ? 1 : 0,
    completed: dashboard?.recentAppointments?.filter(a => a.status === "completed").length ?? 0,
    cancelled: dashboard?.recentAppointments?.filter(a => a.status === "cancelled").length ?? 0,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {greeting}, {firstName}!
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">Here's your health overview for today.</p>
          </div>
          <div className="hidden md:block">
            <img src={residentDashboardImg} alt="Health center" className="h-24 object-contain" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Upcoming Appointment Card */}
          <Card className="lg:col-span-2 border-l-4 border-l-green-600">
            <CardHeader className="flex flex-row items-center gap-2 pb-3">
              <div className="p-2 bg-green-50 rounded-full">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-base font-semibold">Upcoming Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : dashboard?.upcomingAppointment ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg">{dashboard.upcomingAppointment.preferredDate} ({new Date(dashboard.upcomingAppointment.preferredDate!).toLocaleDateString('en-US', { weekday: 'short' })}) {dashboard.upcomingAppointment.preferredTime}</p>
                      <p className="text-muted-foreground">{dashboard.upcomingAppointment.reason}</p>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <span className="h-2 w-2 bg-primary rounded-full" />
                        BaraGo Health Center
                      </p>
                    </div>
                    <StatusBadge status={dashboard.upcomingAppointment.status} />
                  </div>
                  <Button variant="link" asChild className="p-0 h-auto text-primary font-medium">
                    <Link href={`/appointments/${dashboard.upcomingAppointment.id}`} className="flex items-center gap-1">
                      View Appointment Details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No upcoming appointments</p>
                  <Button variant="link" asChild className="mt-1 h-auto p-0 text-sm">
                    <Link href="/appointments/new">Book one now</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointment Status Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Appointment Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{appointmentCounts.upcoming}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Upcoming</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-green-700">{appointmentCounts.completed}</p>
                  <p className="text-[10px] text-green-600 uppercase">Completed</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-yellow-50">
                  <Clock3 className="h-4 w-4 text-yellow-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-yellow-700">{appointmentCounts.cancelled}</p>
                  <p className="text-[10px] text-yellow-600 uppercase">Cancelled</p>
                </div>
              </div>
              <Button variant="outline" className="w-full text-sm" asChild>
                <Link href="/appointments">View All Appointments</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Ambulance Request Status */}
        <Card className="border-l-4 border-l-destructive bg-destructive/5">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <Truck className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Ambulance Request Status</h3>
                  <p className="text-muted-foreground">
                    {dashboard?.recentAmbulanceRequests?.[0] 
                      ? `Active request: ${dashboard.recentAmbulanceRequests[0].status}`
                      : "No active emergency requests."}
                  </p>
                </div>
              </div>
              <Button variant="destructive" asChild>
                <Link href="/ambulance/new">Request Ambulance</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/appointments/new" className="block">
              <Card className="hover:border-primary transition-colors cursor-pointer group">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                  <div className="p-4 bg-green-100 rounded-2xl group-hover:bg-green-200 transition-colors">
                    <Calendar className="h-8 w-8 text-green-700" />
                  </div>
                  <div>
                    <h3 className="font-bold">Book Checkup</h3>
                    <p className="text-xs text-muted-foreground">Schedule a visit with health staff</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/ambulance/new" className="block">
              <Card className="hover:border-destructive transition-colors cursor-pointer group">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                  <div className="p-4 bg-red-100 rounded-2xl group-hover:bg-red-200 transition-colors">
                    <Truck className="h-8 w-8 text-red-700" />
                  </div>
                  <div>
                    <h3 className="font-bold">Request Ambulance</h3>
                    <p className="text-xs text-muted-foreground">Emergency transport assistance</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-destructive transition-colors" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/appointments" className="block">
              <Card className="hover:border-blue-600 transition-colors cursor-pointer group">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                  <div className="p-4 bg-blue-100 rounded-2xl group-hover:bg-blue-200 transition-colors">
                    <ClipboardList className="h-8 w-8 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-bold">My Appointments</h3>
                    <p className="text-xs text-muted-foreground">Track your healthcare history</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold">Recent Notifications</CardTitle>
            </div>
            <Button variant="link" asChild className="p-0 h-auto text-sm text-primary">
              <Link href="/notifications">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (dashboard?.unreadNotifications ?? 0) === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No new notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {/* Mocked recent notifications since API might not return list in dashboard */}
                <div className="p-4 flex gap-3 items-start hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="relative">
                    <div className="p-2 bg-blue-50 rounded-full">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="absolute top-0 right-0 h-2.5 w-2.5 bg-blue-600 border-2 border-background rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">Appointment Approved</p>
                    <p className="text-xs text-muted-foreground truncate">Your checkup for tomorrow has been confirmed.</p>
                    <p className="text-[10px] text-muted-foreground mt-1">2m ago</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Reminder */}
        <Card className="bg-green-600 text-white overflow-hidden relative">
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Droplet className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold italic underline decoration-white/30 underline-offset-4">Health Reminder</h3>
                <p className="mt-1 text-green-50">Drink plenty of water and eat nutritious food today to keep your body strong and healthy!</p>
              </div>
              <div className="ml-auto">
                <Apple className="h-12 w-12 text-white/30" />
              </div>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 h-24 w-24 bg-white/5 rounded-full blur-2xl" />
        </Card>
      </div>
    </AppLayout>
  );
}
