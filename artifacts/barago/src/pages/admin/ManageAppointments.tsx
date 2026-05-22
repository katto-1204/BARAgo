import React, { useState, useMemo } from "react";
import { useCreateAppointment, useListAppointments, getListAppointmentsQueryKey, useListResidents, getListResidentsQueryKey, useUpdateAppointment } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadges";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Search, Filter, Check, X, Eye, ChevronDown, ChevronUp, Clock, Clipboard, MapPin, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ActionDialog = {
  type: "approve" | "reject" | "reschedule" | "complete";
  appointmentId: string;
  patientName: string;
};

type CreateAppointmentForm = {
  residentId: string;
  patientName: string;
  patientAge: string;
  reason: string;
  preferredDate: string;
  preferredTime: string;
};

const DEFAULT_CREATE_FORM: CreateAppointmentForm = {
  residentId: "",
  patientName: "",
  patientAge: "",
  reason: "",
  preferredDate: "",
  preferredTime: "morning",
};

export default function ManageAppointments() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<ActionDialog | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState<CreateAppointmentForm>(DEFAULT_CREATE_FORM);
  const [remarks, setRemarks] = useState("");
  const [reschedDate, setReschedDate] = useState("");
  const [reschedTime, setReschedTime] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: appointments, isLoading } = useListAppointments({}, {
    query: { queryKey: getListAppointmentsQueryKey({}) },
  });
  const { data: residents = [] } = useListResidents({}, {
    query: { queryKey: getListResidentsQueryKey({}) },
  });

  const updateMutation = useUpdateAppointment();
  const createMutation = useCreateAppointment();

  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments.filter(appt => {
      const matchesStatus = statusFilter === "all" || appt.status === statusFilter;
      const matchesSearch = appt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          appt.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          appt.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [appointments, statusFilter, searchQuery]);

  const counts = useMemo(() => {
    if (!appointments) return { all: 0, pending: 0, approved: 0, rescheduled: 0, completed: 0 };
    return {
      all: appointments.length,
      pending: appointments.filter(a => a.status === "pending").length,
      approved: appointments.filter(a => a.status === "approved").length,
      rescheduled: appointments.filter(a => a.status === "rescheduled").length,
      completed: appointments.filter(a => a.status === "completed").length,
    };
  }, [appointments]);

  const handleAction = () => {
    if (!dialog) return;
    const statusMap: Record<string, string> = {
      approve: "approved",
      reject: "rejected",
      reschedule: "rescheduled",
      complete: "completed",
    };
    const payload: Record<string, any> = { status: statusMap[dialog.type] };
    if (remarks) payload.adminRemarks = remarks;
    if (dialog.type === "reschedule" && reschedDate) payload.preferredDate = reschedDate;
    if (dialog.type === "reschedule" && reschedTime) payload.preferredTime = reschedTime;

    updateMutation.mutate({ id: dialog.appointmentId, data: payload }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        toast({ title: `Appointment ${statusMap[dialog.type]}` });
        setDialog(null);
        setRemarks("");
        setReschedDate("");
        setReschedTime("");
      },
      onError: () => toast({ title: "Action failed", variant: "destructive" }),
    });
  };

  const openDialog = (type: ActionDialog["type"], id: string, name: string) => {
    setRemarks("");
    setReschedDate("");
    setReschedTime("");
    setDialog({ type, appointmentId: id, patientName: name });
  };

  const handleResidentSelect = (residentId: string) => {
    const selected = residents.find((resident) => resident.id === residentId);
    setCreateForm((current) => ({
      ...current,
      residentId,
      patientName: selected?.user?.fullName ?? current.patientName,
      patientAge: selected?.age ? String(selected.age) : current.patientAge,
    }));
  };

  const getErrorMessage = (error: unknown, fallback: string) =>
    (error as { response?: { data?: { error?: string; message?: string; details?: string } } })?.response?.data?.error ||
    (error as { response?: { data?: { error?: string; message?: string; details?: string } } })?.response?.data?.message ||
    fallback;

  const handleCreateAppointment = () => {
    if (!createForm.residentId || !createForm.patientName || !createForm.reason || !createForm.preferredDate || !createForm.preferredTime) {
      toast({ title: "Complete the appointment details", variant: "destructive" });
      return;
    }

    const payload = {
      residentId: createForm.residentId,
      patientName: createForm.patientName.trim(),
      patientAge: createForm.patientAge ? Number(createForm.patientAge) : undefined,
      reason: createForm.reason.trim(),
      preferredDate: createForm.preferredDate,
      preferredTime: createForm.preferredTime,
    };

    createMutation.mutate({
      data: payload as any,
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        toast({ title: "Appointment created" });
        setShowCreateDialog(false);
        setCreateForm(DEFAULT_CREATE_FORM);
      },
      onError: (error) => toast({
        title: "Failed to create appointment",
        description: getErrorMessage(error, "Please check the appointment details and try again."),
        variant: "destructive",
      }),
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Manage Appointments</h1>
            <p className="text-muted-foreground mt-1">Review, create, and act on appointment requests</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-green-600 hover:bg-green-700 gap-2">
            <Plus className="h-4 w-4" />
            Create Appointment
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
            <TabsList className="bg-transparent h-auto p-0 flex-wrap gap-2">
              <TabsTrigger value="all" className="rounded-full border data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-1.5 h-auto">
                All [{counts.all}]
              </TabsTrigger>
              <TabsTrigger value="pending" className="rounded-full border data-[state=active]:bg-yellow-500 data-[state=active]:text-white px-4 py-1.5 h-auto">
                Pending [{counts.pending}]
              </TabsTrigger>
              <TabsTrigger value="approved" className="rounded-full border data-[state=active]:bg-green-600 data-[state=active]:text-white px-4 py-1.5 h-auto">
                Approved [{counts.approved}]
              </TabsTrigger>
              <TabsTrigger value="rescheduled" className="rounded-full border data-[state=active]:bg-blue-600 data-[state=active]:text-white px-4 py-1.5 h-auto">
                Rescheduled [{counts.rescheduled}]
              </TabsTrigger>
              <TabsTrigger value="completed" className="rounded-full border data-[state=active]:bg-green-800 data-[state=active]:text-white px-4 py-1.5 h-auto">
                Completed [{counts.completed}]
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, reason, or ID..." 
                className="pl-10 bg-white" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left border-b">
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Patient</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Date & Time</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Reason</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Status</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white">
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i}><td colSpan={5} className="p-4"><Skeleton className="h-16 w-full" /></td></tr>
                  ))
                ) : filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      No appointments found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appt) => (
                    <React.Fragment key={appt.id}>
                      <tr 
                        className={`hover:bg-muted/30 transition-colors cursor-pointer ${expandedId === appt.id ? 'bg-muted/30' : ''}`}
                        onClick={() => setExpandedId(expandedId === appt.id ? null : appt.id)}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                {appt.patientName.split(" ").map(n => n[0]).join("").toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold">{appt.patientName}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">BG-{appt.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs">
                              <Calendar className="h-3 w-3 text-primary" />
                              <span className="font-medium">{appt.preferredDate}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>Requested: 10:30 AM</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <Clipboard className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium text-xs">{appt.reason}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <StatusBadge status={appt.status} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={(e) => { e.stopPropagation(); openDialog("approve", appt.id, appt.patientName); }} disabled={appt.status !== 'pending' && appt.status !== 'rescheduled'}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); openDialog("reject", appt.id, appt.patientName); }} disabled={appt.status !== 'pending'}>
                              <X className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); openDialog("reschedule", appt.id, appt.patientName); }} disabled={appt.status !== 'pending'}>
                              <Calendar className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {expandedId === appt.id ? <ChevronUp className="h-4 w-4 ml-1 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground" />}
                          </div>
                        </td>
                      </tr>
                      {expandedId === appt.id && (
                        <tr className="bg-muted/20 border-t">
                          <td colSpan={5} className="p-6">
                            <div className="grid gap-6 md:grid-cols-2">
                              <div className="space-y-4">
                                <h4 className="font-bold text-sm underline decoration-primary decoration-2 underline-offset-4">Appointment Info</h4>
                                <div className="space-y-3">
                                  <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 text-primary mt-0.5" />
                                    <div>
                                      <p className="text-xs font-bold uppercase text-muted-foreground">Location</p>
                                      <p className="text-sm font-medium">BaraGo Health Center</p>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-3">
                                    <Clipboard className="h-4 w-4 text-primary mt-0.5" />
                                    <div>
                                      <p className="text-xs font-bold uppercase text-muted-foreground">Service / Reason</p>
                                      <p className="text-sm font-medium">{appt.reason}</p>
                                    </div>
                                  </div>
                                  {appt.adminRemarks && (
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                      <p className="text-[10px] font-bold uppercase text-blue-700 mb-1">Admin Remarks</p>
                                      <p className="text-sm text-blue-900">{appt.adminRemarks}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-4">
                                <h4 className="font-bold text-sm underline decoration-primary decoration-2 underline-offset-4">Admin Actions</h4>
                                <div className="space-y-3">
                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Quick Change Status</Label>
                                    <Select value={appt.status} onValueChange={(val) => openDialog(val as any, appt.id, appt.patientName)}>
                                      <SelectTrigger className="bg-white h-9">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="approved">Approve</SelectItem>
                                        <SelectItem value="rejected">Reject</SelectItem>
                                        <SelectItem value="rescheduled">Reschedule</SelectItem>
                                        <SelectItem value="completed">Complete</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => openDialog("approve", appt.id, appt.patientName)} disabled={appt.status !== 'pending' && appt.status !== 'rescheduled'}>Approve</Button>
                                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openDialog("reschedule", appt.id, appt.patientName)} disabled={appt.status !== 'pending'}>Reschedule</Button>
                                    <Button size="sm" variant="destructive" className="flex-1" onClick={() => openDialog("reject", appt.id, appt.patientName)} disabled={appt.status !== 'pending'}>Reject</Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog?.type === "approve" && "Approve Appointment"}
              {dialog?.type === "reject" && "Reject Appointment"}
              {dialog?.type === "reschedule" && "Reschedule Appointment"}
              {dialog?.type === "complete" && "Mark as Completed"}
            </DialogTitle>
            <DialogDescription>
              Confirm the appointment action and add remarks when needed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">Patient: <span className="font-medium text-foreground">{dialog?.patientName}</span></p>
            {dialog?.type === "reschedule" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>New Date</Label>
                  <Input type="date" value={reschedDate} onChange={e => setReschedDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>New Time</Label>
                  <Select value={reschedTime} onValueChange={setReschedTime}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (8 AM - 12 PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (1 PM - 5 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Remarks (optional)</Label>
              <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add remarks for the resident..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={handleAction} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Create Appointment</DialogTitle>
            <DialogDescription>
              Create a checkup appointment for a registered resident.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Resident</Label>
              <Select value={createForm.residentId} onValueChange={handleResidentSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select resident" />
                </SelectTrigger>
                <SelectContent>
                  {residents.map((resident) => (
                    <SelectItem key={resident.id} value={resident.id}>
                      {resident.user?.fullName ?? "Unnamed Resident"} - {resident.user?.email ?? "No email"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Patient Name</Label>
                <Input value={createForm.patientName} onChange={(e) => setCreateForm((f) => ({ ...f, patientName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Patient Age</Label>
                <Input type="number" value={createForm.patientAge} onChange={(e) => setCreateForm((f) => ({ ...f, patientAge: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Textarea value={createForm.reason} onChange={(e) => setCreateForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Describe the appointment reason..." />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Preferred Date</Label>
                <Input type="date" value={createForm.preferredDate} onChange={(e) => setCreateForm((f) => ({ ...f, preferredDate: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Preferred Time</Label>
                <Select value={createForm.preferredTime} onValueChange={(value) => setCreateForm((f) => ({ ...f, preferredTime: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (8 AM - 12 PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (1 PM - 5 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateAppointment} disabled={createMutation.isPending} className="bg-green-600 hover:bg-green-700">
              {createMutation.isPending ? "Creating..." : "Create Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
