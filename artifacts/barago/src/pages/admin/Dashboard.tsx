import { useGetAdminDashboard, getGetAdminDashboardQueryKey, useListAppointments, getListAppointmentsQueryKey, useListAmbulanceRequests, getListAmbulanceRequestsQueryKey } from "@workspace/api-client-react";
import type { Appointment, AmbulanceRequest, AppointmentWithResident, AmbulanceRequestWithResident } from "@workspace/api-client-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, UrgencyBadge } from "@/components/shared/StatusBadges";
import {
  Users, Calendar as CalendarIcon, CheckCircle, Truck, ClipboardList,
  ChevronRight, LayoutDashboard, Clock, FileText, Sparkles, Sun, Sunset, Moon,
  ChevronLeft, ChevronRight as ChevronRightIcon, Check, ShieldAlert
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: dashboard, isLoading: isDashboardLoading } = useGetAdminDashboard({
    query: { queryKey: getGetAdminDashboardQueryKey() },
  });

  const { data: appointmentsList, isLoading: isApptsLoading } = useListAppointments({}, {
    query: { queryKey: getListAppointmentsQueryKey({}) }
  });

  const { data: ambulanceRequestsList, isLoading: isAmbulanceLoading } = useListAmbulanceRequests({}, {
    query: { queryKey: getListAmbulanceRequestsQueryKey({}) }
  });

  const [greeting, setGreeting] = useState("Welcome back");
  const [GreetingIcon, setGreetingIcon] = useState<typeof Sun>(() => Sparkles);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) { setGreeting("Good morning"); setGreetingIcon(() => Sun); }
    else if (hour < 18) { setGreeting("Good afternoon"); setGreetingIcon(() => Sunset); }
    else { setGreeting("Good evening"); setGreetingIcon(() => Moon); }
  }, []);

  const stats1 = [
    { label: "Total Residents", value: dashboard?.totalResidents ?? 0, icon: Users, color: "text-green-600 dark:text-green-400 border-green-500/20 bg-green-500/5" },
    { label: "Pending Appointments", value: dashboard?.pendingAppointments ?? 0, icon: CalendarIcon, color: "text-amber-600 dark:text-amber-400 border-amber-500/20 bg-amber-500/5" },
    { label: "Approved Appointments", value: dashboard?.approvedAppointments ?? 0, icon: CheckCircle, color: "text-primary border-primary/20 bg-primary/5" },
  ];

  const stats2 = [
    { label: "Pending Ambulance", value: dashboard?.pendingAmbulanceRequests ?? 0, icon: Truck, color: "text-red-600 dark:text-red-400 border-red-500/20 bg-red-500/5", subtitle: "Requires immediate attention" },
    { label: "Completed Checkups", value: dashboard?.completedCheckups ?? 0, icon: ClipboardList, color: "text-blue-600 dark:text-blue-400 border-blue-500/20 bg-blue-500/5", subtitle: "This calendar month" },
  ];

  const quickActions = [
    { label: "Manage Appointments", href: "/admin/appointments", icon: CalendarIcon, color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-500/10", subtitle: "Review and approve" },
    { label: "Ambulance Requests", href: "/admin/ambulance", icon: Truck, color: "text-red-600 dark:text-red-400", bgColor: "bg-red-500/10", subtitle: "Emergency dispatch" },
    { label: "Schedules", href: "/admin/schedules", icon: Clock, color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-500/10", subtitle: "Manage checkup slots" },
    { label: "Residents", href: "/admin/residents", icon: Users, color: "text-primary", bgColor: "bg-primary/10", subtitle: "Verified members list" },
    { label: "Reports", href: "/admin/reports", icon: FileText, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-500/10", subtitle: "Analytics and data" },
  ];

  const initials = user?.fullName ? user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase() : "AD";
  const firstName = user?.fullName?.split(" ")[0];

  // --- CALENDAR LOGIC ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = [];
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i);
  }

  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const totalSlotsUsed = firstDayOfMonth + daysInMonth;
  const nextMonthFillerCount = totalSlotsUsed % 7 === 0 ? 0 : 7 - (totalSlotsUsed % 7);
  const nextMonthDays = Array.from({ length: nextMonthFillerCount }, (_, i) => i + 1);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    setSelectedDate(new Date(year, month, day));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const isSelected = (day: number) => {
    return selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
  };

  // Helper to check if a specific day has any appointment
  const hasAppointmentOnDay = (day: number) => {
    const checkDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return appointmentsList?.some((appt: Appointment) => appt.preferredDate === checkDateStr);
  };

  // Helper to check if a specific day has any ambulance request
  const hasAmbulanceOnDay = (day: number) => {
    return ambulanceRequestsList?.some((req: AmbulanceRequest) => {
      const d = new Date(req.requestedAt);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  // Filter appointments for the currently selected date
  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
  const appointmentsForSelectedDate = appointmentsList?.filter((appt: Appointment) => appt.preferredDate === selectedDateStr) || [];

  // Filter ambulance requests for the currently selected date
  const ambulanceForSelectedDate = ambulanceRequestsList?.filter((req: AmbulanceRequest) => {
    const d = new Date(req.requestedAt);
    return d.getFullYear() === selectedDate.getFullYear() &&
           d.getMonth() === selectedDate.getMonth() &&
           d.getDate() === selectedDate.getDate();
  }) || [];

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: Main Overview & Stats */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-black text-foreground tracking-tight">Admin Portal</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Overview of health center requests and schedules.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-card p-1.5 pr-4 rounded-2xl border border-border shadow-sm">
              <Avatar className="h-8 w-8 border border-primary/20">
                <AvatarFallback className="bg-primary text-white text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-xs font-bold leading-none text-foreground">{user?.fullName}</p>
                <p className="text-[9px] text-muted-foreground uppercase mt-0.5 font-bold tracking-wider">Health Staff</p>
              </div>
            </div>
          </div>

          {/* Hero Greeting */}
          <div className="relative bg-gradient-to-r from-primary via-emerald-500 to-teal-400 rounded-3xl p-6 md:p-8 overflow-hidden shadow-lg shadow-primary/10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-xl" />
            <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full translate-y-10 blur-xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <GreetingIcon className="h-4.5 w-4.5 text-white/80" />
                <span className="text-white/85 text-xs font-bold uppercase tracking-wider">{greeting}</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                Hello, {firstName}!
              </h2>
              <p className="text-white/90 text-sm max-w-md font-medium leading-relaxed">
                We're helping you coordinate medical attention across the community efficiently. Keep track of recent checkups and emergency alerts.
              </p>
            </div>
          </div>

          {/* Stats row 1 */}
          <div className="grid gap-4 sm:grid-cols-3">
            {stats1.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className={cn("border border-border/85 shadow-sm overflow-hidden bg-card hover-lift", stat.color)}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</p>
                        {isDashboardLoading ? (
                          <Skeleton className="h-8 w-16 mt-2" />
                        ) : (
                          <p className="text-3xl font-black mt-1">{stat.value}</p>
                        )}
                      </div>
                      <div className="p-3 bg-muted rounded-2xl shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Stats row 2 */}
          <div className="grid gap-4 sm:grid-cols-2">
            {stats2.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className={cn("border border-border/85 shadow-sm overflow-hidden bg-card hover-lift", stat.color)}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</p>
                        <div className="flex items-baseline gap-2 mt-1">
                          {isDashboardLoading ? (
                            <Skeleton className="h-8 w-16" />
                          ) : (
                            <p className="text-3xl font-black">{stat.value}</p>
                          )}
                          <span className="text-[10px] text-muted-foreground font-medium">{stat.subtitle}</span>
                        </div>
                      </div>
                      <div className="p-3 bg-muted rounded-2xl shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions (Mockup design style list) */}
          <div>
            <h2 className="text-lg font-black mb-4 text-foreground flex items-center gap-2">
              <span className="h-4 w-1.5 bg-primary rounded-full" />
              Quick Actions
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href}>
                    <Card className="cursor-pointer border border-border/80 hover:border-primary/50 shadow-sm hover:shadow-primary/5 hover-lift transition-all rounded-2xl bg-card group">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={cn("p-3 rounded-2xl shrink-0", action.bgColor, action.color)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">{action.label}</h3>
                          <p className="text-[10px] text-muted-foreground truncate">{action.subtitle}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Grids for recent list and ambulance requests */}
          <div className="grid gap-6 sm:grid-cols-2">
            
            {/* Recent Appointments */}
            <Card className="border border-border/80 shadow-sm overflow-hidden rounded-2xl bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">Recent Appointments</CardTitle>
                <Link href="/admin/appointments" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider">
                  View All
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {isDashboardLoading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (dashboard?.recentAppointments?.length ?? 0) === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8 italic">No appointments requested yet</p>
                ) : (
                  <div className="divide-y divide-border/60">
                    {dashboard?.recentAppointments?.slice(0, 4).map((appt: AppointmentWithResident) => (
                      <div key={appt.id} className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors group cursor-pointer">
                        <Avatar className="h-9 w-9 border border-primary/20 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {appt.patientName.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-foreground truncate">{appt.patientName}</p>
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                            {appt.reason} • {appt.preferredDate}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <StatusBadge status={appt.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Ambulance Requests */}
            <Card className="border border-border/80 shadow-sm overflow-hidden rounded-2xl bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">Ambulance Alerts</CardTitle>
                <Link href="/admin/ambulance" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider">
                  View All
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {isDashboardLoading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (dashboard?.recentAmbulanceRequests?.length ?? 0) === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8 italic">No ambulance dispatch requested</p>
                ) : (
                  <div className="divide-y divide-border/60">
                    {dashboard?.recentAmbulanceRequests?.slice(0, 4).map((req: AmbulanceRequestWithResident) => (
                      <div key={req.id} className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors group cursor-pointer">
                        <div className={cn(
                          "h-9 w-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0",
                          req.urgencyLevel === 'high' ? 'bg-red-500/10 text-red-600' : 'bg-blue-500/10 text-blue-600'
                        )}>
                          {req.patientName.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-foreground truncate">{req.patientName}</p>
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                            {req.emergencyType} • {req.exactLocation}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <StatusBadge status={req.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

        </div>

        {/* RIGHT COLUMN: Functional Calendar & Day Schedules */}
        <div className="space-y-6">

          {/* Functional Calendar Widget (Mockup Style) */}
          <Card className="border border-border/80 shadow-sm rounded-2xl overflow-hidden bg-card">
            <div className="h-1.5 w-full bg-primary" />
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <CalendarIcon className="h-4.5 w-4.5 text-primary" />
                {monthNames[month]} {year}
              </CardTitle>
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg border border-border" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg border border-border" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 px-4 pb-4">
              
              {/* Day names */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {daysOfWeek.map(d => (
                  <span key={d} className="text-[10px] font-bold text-muted-foreground uppercase py-1">{d}</span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                
                {/* Filler days from previous month */}
                {prevMonthDays.map((d, i) => (
                  <span key={`prev-${i}`} className="text-xs text-muted-foreground/30 py-2 font-medium">{d}</span>
                ))}

                {/* Actual days of month */}
                {currentMonthDays.map(day => {
                  const hasAppt = hasAppointmentOnDay(day);
                  const selected = isSelected(day);
                  const today = isToday(day);

                  return (
                    <button
                      key={day}
                      onClick={() => handleSelectDay(day)}
                      type="button"
                      className={cn(
                        "text-xs font-semibold py-2 rounded-xl flex flex-col items-center justify-center relative aspect-square transition-all focus:outline-none",
                        selected && "bg-primary text-white shadow-md shadow-primary/20",
                        !selected && today && "border border-primary text-primary bg-primary/5",
                        !selected && !today && "hover:bg-muted text-foreground"
                      )}
                    >
                      <span>{day}</span>
                      <div className="absolute bottom-1.5 flex gap-1 justify-center items-center">
                        {hasAmbulanceOnDay(day) && (
                          <span className={cn(
                            "h-1.5 w-1.5 rounded-full bg-red-500",
                            selected && "bg-white"
                          )} />
                        )}
                        {hasAppt && (
                          <span className={cn(
                            "h-1.5 w-1.5 rounded-full bg-primary",
                            selected && "bg-white"
                          )} />
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Filler days for next month */}
                {nextMonthDays.map((d, i) => (
                  <span key={`next-${i}`} className="text-xs text-muted-foreground/30 py-2 font-medium">{d}</span>
                ))}

              </div>
            </CardContent>
          </Card>

          {/* Selected day checkup appointments checklist */}
          <Card className="border border-border/80 shadow-sm rounded-2xl overflow-hidden bg-card">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Schedule & Alerts on {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isApptsLoading || isAmbulanceLoading ? (
                <div className="p-4 space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (appointmentsForSelectedDate.length > 0 || ambulanceForSelectedDate.length > 0) ? (
                <div className="divide-y divide-border/60">
                  {/* Ambulance Requests */}
                  {ambulanceForSelectedDate.map((req: AmbulanceRequest) => (
                    <div key={req.id} className="p-4 hover:bg-muted/30 transition-colors flex items-start gap-3 bg-red-500/5">
                      <div className="h-6 w-6 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-600 shrink-0 mt-0.5">
                        <Truck className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-black bg-red-500/10 text-red-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Ambulance</span>
                          <p className="text-xs font-bold text-foreground leading-snug">{req.emergencyType}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Patient: {req.patientName} • Location: {req.exactLocation}</p>
                        <span className="inline-flex mt-1.5">
                          <StatusBadge status={req.status} />
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-red-600 shrink-0 font-mono">
                        {new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}

                  {/* Appointments */}
                  {appointmentsForSelectedDate.map((appt: Appointment) => (
                    <div key={appt.id} className="p-4 hover:bg-muted/30 transition-colors flex items-start gap-3">
                      <div className="h-6 w-6 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                        <Check className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Appointment</span>
                          <p className="text-xs font-bold text-foreground leading-snug">{appt.reason}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Patient: {appt.patientName}</p>
                        <span className="inline-flex mt-1.5">
                          <StatusBadge status={appt.status} />
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-primary shrink-0">{appt.preferredTime}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-25" />
                  <p className="text-xs font-medium">No events scheduled on this day</p>
                  <Button variant="outline" size="sm" asChild className="rounded-xl mt-3 text-xs h-8 border-border">
                    <Link href={`/admin/schedules`}>Manage schedules</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System status / alert center */}
          <Card className="border border-border/80 shadow-sm rounded-2xl overflow-hidden bg-card">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-red-500" /> Clinic Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-xs space-y-3">
              <div className="flex items-start gap-2.5 bg-red-500/5 p-3 border border-red-500/10 rounded-xl">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0 mt-1.5 animate-pulse" />
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Ambulance dispatch active</strong>. Emergency unit dispatched to Barangay 19-B coordinates.
                </p>
              </div>
              <div className="flex items-start gap-2.5 bg-amber-500/5 p-3 border border-amber-500/10 rounded-xl">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0 mt-1.5" />
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Checkup slot limits</strong>. Barangay schedules for vaccine drive have only 3 available spots left.
                </p>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </AppLayout>
  );
}
