import { useState } from "react";
import { useListAppointments, getListAppointmentsQueryKey, useUpdateAppointment } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadges";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";

export default function HealthWorkerDashboard() {
  const [dialog, setDialog] = useState<{ id: string; name: string } | null>(null);
  const [remarks, setRemarks] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: appointments, isLoading } = useListAppointments({ status: "approved" }, {
    query: { queryKey: getListAppointmentsQueryKey({ status: "approved" }) },
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Approved Appointments</h1>
          <p className="text-muted-foreground mt-1">Mark completed checkups and add remarks</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : (appointments?.length ?? 0) === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">No approved appointments pending checkup</p>
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
                      {appt.patientAge && <p className="text-xs text-muted-foreground">{appt.patientAge} yrs</p>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <p>{appt.preferredDate}</p>
                      <p>{appt.preferredTime}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{appt.reason}</td>
                    <td className="px-4 py-3"><StatusBadge status={appt.status} /></td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        onClick={() => { setRemarks(""); setDialog({ id: appt.id, name: appt.patientName }); }}
                        data-testid={`button-complete-${appt.id}`}
                      >
                        Mark Complete
                      </Button>
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
          <DialogHeader><DialogTitle>Complete Checkup</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">Patient: <span className="font-medium text-foreground">{dialog?.name}</span></p>
            <div className="space-y-1.5">
              <Label>Consultation Remarks (optional)</Label>
              <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="e.g. Prescribed medication, follow-up in 2 weeks..." data-testid="input-remarks" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={handleComplete} disabled={updateMutation.isPending} data-testid="button-confirm-complete">
              {updateMutation.isPending ? "Saving..." : "Mark as Completed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
