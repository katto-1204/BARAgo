import { useState } from "react";
import {
  useListAppointments,
  getListAppointmentsQueryKey,
  useListSchedules,
  getListSchedulesQueryKey,
  useUpdateAppointment,
  useListAmbulanceRequests,
  getListAmbulanceRequestsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadges";
import { useToast } from "@/hooks/use-toast";
import { Ambulance, Calendar, CheckCircle2, Clock, ClipboardList, Eye, Mail, MapPin, Phone, Search, ShieldCheck, UserRound, Users } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import type { AppointmentWithResident } from "@workspace/api-client-react";

export default function HealthWorkerDashboard() {
  const [filterTab, setFilterTab] = useState("approved");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialog, setDialog] = useState<{ id: string; name: string } | null>(null);
  const [patientDialog, setPatientDialog] = useState<AppointmentWithResident | null>(null);
  const [remarks, setRemarks] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const statusParam = filterTab === "completed" ? "completed" : "approved";
  const { data: appointments, isLoading } = useListAppointments({ status: statusParam }, {
    query: { queryKey: getListAppointmentsQueryKey({ status: statusParam }) },
  });
  const { data: schedules } = useListSchedules({}, {
    query: { queryKey: getListSchedulesQueryKey() },
  });
  const { data: ambulanceRequests, isLoading: isAmbulanceLoading } = useListAmbulanceRequests({}, {
    query: { queryKey: getListAmbulanceRequestsQueryKey({}) },
  });

  const updateMutation = useUpdateAppointment();

  const handleComplete = () => {
    if (!dialog) return;
    updateMutation.mutate({ id: dialog.id, data: { status: "completed", adminRemarks: remarks || undefined } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        toast({ title: "Appointment marked as completed" });
        setDialog(null);
        setRemarks("");
      },
      onError: () => toast({ title: "Failed to update", variant: "destructive" }),
    });
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const mySchedules = schedules?.filter((schedule) => {
    const assignedStaff = schedule.assignedStaff?.toLowerCase();
    return assignedStaff === user?.email?.toLowerCase() || assignedStaff === user?.fullName?.toLowerCase();
  }) ?? [];
  const visibleSchedules = (mySchedules.length > 0 ? mySchedules : schedules ?? [])
    .filter((schedule) => schedule.status !== "cancelled")
    .sort((a, b) => `${a.scheduleDate} ${a.startTime}`.localeCompare(`${b.scheduleDate} ${b.startTime}`));
  const upcomingSchedules = visibleSchedules.filter((schedule) => schedule.scheduleDate >= todayStr).slice(0, 4);
  const activeAmbulanceRequests = (ambulanceRequests ?? [])
    .filter((request) => request.status === "approved" || request.status === "dispatched")
    .slice(0, 3);

  const filteredAppointments = appointments?.filter((appt) => {
    const matchesSearch = appt.patientName.toLowerCase().includes(searchQuery.toLowerCase())
      || appt.reason.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterTab === "today") {
      return matchesSearch && appt.preferredDate === todayStr;
    }
    if (filterTab === "upcoming") {
      return matchesSearch && !!appt.preferredDate && appt.preferredDate > todayStr;
    }
    return matchesSearch;
  });

  const todayAppointments = (appointments ?? []).filter((appt) => appt.preferredDate === todayStr && appt.status === "approved").length;
  const upcomingAppointments = (appointments ?? []).filter((appt) => !!appt.preferredDate && appt.preferredDate >= todayStr && appt.status === "approved").length;
  const completedAppointments = (appointments ?? []).filter((appt) => appt.status === "completed").length;

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  const getScheduleForAppointment = (appointment: { scheduleId?: string | null; preferredDate?: string | null }) => {
    return schedules?.find((schedule) => schedule.id === appointment.scheduleId)
      ?? schedules?.find((schedule) => schedule.scheduleDate === appointment.preferredDate);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Health Worker Dashboard</h1>
          <p className="text-muted-foreground">View approved appointments, daily schedules, resident details, and assistance needs.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Today", value: todayAppointments, icon: Calendar, tone: "text-primary bg-primary/10" },
            { label: "Upcoming", value: upcomingAppointments, icon: Clock, tone: "text-blue-600 bg-blue-500/10" },
            { label: "Completed", value: completedAppointments, icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-500/10" },
            { label: "Ambulance Assist", value: activeAmbulanceRequests.length, icon: Ambulance, tone: "text-red-600 bg-red-500/10" },
          ].map(({ label, value, icon: Icon, tone }) => (
            <Card key={label} className="border border-border/70 shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`rounded-xl p-2.5 ${tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-black leading-none">{value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 border border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-5 w-5 text-primary" />
                Health Schedules
              </CardTitle>
              <CardDescription>
                {mySchedules.length > 0 ? "Schedules assigned to you by the admin." : "Upcoming health schedules created by the admin."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingSchedules.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {upcomingSchedules.map((schedule) => (
                    <div key={schedule.id} className="rounded-xl border bg-muted/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold">{schedule.scheduleDate}</p>
                          <p className="mt-1 text-xs font-semibold text-primary">{schedule.startTime} - {schedule.endTime}</p>
                          <p className="mt-2 text-xs text-muted-foreground">Service: Barangay health checkup</p>
                          <p className="text-xs text-muted-foreground">Staff: {schedule.assignedStaff || "To be assigned"}</p>
                        </div>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">
                          {schedule.slotLimit - schedule.currentSlots} slots
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center">
                  <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm font-semibold">No upcoming health schedules</p>
                  <p className="text-xs text-muted-foreground">Admin-created schedules will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Ambulance className="h-5 w-5 text-red-600" />
                Ambulance Assistance
              </CardTitle>
              <CardDescription>Approved or dispatched requests to coordinate with admin.</CardDescription>
            </CardHeader>
            <CardContent>
              {isAmbulanceLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 rounded-xl" />
                  <Skeleton className="h-12 rounded-xl" />
                </div>
              ) : activeAmbulanceRequests.length > 0 ? (
                <div className="space-y-3">
                  {activeAmbulanceRequests.map((request) => (
                    <div key={request.id} className="rounded-xl border bg-red-500/5 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold">{request.patientName}</p>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{request.exactLocation}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{request.emergencyType}</p>
                        </div>
                        <StatusBadge status={request.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center">
                  <Ambulance className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm font-semibold">No active ambulance assistance</p>
                  <p className="text-xs text-muted-foreground">Approved requests will show here when coordination is needed.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Tabs value={filterTab} onValueChange={setFilterTab} className="w-full md:w-auto">
            <TabsList className="grid grid-cols-4 md:flex w-full">
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
          </div>
        ) : (filteredAppointments?.length ?? 0) === 0 ? (
          <Card className="border-dashed bg-muted/30">
            <CardContent className="py-12 text-center">
              <div className="bg-muted rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-muted-foreground opacity-50" />
              </div>
              <p className="text-lg font-medium">No appointments found</p>
              <p className="text-muted-foreground">There are no {filterTab} appointments matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAppointments?.map((appt) => {
              const assignedSchedule = getScheduleForAppointment(appt);
              return (
                <Card key={appt.id} data-testid={`row-appointment-${appt.id}`} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 flex flex-row items-start gap-4 space-y-0">
                    <Avatar className="h-10 w-10 border">
                      <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                        {getInitials(appt.patientName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-base font-bold truncate">{appt.patientName}</CardTitle>
                      <CardDescription className="flex items-center text-xs">
                        {appt.patientAge ? `${appt.patientAge} years old` : "Age not specified"}
                      </CardDescription>
                    </div>
                    <StatusBadge status={appt.status} />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{appt.preferredDate || "Date not set"}</span>
                        <span className="mx-1">-</span>
                        <Clock className="h-3.5 w-3.5" />
                        <span>{appt.preferredTime || "Time not set"}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <ClipboardList className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                        <span className="font-medium line-clamp-1">{appt.reason}</span>
                      </div>
                      {assignedSchedule && (
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <Users className="h-3.5 w-3.5 mt-0.5" />
                          <span>
                            Assigned schedule: {assignedSchedule.startTime} - {assignedSchedule.endTime}
                            {assignedSchedule.assignedStaff ? ` (${assignedSchedule.assignedStaff})` : ""}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground italic">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>Barangay Health Center</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t">
                      <Button
                        variant="outline"
                        className="w-full h-9"
                        onClick={() => setPatientDialog(appt)}
                        data-testid={`button-view-patient-${appt.id}`}
                      >
                        <Eye className="mr-2 h-4 w-4" /> View Patient
                      </Button>
                      {appt.status === "completed" ? (
                        <div className="bg-green-50 p-2 rounded border border-green-100 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-700 font-medium">Checkup Completed</span>
                        </div>
                      ) : (
                        <Button
                          className="w-full bg-primary hover:bg-primary/90 h-9"
                          onClick={() => { setRemarks(""); setDialog({ id: appt.id, name: appt.patientName }); }}
                          data-testid={`button-complete-${appt.id}`}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Complete Checkup
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-3 rounded-lg border border-muted-foreground/10">
              <p className="text-sm font-medium">Patient</p>
              <p className="text-base">{dialog?.name}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="remarks">Consultation Remarks</Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Record diagnosis, prescribed medication, or follow-up instructions..."
                className="min-h-[120px]"
                data-testid="input-remarks"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={handleComplete} disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/90" data-testid="button-confirm-complete">
              {updateMutation.isPending ? "Saving..." : "Save & Complete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!patientDialog} onOpenChange={() => setPatientDialog(null)}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-primary" />
              Patient Details
            </DialogTitle>
          </DialogHeader>
          {patientDialog && (
            <div className="space-y-4 py-2">
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Patient</p>
                    <h3 className="mt-1 text-xl font-black text-foreground">{patientDialog.patientName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {patientDialog.patientAge ? `${patientDialog.patientAge} years old` : "Age not specified"} • {patientDialog.reason}
                    </p>
                  </div>
                  <StatusBadge status={patientDialog.status} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-3">
                  <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <UserRound className="h-3.5 w-3.5 text-primary" />
                    Resident Account
                  </p>
                  <p className="text-sm font-semibold">{patientDialog.resident?.user?.fullName || "Not available"}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {patientDialog.resident?.user?.email || "No email"}
                  </p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    Contact
                  </p>
                  <p className="text-sm font-semibold">{patientDialog.resident?.contactNumber || "No contact number"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Emergency: {patientDialog.resident?.emergencyContactName || "N/A"} {patientDialog.resident?.emergencyContactNumber ? `(${patientDialog.resident.emergencyContactNumber})` : ""}
                  </p>
                </div>
                <div className="rounded-xl border p-3 sm:col-span-2">
                  <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Address
                  </p>
                  <p className="text-sm font-semibold">
                    {patientDialog.resident?.address || "No address"}
                    {patientDialog.resident?.purok ? `, ${patientDialog.resident.purok}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Gender: {patientDialog.resident?.gender || "N/A"} • Birthdate: {patientDialog.resident?.birthdate || "N/A"}
                  </p>
                </div>
                <div className="rounded-xl border p-3 sm:col-span-2">
                  <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    Appointment
                  </p>
                  <p className="text-sm font-semibold">{patientDialog.preferredDate || "Date not set"} • {patientDialog.preferredTime || "Time not set"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Concern: {patientDialog.reason}</p>
                  {patientDialog.adminRemarks && (
                    <p className="mt-2 rounded-lg bg-blue-50 p-2 text-xs text-blue-800">Remarks: {patientDialog.adminRemarks}</p>
                  )}
                </div>
              </div>

              {patientDialog.resident?.verified && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm font-semibold text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                  Resident profile is verified.
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPatientDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
