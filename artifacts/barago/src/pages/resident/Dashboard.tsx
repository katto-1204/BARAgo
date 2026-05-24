import { Link } from "wouter";
import { useGetResidentDashboard, getGetResidentDashboardQueryKey, useListAppointments, getListAppointmentsQueryKey, useListSchedules, getListSchedulesQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadges";
import {
  Calendar as CalendarIcon, Truck, Bell, User, ClipboardList, CheckCircle2,
  Clock3, ArrowRight, Droplet, Apple, Sparkles, Sun, Sunset, Moon,
  ChevronLeft, ChevronRight, Check
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function ResidentDashboard() {
  const { user } = useAuth();
  const { data: dashboard, isLoading: isDashboardLoading } = useGetResidentDashboard({
    query: { queryKey: getGetResidentDashboardQueryKey() },
  });

  const { data: appointmentsList, isLoading: isApptsLoading } = useListAppointments({}, {
    query: { queryKey: getListAppointmentsQueryKey({}) }
  });
  const { data: schedules, isLoading: isSchedulesLoading } = useListSchedules({ status: "open" }, {
    query: { queryKey: getListSchedulesQueryKey({ status: "open" }) }
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

  const firstName = user?.fullName?.split(" ")[0];

  const appointmentCounts = {
    upcoming: dashboard?.upcomingAppointment ? 1 : 0,
    completed: dashboard?.recentAppointments?.filter(a => a.status === "completed").length ?? 0,
    cancelled: dashboard?.recentAppointments?.filter(a => a.status === "cancelled").length ?? 0,
  };

  // --- CALENDAR LOGIC ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get first day of the month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Get total days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Prev month filler days
  const prevMonthDays = [];
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i);
  }

  // Current month days
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Next month filler days (to make grid full multiple of 7)
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

  const formatDateStr = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // Helper to check if a specific day has any appointment
  const hasAppointmentOnDay = (day: number) => {
    const checkDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return appointmentsList?.some(appt => appt.preferredDate === checkDateStr);
  };

  // Filter appointments for the currently selected date
  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
  const appointmentsForSelectedDate = appointmentsList?.filter(appt => appt.preferredDate === selectedDateStr) || [];
  const minimumAppointmentDate = new Date();
  minimumAppointmentDate.setDate(minimumAppointmentDate.getDate() + 2);
  const minimumAppointmentDateStr = `${minimumAppointmentDate.getFullYear()}-${String(minimumAppointmentDate.getMonth() + 1).padStart(2, "0")}-${String(minimumAppointmentDate.getDate()).padStart(2, "0")}`;
  const availableSchedules = (schedules ?? [])
    .filter((schedule) => schedule.status === "open" && schedule.scheduleDate >= minimumAppointmentDateStr && schedule.currentSlots < schedule.slotLimit)
    .slice(0, 4);

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: Main dashboard overview (2 cols width) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Hero Greeting */}
          <div className="relative bg-gradient-to-r from-primary via-emerald-500 to-teal-400 rounded-3xl p-6 md:p-8 overflow-hidden shadow-lg shadow-primary/20">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-xl" />
            <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full translate-y-10 blur-xl" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <GreetingIcon className="h-5 w-5 text-white/80" />
                  <span className="text-white/85 text-xs font-semibold uppercase tracking-wider">{greeting}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                  Hello, {firstName}!
                </h1>
                <p className="text-white/90 text-sm max-w-md font-medium leading-relaxed">
                  Welcome to your Barangay health dashboard. Manage checkups and request medical assistance effortlessly.
                </p>
              </div>
              <div className="hidden sm:flex h-20 w-20 rounded-2xl bg-white/15 items-center justify-center backdrop-blur-sm border border-white/20">
                <User className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Upcoming Appointments", value: appointmentCounts.upcoming, color: "text-primary border-primary/20 bg-primary/5", icon: CalendarIcon },
              { label: "Completed Visits", value: appointmentCounts.completed, color: "text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5", icon: CheckCircle2 },
              { label: "Cancelled", value: appointmentCounts.cancelled, color: "text-muted-foreground border-border bg-muted/20", icon: Clock3 },
            ].map(({ label, value, color, icon: Icon }) => (
              <Card key={label} className={cn("border border-border/80 shadow-sm hover-lift bg-card", color)}>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="p-2 rounded-xl mb-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  {isDashboardLoading ? (
                    <Skeleton className="h-7 w-10 mb-1" />
                  ) : (
                    <p className="text-2xl font-black">{value}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-black mb-4 text-foreground flex items-center gap-2">
              <span className="h-4 w-1.5 bg-primary rounded-full" />
              Quick Actions
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  href: "/appointments/new",
                  icon: CalendarIcon,
                  label: "Book Checkup",
                  desc: "Schedule a health center visit",
                  iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  hoverBorder: "hover:border-primary/50 hover:shadow-primary/5",
                },
                {
                  href: "/ambulance/new",
                  icon: Truck,
                  label: "Request Ambulance",
                  desc: "Emergency transport services",
                  iconBg: "bg-red-500/10 text-red-600 dark:text-red-400",
                  hoverBorder: "hover:border-destructive/50 hover:shadow-destructive/5",
                },
                {
                  href: "/appointments",
                  icon: ClipboardList,
                  label: "My History",
                  desc: "View healthcare timeline",
                  iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                  hoverBorder: "hover:border-blue-500/50 hover:shadow-blue-50/5",
                },
              ].map(({ href, icon: Icon, label, desc, iconBg, hoverBorder }) => (
                <Link key={href} href={href} className="block">
                  <Card className={cn("border border-border/80 shadow-sm cursor-pointer group transition-all duration-300 rounded-2xl hover-lift bg-card", hoverBorder)}>
                    <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                      <div className={cn("p-3.5 rounded-2xl group-hover:scale-105 transition-transform duration-300", iconBg)}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm">{label}</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <Card className="border border-border/80 shadow-sm rounded-2xl overflow-hidden bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-primary" />
                Available Health Schedules
              </CardTitle>
              <Button variant="outline" size="sm" asChild className="rounded-xl h-8 text-xs">
                <Link href="/appointments/new">Book</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {isSchedulesLoading ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Skeleton className="h-24 rounded-xl" />
                  <Skeleton className="h-24 rounded-xl" />
                </div>
              ) : availableSchedules.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {availableSchedules.map((schedule) => {
                    const remainingSlots = schedule.slotLimit - schedule.currentSlots;
                    return (
                      <Link key={schedule.id} href="/appointments/new" className="rounded-xl border border-border/70 bg-muted/20 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-extrabold text-foreground">{schedule.scheduleDate}</p>
                            <p className="mt-1 text-xs font-semibold text-primary">{schedule.startTime} - {schedule.endTime}</p>
                            <p className="mt-2 text-xs text-muted-foreground">Service: Barangay health checkup</p>
                            <p className="text-xs text-muted-foreground">Staff: {schedule.assignedStaff || "To be assigned"}</p>
                          </div>
                          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">
                            {remainingSlots} slots
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center">
                  <CalendarIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm font-semibold text-foreground">No available health schedules yet.</p>
                  <p className="mt-1 text-xs text-muted-foreground">Please check again later or contact the barangay health office.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ambulance Request Banner */}
          <Card className="border border-red-500/20 bg-gradient-to-r from-red-500/5 to-rose-500/5 shadow-sm overflow-hidden rounded-2xl">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/15 rounded-2xl shrink-0">
                    <Truck className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="font-bold text-base text-foreground">Need Urgent Transport?</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Request ambulance dispatch to your barangay coordinates for immediate assistance.
                    </p>
                  </div>
                </div>
                <Button variant="destructive" asChild className="rounded-xl font-bold shrink-0 shadow-sm px-6 h-10">
                  <Link href="/ambulance/new">Request Now</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Daily Health Reminder */}
          <Card className="bg-gradient-to-r from-primary via-emerald-500 to-teal-400 text-white overflow-hidden relative border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shrink-0">
                  <Droplet className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black mb-1">Health Advisory</h3>
                  <p className="text-white/90 text-xs leading-relaxed max-w-lg font-medium">
                    Eat fresh vegetables and fruits, stay hydrated, and follow sanitation guidelines. Let's make our barangay a healthier place to live!
                  </p>
                </div>
                <Apple className="h-12 w-12 text-white/20 hidden md:block shrink-0" />
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-xl" />
          </Card>

        </div>

        {/* RIGHT COLUMN: Interactive Calendar & Upcoming Schedule */}
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
                      {hasAppt && (
                        <span className={cn(
                          "absolute bottom-1.5 h-1 w-1 rounded-full",
                          selected ? "bg-white" : "bg-primary"
                        )} />
                      )}
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

          {/* Upcoming Schedule for selected date */}
          <Card className="border border-border/80 shadow-sm rounded-2xl overflow-hidden bg-card">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Schedules for {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isApptsLoading ? (
                <div className="p-4 space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : appointmentsForSelectedDate.length > 0 ? (
                <div className="divide-y divide-border/60">
                  {appointmentsForSelectedDate.map(appt => (
                    <div key={appt.id} className="p-4 hover:bg-muted/30 transition-colors flex items-start gap-3">
                      <div className="h-6 w-6 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                        <Check className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground leading-snug">{appt.reason}</p>
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
                  <p className="text-xs font-medium">No checkups scheduled on this day</p>
                  <Button variant="outline" size="sm" asChild className="rounded-xl mt-3 text-xs h-8 border-border">
                    <Link href={`/appointments/new?date=${formatDateStr(selectedDate)}`}>Book checkup</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card className="border border-border/80 shadow-sm rounded-2xl overflow-hidden bg-card">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-primary" /> Recent Alerts
              </CardTitle>
              <Link href="/notifications" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider">
                All
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60">
                <div className="p-4 flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground">Immunization Drive</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Free vaccines on Wednesday 8AM.</p>
                  </div>
                </div>
                <div className="p-4 flex gap-3 items-start opacity-70">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0 mt-2" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground">Dental Checkup Promo</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Dental checkups available next week.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </AppLayout>
  );
}
