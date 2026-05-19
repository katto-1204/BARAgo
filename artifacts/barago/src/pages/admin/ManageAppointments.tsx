import { useState } from "react";
import { useListAppointments, getListAppointmentsQueryKey, useUpdateAppointment, useCancelAppointment } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadges";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";

const STATUS_OPTIONS = ["all", "pending", "approved", "rejected", "rescheduled", "completed", "cancelled"];

type ActionDialog = {
  type: "approve" | "reject" | "reschedule" | "complete";
  appointmentId: string;
  patientName: string;
};

export default function ManageAppointments() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialog, setDialog] = useState<ActionDialog | null>(null);
  const [remarks, setRemarks] = useState("");
  const [reschedDate, setReschedDate] = useState("");
  const [reschedTime, setReschedTime] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const params = statusFilter !== "all" ? { status: statusFilter } : {};
  const { data: appointments, isLoading } = useListAppointments(params, {
    query: { queryKey: getListAppointmentsQueryKey(params) },
  });

  const updateMutation = useUpdateAppointment();

  const handleAction = () => {
    if (!dialog) return;
    const statusMap: Record<string, string> = {
      approve: "approved",
      reject: "rejected",
      reschedule: "rescheduled",
      complete: "completed",
    };
    const payload: Record<string, string> = { status: statusMap[dialog.type] };
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Appointments</h1>
          <p className="text-muted-foreground mt-1">Review and act on appointment requests</p>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="select-status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(s => (
              <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : (appointments?.length ?? 0) === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">No appointments found</p>
          </CardContent></Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">Patient</th>
                  <th className="px-4 py-3 font-medium">Date / Time</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments?.map((appt) => (
                  <tr key={appt.id} data-testid={`row-appointment-${appt.id}`} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{appt.patientName}</p>
                      {appt.resident?.user?.fullName && appt.resident.user.fullName !== appt.patientName && (
                        <p className="text-xs text-muted-foreground">Resident: {appt.resident.user.fullName}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <p>{appt.preferredDate}</p>
                      <p>{appt.preferredTime}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs">
                      <p className="truncate">{appt.reason}</p>
                      {appt.adminRemarks && <p className="text-xs truncate text-primary">{appt.adminRemarks}</p>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={appt.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {appt.status === "pending" && (
                          <>
                            <Button size="sm" onClick={() => openDialog("approve", appt.id, appt.patientName)} data-testid={`button-approve-${appt.id}`}>Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => openDialog("reject", appt.id, appt.patientName)} data-testid={`button-reject-${appt.id}`}>Reject</Button>
                            <Button size="sm" variant="outline" onClick={() => openDialog("reschedule", appt.id, appt.patientName)} data-testid={`button-reschedule-${appt.id}`}>Reschedule</Button>
                          </>
                        )}
                        {appt.status === "approved" && (
                          <Button size="sm" variant="outline" onClick={() => openDialog("complete", appt.id, appt.patientName)} data-testid={`button-complete-${appt.id}`}>Complete</Button>
                        )}
                        {appt.status === "rescheduled" && (
                          <>
                            <Button size="sm" onClick={() => openDialog("approve", appt.id, appt.patientName)}>Approve</Button>
                            <Button size="sm" variant="outline" onClick={() => openDialog("complete", appt.id, appt.patientName)}>Complete</Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">Patient: <span className="font-medium text-foreground">{dialog?.patientName}</span></p>
            {dialog?.type === "reschedule" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>New Date</Label>
                  <Input type="date" value={reschedDate} onChange={e => setReschedDate(e.target.value)} data-testid="input-reschedule-date" />
                </div>
                <div className="space-y-1.5">
                  <Label>New Time</Label>
                  <Select value={reschedTime} onValueChange={setReschedTime}>
                    <SelectTrigger data-testid="select-reschedule-time"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Remarks (optional)</Label>
              <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add remarks for the resident..." data-testid="input-remarks" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={handleAction} disabled={updateMutation.isPending} data-testid="button-confirm-action">
              {updateMutation.isPending ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
