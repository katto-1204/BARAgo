import { useState } from "react";
import { useListAmbulanceRequests, getListAmbulanceRequestsQueryKey, useUpdateAmbulanceRequest } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, UrgencyBadge } from "@/components/shared/StatusBadges";
import { useToast } from "@/hooks/use-toast";
import { Truck, Search, User, MapPin, Phone, Clock, MoreVertical, CheckCircle2, XCircle, Send, Flag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STATUS_OPTIONS = ["all", "pending", "approved", "dispatched", "completed", "rejected", "cancelled"];

type ActionDialog = {
  type: "approve" | "reject" | "dispatch" | "complete";
  requestId: string;
  patientName: string;
};

export default function ManageAmbulance() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredRequests = requests?.filter(req => 
    req.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.emergencyType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.exactLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ambulance Requests</h1>
          <p className="text-muted-foreground mt-1">Coordinate emergency ambulance assistance and monitor response status.</p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
            <TabsList className="grid grid-cols-4 md:flex w-full">
              {STATUS_OPTIONS.slice(0, 5).map(s => (
                <TabsTrigger key={s} value={s} className="capitalize">
                  {s}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search patients or type..." 
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
        ) : (filteredRequests?.length ?? 0) === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="bg-muted rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Truck className="h-6 w-6 text-muted-foreground opacity-50" />
              </div>
              <p className="text-lg font-medium">No requests found</p>
              <p className="text-muted-foreground">Try adjusting your search or filter.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRequests?.map((req) => (
              <Card key={req.id} className="overflow-hidden border-l-4" style={{ 
                borderLeftColor: req.urgencyLevel === "high" ? "#ef4444" : req.urgencyLevel === "medium" ? "#f59e0b" : "#10b981" 
              }} data-testid={`row-ambulance-${req.id}`}>
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold">{req.patientName}</CardTitle>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {new Date(req.requestedAt).toLocaleString()}
                    </div>
                  </div>
                  <UrgencyBadge urgency={req.urgencyLevel} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Flag className="h-4 w-4 mt-0.5 text-blue-600 shrink-0" />
                      <span className="font-semibold text-foreground">{req.emergencyType}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground line-clamp-2">{req.exactLocation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{req.contactNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <StatusBadge status={req.status} />
                    <div className="flex gap-1">
                      {req.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" className="h-8 border-green-200 text-green-700 hover:bg-green-50" onClick={() => openDialog("approve", req.id, req.patientName)} data-testid={`button-approve-${req.id}`}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 border-red-200 text-red-700 hover:bg-red-50" onClick={() => openDialog("reject", req.id, req.patientName)} data-testid={`button-reject-${req.id}`}>
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      {req.status === "approved" && (
                        <Button size="sm" variant="default" className="h-8 bg-blue-600 hover:bg-blue-700" onClick={() => openDialog("dispatch", req.id, req.patientName)} data-testid={`button-dispatch-${req.id}`}>
                          <Send className="h-3.5 w-3.5 mr-1" /> Dispatch
                        </Button>
                      )}
                      {req.status === "dispatched" && (
                        <Button size="sm" variant="default" className="h-8 bg-green-600 hover:bg-green-700" onClick={() => openDialog("complete", req.id, req.patientName)} data-testid={`button-complete-${req.id}`}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialog?.type === "approve" && <><CheckCircle2 className="h-5 w-5 text-green-500" /> Approve Request</>}
              {dialog?.type === "reject" && <><XCircle className="h-5 w-5 text-red-500" /> Reject Request</>}
              {dialog?.type === "dispatch" && <><Send className="h-5 w-5 text-blue-500" /> Dispatch Ambulance</>}
              {dialog?.type === "complete" && <><CheckCircle2 className="h-5 w-5 text-green-500" /> Mark as Completed</>}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-muted/50 p-3 rounded-lg border">
              <p className="text-sm font-medium">Patient</p>
              <p className="text-base">{dialog?.patientName}</p>
            </div>
            <div className="space-y-1.5">
              <Label>Response Notes (optional)</Label>
              <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add instructions or notes for the resident..." data-testid="input-remarks" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={handleAction} disabled={updateMutation.isPending} data-testid="button-confirm-action" className={dialog?.type === "reject" ? "bg-red-600 hover:bg-red-700" : dialog?.type === "dispatch" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}>
              {updateMutation.isPending ? "Processing..." : "Confirm Action"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

