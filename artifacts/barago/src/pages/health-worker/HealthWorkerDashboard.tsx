import { useState } from "react";
import { useListAppointments, getListAppointmentsQueryKey, useListSchedules, getListSchedulesQueryKey, useUpdateAppointment } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadges";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CheckCircle2, Clock, User, ClipboardList, Search, Filter, MapPin } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";

export default function HealthWorkerDashboard() {
  const [filterTab, setFilterTab] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialog, setDialog] = useState<{ id: string; name: string } | null>(null);
  const [remarks, setRemarks] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Get appointments based on filter tab
  const statusParam = filterTab === "completed" ? "completed" : "approved";
  const { data: appointments, isLoading } = useListAppointments({ status: statusParam as any }, {
    query: { queryKey: getListAppointmentsQueryKey({ status: statusParam as any }) },
  });
  const { data: schedules } = useListSchedules({}, {
    query: { queryKey: getListSchedulesQueryKey() },
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const mySchedules = schedules?.filter((schedule) => {
    const assignedStaff = schedule.assignedStaff?.toLowerCase();
    return assignedStaff === user?.email?.toLowerCase() || assignedStaff === user?.fullName?.toLowerCase();
  }) ?? [];
  const myScheduleDates = new Set(mySchedules.map((schedule) => schedule.scheduleDate));
  
  const filteredAppointments = appointments?.filter(appt => {
    const matchesSearch = appt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          appt.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAssignedSchedule = !appt.preferredDate || myScheduleDates.size === 0 || myScheduleDates.has(appt.preferredDate);
    
    if (filterTab === "today") {
      return matchesSearch && matchesAssignedSchedule && appt.preferredDate === todayStr;
    }
    if (filterTab === "upcoming") {
      return matchesSearch && matchesAssignedSchedule && !!appt.preferredDate && appt.preferredDate > todayStr;
    }
    return matchesSearch && matchesAssignedSchedule;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Health Worker Dashboard</h1>
          <p className="text-muted-foreground">Manage approved checkups and record consultation remarks.</p>
        </div>

        {mySchedules.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mySchedules.slice(0, 3).map((schedule) => (
              <Card key={schedule.id} className="border-l-4 border-l-primary bg-primary/5">
                <CardContent className="p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">Assigned Schedule</p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{schedule.scheduleDate}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{schedule.startTime} - {schedule.endTime}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Tabs value={filterTab} onValueChange={setFilterTab} className="w-full md:w-auto">
            <TabsList className="grid grid-cols-3 md:flex w-full">
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
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
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
            {filteredAppointments?.map((appt) => (
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
                      <span>{appt.preferredDate}</span>
                      <span className="mx-1">•</span>
                      <Clock className="h-3.5 w-3.5" />
                      <span>{appt.preferredTime}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <ClipboardList className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                      <span className="font-medium line-clamp-1">{appt.reason}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground italic">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Barangay Health Center</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
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
            ))}
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
                onChange={e => setRemarks(e.target.value)} 
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
    </AppLayout>
  );
}
