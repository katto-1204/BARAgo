import { useState } from "react";
import { Link } from "wouter";
import { useListAmbulanceRequests, getListAmbulanceRequestsQueryKey, useCancelAmbulanceRequest } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, UrgencyBadge } from "@/components/shared/StatusBadges";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Truck, Plus } from "lucide-react";

const STATUS_OPTIONS = ["all", "pending", "approved", "rejected", "dispatched", "completed", "cancelled"];

export default function AmbulanceRequests() {
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const params = statusFilter !== "all" ? { status: statusFilter } : {};
  const { data: requests, isLoading } = useListAmbulanceRequests(params, {
    query: { queryKey: getListAmbulanceRequestsQueryKey(params) },
  });

  const cancelMutation = useCancelAmbulanceRequest();

  const handleCancel = (id: string) => {
    cancelMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAmbulanceRequestsQueryKey() });
        toast({ title: "Request cancelled" });
      },
      onError: () => {
        toast({ title: "Failed to cancel", variant: "destructive" });
      },
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Ambulance Requests</h1>
            <p className="text-muted-foreground mt-1">Track your emergency assistance requests</p>
          </div>
          <Button asChild data-testid="button-new-ambulance">
            <Link href="/ambulance/new">
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Link>
          </Button>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(s => (
              <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : (requests?.length ?? 0) === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Truck className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-muted-foreground">No ambulance requests found</p>
              <Button asChild className="mt-4">
                <Link href="/ambulance/new">Submit a request</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {requests?.map((req) => (
              <Card key={req.id} data-testid={`card-ambulance-${req.id}`}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{req.patientName}</span>
                        <UrgencyBadge urgency={req.urgencyLevel} />
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">{req.emergencyType}</p>
                      <p className="text-sm text-muted-foreground">Location: {req.exactLocation}</p>
                      {req.description && <p className="text-sm text-muted-foreground">{req.description}</p>}
                      {req.adminRemarks && (
                        <p className="text-sm bg-muted rounded px-3 py-1.5 text-muted-foreground">
                          Remarks: {req.adminRemarks}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">Requested: {new Date(req.requestedAt).toLocaleString()}</p>
                    </div>
                    {req.status === "pending" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" data-testid={`button-cancel-${req.id}`}>Cancel</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Request?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will cancel your ambulance request. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep It</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleCancel(req.id)}>Yes, Cancel</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
