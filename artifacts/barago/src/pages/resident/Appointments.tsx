import { useState } from "react";
import { Link } from "wouter";
import { useListAppointments, getListAppointmentsQueryKey, useCancelAppointment } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadges";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus } from "lucide-react";

const STATUS_OPTIONS = ["all", "pending", "approved", "rejected", "rescheduled", "completed", "cancelled"];

export default function Appointments() {
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const params = statusFilter !== "all" ? { status: statusFilter } : {};
  const { data: appointments, isLoading } = useListAppointments(params, {
    query: { queryKey: getListAppointmentsQueryKey(params) },
  });

  const cancelMutation = useCancelAppointment();

  const handleCancel = (id: string) => {
    cancelMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        toast({ title: "Appointment cancelled" });
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
            <h1 className="text-2xl font-bold">My Appointments</h1>
            <p className="text-muted-foreground mt-1">Track all your checkup requests</p>
          </div>
          <Button asChild data-testid="button-new-appointment">
            <Link href="/appointments/new">
              <Plus className="mr-2 h-4 w-4" />
              Book Appointment
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-3">
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
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : (appointments?.length ?? 0) === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-muted-foreground">No appointments found</p>
              <Button asChild className="mt-4">
                <Link href="/appointments/new">Book your first appointment</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {appointments?.map((appt) => (
              <Card key={appt.id} data-testid={`card-appointment-${appt.id}`}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{appt.patientName}</span>
                        {appt.patientAge && <span className="text-sm text-muted-foreground">({appt.patientAge} yrs)</span>}
                        <StatusBadge status={appt.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">{appt.reason}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {appt.preferredDate && <span>Date: {appt.preferredDate}</span>}
                        {appt.preferredTime && <span>Time: {appt.preferredTime}</span>}
                      </div>
                      {appt.adminRemarks && (
                        <p className="text-sm bg-muted rounded px-3 py-1.5 text-muted-foreground">
                          Remarks: {appt.adminRemarks}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">Submitted: {new Date(appt.createdAt).toLocaleDateString()}</p>
                    </div>
                    {appt.status === "pending" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" data-testid={`button-cancel-${appt.id}`}>Cancel</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will cancel your appointment request for {appt.patientName}. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep It</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleCancel(appt.id)}>Yes, Cancel</AlertDialogAction>
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
