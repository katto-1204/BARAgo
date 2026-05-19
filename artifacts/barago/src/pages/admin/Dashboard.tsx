import { useGetAdminDashboard, getGetAdminDashboardQueryKey } from "@workspace/api-client-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, UrgencyBadge } from "@/components/shared/StatusBadges";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Users, Calendar, CheckCircle, Truck, ClipboardList } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B",
  approved: "#16A34A",
  rejected: "#DC2626",
  rescheduled: "#2563EB",
  completed: "#059669",
  cancelled: "#6B7280",
};
const URGENCY_COLORS: Record<string, string> = {
  low: "#16A34A",
  medium: "#F59E0B",
  high: "#DC2626",
};

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useGetAdminDashboard({
    query: { queryKey: getGetAdminDashboardQueryKey() },
  });

  const statCards = [
    { label: "Total Residents", value: dashboard?.totalResidents ?? 0, icon: Users, color: "text-primary" },
    { label: "Pending Appointments", value: dashboard?.pendingAppointments ?? 0, icon: Calendar, color: "text-yellow-600" },
    { label: "Approved Appointments", value: dashboard?.approvedAppointments ?? 0, icon: CheckCircle, color: "text-green-600" },
    { label: "Pending Ambulance", value: dashboard?.pendingAmbulanceRequests ?? 0, icon: Truck, color: "text-destructive" },
    { label: "Completed Checkups", value: dashboard?.completedCheckups ?? 0, icon: ClipboardList, color: "text-blue-600" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of barangay health services</p>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} data-testid={`stat-card-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                    <div>
                      {isLoading ? <Skeleton className="h-7 w-12" /> : (
                        <p className="text-2xl font-bold">{stat.value}</p>
                      )}
                      <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Appointments by Status Chart */}
          <Card>
            <CardHeader><CardTitle className="text-base">Appointments by Status</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-48 w-full" /> : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dashboard?.appointmentsByStatus ?? []}>
                    <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {(dashboard?.appointmentsByStatus ?? []).map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#6B7280"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Ambulance by Urgency Chart */}
          <Card>
            <CardHeader><CardTitle className="text-base">Ambulance Requests by Urgency</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-48 w-full" /> : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={dashboard?.ambulanceByUrgency ?? []}
                      dataKey="count"
                      nameKey="urgencyLevel"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ urgencyLevel, count }) => count > 0 ? `${urgencyLevel}: ${count}` : ""}
                    >
                      {(dashboard?.ambulanceByUrgency ?? []).map((entry) => (
                        <Cell key={entry.urgencyLevel} fill={URGENCY_COLORS[entry.urgencyLevel] ?? "#6B7280"} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Appointments */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Appointment Requests</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-32 w-full" /> : (dashboard?.recentAppointments?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No appointments yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-left">
                      <th className="pb-2 font-medium">Patient</th>
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Reason</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard?.recentAppointments?.map((appt) => (
                      <tr key={appt.id} data-testid={`row-appointment-${appt.id}`} className="border-b last:border-0">
                        <td className="py-2 font-medium">{appt.patientName}</td>
                        <td className="py-2 text-muted-foreground">{appt.preferredDate}</td>
                        <td className="py-2 text-muted-foreground">{appt.reason}</td>
                        <td className="py-2"><StatusBadge status={appt.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Ambulance Requests */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Ambulance Requests</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-32 w-full" /> : (dashboard?.recentAmbulanceRequests?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No ambulance requests yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-left">
                      <th className="pb-2 font-medium">Patient</th>
                      <th className="pb-2 font-medium">Location</th>
                      <th className="pb-2 font-medium">Type</th>
                      <th className="pb-2 font-medium">Urgency</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard?.recentAmbulanceRequests?.map((req) => (
                      <tr key={req.id} data-testid={`row-ambulance-${req.id}`} className="border-b last:border-0">
                        <td className="py-2 font-medium">{req.patientName}</td>
                        <td className="py-2 text-muted-foreground">{req.exactLocation}</td>
                        <td className="py-2 text-muted-foreground">{req.emergencyType}</td>
                        <td className="py-2"><UrgencyBadge urgency={req.urgencyLevel} /></td>
                        <td className="py-2"><StatusBadge status={req.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
