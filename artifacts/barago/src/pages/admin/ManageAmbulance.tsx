import { useState } from "react";
import { useListAmbulanceRequests, getListAmbulanceRequestsQueryKey, useUpdateAmbulanceRequest } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, UrgencyBadge } from "@/components/shared/StatusBadges";
import { useToast } from "@/hooks/use-toast";
import { Truck } from "lucide-react";

const STATUS_OPTIONS = ["all", "pending", "approved", "rejected", "dispatched", "completed", "cancelled"];

type ActionDialog = {
  type: "approve" | "reject" | "dispatch" | "complete";
  requestId: string;
  patientName: string;
};

export default function ManageAmbulance() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialog, setDialog] = useState<ActionDialog | null>(null);
  const [remarks, setRemarks] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const params = statusFilter !== "all" ? { status: statusFilter } : {};
  const { data: requests, isLoading } = useListAmbulanceRequests(params, {
    query: { queryKey: getListAmbulanceRequestsQueryKey(params) },
  });

  const updateMutation = useUpdateAmbulanceRequest();

  const handleAction = () => {
    if (!dialog) return;
    const statusMap: Record<string, string> = {
      approve: "approved",
      reject: "rejected",
      dispatch: "dispatched",
      complete: "completed",
    };
    updateMutation.mutate({ id: dialog.requestId, data: { status: statusMap[dialog.type] as any, adminRemarks: remarks || undefined }}, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAmbulanceRequestsQueryKey() });
        toast({ title: `Request ${statusMap[dialog.type]}` });
        setDialog(null);
        setRemarks("");
      },
      onError: () => toast({ title: "Action failed", variant: "destructive" }),
    });
  };

  const openDialog = (type: ActionDialog["type"], id: string, name: string) => {
    setRemarks("");
    setDialog({ type, requestId: id, patientName: name });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Ambulance Requests</h1>
          <p className="text-muted-foreground mt-1">Coordinate emergency ambulance assistance</p>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="select-status-filter"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(s => (
              <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : (requests?.length ?? 0) === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <Truck className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">No ambulance requests</p>
          </CardContent></Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">Patient</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Emergency Type</th>
                  <th className="px-4 py-3 font-medium">Urgency</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests?.map((req) => (
                  <tr key={req.id} data-testid={`row-ambulance-${req.id}`} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{req.patientName}</p>
                      <p className="text-xs text-muted-foreground">{req.contactNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[160px]">
                      <p className="truncate">{req.exactLocation}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{req.emergencyType}</td>
                    <td className="px-4 py-3"><UrgencyBadge urgency={req.urgencyLevel} /></td>
                    <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {req.status === "pending" && (
                          <>
                            <Button size="sm" onClick={() => openDialog("approve", req.id, req.patientName)} data-testid={`button-approve-${req.id}`}>Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => openDialog("reject", req.id, req.patientName)} data-testid={`button-reject-${req.id}`}>Reject</Button>
                          </>
                        )}
                        {req.status === "approved" && (
                          <Button size="sm" onClick={() => openDialog("dispatch", req.id, req.patientName)} data-testid={`button-dispatch-${req.id}`}>Dispatch</Button>
                        )}
                        {(req.status === "approved" || req.status === "dispatched") && (
                          <Button size="sm" variant="outline" onClick={() => openDialog("complete", req.id, req.patientName)} data-testid={`button-complete-${req.id}`}>Complete</Button>
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
              {dialog?.type === "approve" && "Approve Request"}
              {dialog?.type === "reject" && "Reject Request"}
              {dialog?.type === "dispatch" && "Dispatch Ambulance"}
              {dialog?.type === "complete" && "Mark as Completed"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">Patient: <span className="font-medium text-foreground">{dialog?.patientName}</span></p>
            <div className="space-y-1.5">
              <Label>Response Notes (optional)</Label>
              <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add notes for the resident..." data-testid="input-remarks" />
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
