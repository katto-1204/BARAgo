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
import { Truck, Plus, Calendar, Clock, MapPin, ClipboardList } from "lucide-react";
import { format } from "date-fns";

const STATUS_OPTIONS = ["all", "pending", "approved", "rejected", "dispatched", "completed", "cancelled"];

const URGENCY_BORDER: Record<string, string> = {
  high: "border-l-4 border-l-red-500",
  medium: "border-l-4 border-l-yellow-500",
  low: "border-l-4 border-l-blue-500",
};

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
            <h1 className="text-2xl font-bold font-heading">Ambulance Requests</h1>
            <p className="text-muted-foreground mt-1">Track your emergency assistance requests</p>
          </div>
          <Button asChild data-testid="button-new-ambulance" className="bg-destructive hover:bg-destructive/90 text-white shadow-sm">
            <Link href="/ambulance/new">
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-card" data-testid="select-status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(s => (
                <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        ) : (requests?.length ?? 0) === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Truck className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-muted-foreground">No ambulance requests found</p>
              <Button asChild className="mt-4 bg-primary">
                <Link href="/ambulance/new">Submit a request</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests?.map((req) => (
              <Card key={req.id} data-testid={`card-ambulance-${req.id}`} className={`overflow-hidden transition-all hover:shadow-md ${URGENCY_BORDER[req.urgencyLevel] || "border-l-4 border-l-gray-300"}`}>
                <CardContent className="p-0">
                  <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{req.patientName}</span>
                          <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">ID: {req.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <StatusBadge status={req.status} />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ClipboardList className="h-4 w-4 text-primary" />
                          <span className="font-medium text-foreground">{req.emergencyType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 text-warning" />
                          <UrgencyBadge urgency={req.urgencyLevel} />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2">
                          <MapPin className="h-4 w-4 text-destructive" />
                          <span className="truncate">Location: {req.exactLocation}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span>Requested: {format(new Date(req.requestedAt), "MMM dd, yyyy · hh:mm a")}</span>
                        </div>
                      </div>

                      {req.description && (
                        <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-md italic">
                          "{req.description}"
                        </p>
                      )}

                      {req.adminRemarks && (
                        <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Admin Remarks</p>
                          <p className="text-sm text-foreground">{req.adminRemarks}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 self-end md:self-start">
                      {req.status === "pending" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/10" data-testid={`button-cancel-${req.id}`}>Cancel Request</Button>
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
                              <AlertDialogAction onClick={() => handleCancel(req.id)} className="bg-destructive text-white hover:bg-destructive/90">Yes, Cancel</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                  
                  {req.status === "approved" && (
                    <div className="bg-green-50 px-5 py-2 border-t border-green-100">
                      <p className="text-xs text-green-700 flex items-center gap-1.5 font-medium">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        Request approved. An ambulance is being prepared for dispatch.
                      </p>
                    </div>
                  )}
                  {req.status === "dispatched" && (
                    <div className="bg-blue-50 px-5 py-2 border-t border-blue-100">
                      <p className="text-xs text-blue-700 flex items-center gap-1.5 font-medium">
                        <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        Ambulance has been dispatched and is on its way.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
