import { Link } from "wouter";
import { useGetResidentDashboard, getGetResidentDashboardQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, UrgencyBadge } from "@/components/shared/StatusBadges";
import { Calendar, Truck, Bell, Clock, User } from "lucide-react";

export default function ResidentDashboard() {
  const { user } = useAuth();
  const { data: dashboard, isLoading } = useGetResidentDashboard({
    query: { queryKey: getGetResidentDashboardQueryKey() },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.fullName?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-1">Here is your health services overview.</p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button asChild data-testid="button-book-appointment">
            <Link href="/appointments/new">
              <Calendar className="mr-2 h-4 w-4" />
              Book Appointment
            </Link>
          </Button>
          <Button variant="outline" asChild data-testid="button-request-ambulance">
            <Link href="/ambulance/new">
              <Truck className="mr-2 h-4 w-4" />
              Request Ambulance
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Upcoming Appointment */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center gap-2 pb-3">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Upcoming Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : dashboard?.upcomingAppointment ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{dashboard.upcomingAppointment.patientName}</span>
                    <StatusBadge status={dashboard.upcomingAppointment.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">{dashboard.upcomingAppointment.reason}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {dashboard.upcomingAppointment.preferredDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {dashboard.upcomingAppointment.preferredTime}
                    </span>
                  </div>
                  {dashboard.upcomingAppointment.adminRemarks && (
                    <p className="text-sm bg-muted rounded p-2 text-muted-foreground">
                      Note: {dashboard.upcomingAppointment.adminRemarks}
                    </p>
                  )}
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

          {/* Notifications */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-3">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <div className="text-center py-4">
                  {(dashboard?.unreadNotifications ?? 0) > 0 ? (
                    <>
                      <span className="text-3xl font-bold text-primary">{dashboard?.unreadNotifications}</span>
                      <p className="text-sm text-muted-foreground mt-1">unread notification{dashboard?.unreadNotifications !== 1 ? "s" : ""}</p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">All caught up</p>
                  )}
                  <Button variant="link" asChild className="mt-2 h-auto p-0 text-sm">
                    <Link href="/notifications">View all</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Recent Appointments</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/appointments">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (dashboard?.recentAppointments?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No appointments yet</p>
            ) : (
              <div className="space-y-3">
                {dashboard?.recentAppointments?.map((appt) => (
                  <div key={appt.id} data-testid={`card-appointment-${appt.id}`} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{appt.patientName}</p>
                      <p className="text-xs text-muted-foreground">{appt.reason} · {appt.preferredDate}</p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Ambulance Requests */}
        {(dashboard?.recentAmbulanceRequests?.length ?? 0) > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-destructive" />
                <CardTitle className="text-base">Ambulance Requests</CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/ambulance">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard?.recentAmbulanceRequests?.map((req) => (
                  <div key={req.id} data-testid={`card-ambulance-${req.id}`} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{req.patientName}</p>
                      <p className="text-xs text-muted-foreground">{req.emergencyType} · {req.exactLocation}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <UrgencyBadge urgency={req.urgencyLevel} />
                      <StatusBadge status={req.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
