import { useGetAdminDashboard, getGetAdminDashboardQueryKey } from "@workspace/api-client-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, UrgencyBadge } from "@/components/shared/StatusBadges";
import { Users, Calendar, CheckCircle, Truck, ClipboardList, ChevronRight, LayoutDashboard, Clock, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import adminDashboardImg from "@assets/ChatGPT_Image_May_20,_2026,_12_06_31_AM_(9)_1779287509631.png";
import logoImg from "@assets/image_1779205170996.png";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: dashboard, isLoading } = useGetAdminDashboard({
    query: { queryKey: getGetAdminDashboardQueryKey() },
  });

  const stats1 = [
    { label: "Total Residents", value: dashboard?.totalResidents ?? 0, icon: Users, color: "text-green-600", bgColor: "bg-green-50" },
    { label: "Pending Appointments", value: dashboard?.pendingAppointments ?? 0, icon: Calendar, color: "text-yellow-600", bgColor: "bg-yellow-50" },
    { label: "Approved Appointments", value: dashboard?.approvedAppointments ?? 0, icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50" },
  ];

  const stats2 = [
    { label: "Pending Ambulance Requests", value: dashboard?.pendingAmbulanceRequests ?? 0, icon: Truck, color: "text-destructive", bgColor: "bg-red-50", subtitle: "Requires attention" },
    { label: "Completed Checkups", value: dashboard?.completedCheckups ?? 0, icon: ClipboardList, color: "text-blue-600", bgColor: "bg-blue-50", subtitle: "This month" },
  ];

  const quickActions = [
    { label: "Manage Appointments", href: "/admin/appointments", icon: Calendar, color: "text-blue-600", bgColor: "bg-blue-50", subtitle: "Review and approve" },
    { label: "Ambulance Requests", href: "/admin/ambulance", icon: Truck, color: "text-red-600", bgColor: "bg-red-50", subtitle: "Emergency dispatch" },
    { label: "Schedules", href: "/admin/schedules", icon: Clock, color: "text-green-600", bgColor: "bg-green-50", subtitle: "Manage health center hours" },
    { label: "Residents", href: "/admin/residents", icon: Users, color: "text-green-600", bgColor: "bg-green-50", subtitle: "Verified community members" },
    { label: "Reports", href: "/admin/reports", icon: FileText, color: "text-purple-600", bgColor: "bg-purple-50", subtitle: "Analytics and data" },
  ];

  const initials = user?.fullName ? user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase() : "AD";

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="BaraGo" className="h-8 w-8 object-contain" />
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Overview of health services and requests in your barangay.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-1 pr-4 rounded-full border shadow-sm">
            <Avatar className="h-8 w-8 bg-green-600 text-white">
              <AvatarFallback className="bg-green-600 text-white text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-right">
              <p className="text-sm font-medium leading-none">{user?.fullName}</p>
              <p className="text-[10px] text-muted-foreground uppercase mt-0.5 font-semibold">Barangay Health Staff</p>
            </div>
          </div>
        </div>

        {/* Stats Row 1 */}
        <div className="grid gap-4 sm:grid-cols-3">
          {stats1.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                      {isLoading ? <Skeleton className="h-9 w-16 mt-2" /> : (
                        <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                      )}
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Row 2 */}
        <div className="grid gap-4 sm:grid-cols-2">
          {stats2.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                      <div className="flex items-baseline gap-2">
                        {isLoading ? <Skeleton className="h-9 w-16 mt-2" /> : (
                          <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                        )}
                        <span className="text-xs text-muted-foreground">{stat.subtitle}</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions and Hero Image */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow border-none shadow-sm group">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${action.bgColor}`}>
                            <Icon className={`h-6 w-6 ${action.color}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{action.label}</h3>
                            <p className="text-xs text-muted-foreground">{action.subtitle}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="hidden lg:block relative">
            <img 
              src={adminDashboardImg} 
              alt="Health Center" 
              className="rounded-2xl w-full h-full object-cover shadow-sm border"
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Appointments */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <CardTitle className="text-base font-bold">Recent Appointment Requests</CardTitle>
              <Link href="/admin/appointments" className="text-xs text-primary font-semibold hover:underline">View All</Link>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : (dashboard?.recentAppointments?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No appointments yet</p>
              ) : (
                <div className="divide-y">
                  {dashboard?.recentAppointments?.map((appt) => (
                    <div key={appt.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group cursor-pointer">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {appt.patientName.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{appt.patientName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {appt.reason} • {appt.preferredDate} • {appt.preferredTime}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={appt.status} />
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Ambulance Requests */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <CardTitle className="text-base font-bold">Recent Ambulance Requests</CardTitle>
              <Link href="/admin/ambulance" className="text-xs text-primary font-semibold hover:underline">View All</Link>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : (dashboard?.recentAmbulanceRequests?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No ambulance requests yet</p>
              ) : (
                <div className="divide-y">
                  {dashboard?.recentAmbulanceRequests?.map((req) => (
                    <div key={req.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group cursor-pointer">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${req.urgencyLevel === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {req.patientName.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{req.patientName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {req.emergencyType} • {req.exactLocation}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={req.status} />
                        <UrgencyBadge urgency={req.urgencyLevel} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
