import { useState } from "react";
import { Link } from "wouter";
import { useListAppointments, getListAppointmentsQueryKey, useCancelAppointment } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, Search, Filter, Clock, Clipboard, MapPin, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = ["all", "pending", "approved", "completed", "rejected", "rescheduled", "cancelled"];

const STATUS_TABS = [
  { value: "all", label: "All", color: "bg-blue-600" },
  { value: "pending", label: "Pending", dot: "bg-yellow-400" },
  { value: "approved", label: "Approved", dot: "bg-green-500" },
  { value: "completed", label: "Completed", dot: "bg-blue-500" },
];

export default function Appointments() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredAppointments = appointments?.filter(appt => {
    const matchesSearch = 
      appt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (appt.preferredDate && appt.preferredDate.includes(searchQuery));
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "border-l-green-500";
      case "pending": return "border-l-yellow-400";
      case "completed": return "border-l-blue-500";
      case "rejected": return "border-l-red-500";
      case "cancelled": return "border-l-gray-400";
      default: return "border-l-gray-200";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Approved</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">Completed</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">Rejected</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100">Cancelled</Badge>;
      case "rescheduled":
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100">Rescheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusMessage = (status: string) => {
    if (status === "approved") {
      return (
        <div className="mt-4 p-2 bg-green-50 text-green-700 text-xs rounded-md flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Your appointment has been approved. Please arrive 15 minutes early.
        </div>
      );
    }
    if (status === "pending") {
      return (
        <div className="mt-4 p-2 bg-yellow-50 text-yellow-700 text-xs rounded-md flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          Your request is being reviewed by the health center staff.
        </div>
      );
    }
    return null;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
          <p className="text-slate-500 mt-1">View and manage your healthcare appointments.</p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by name, reason, or date..." 
              className="pl-9 bg-white border-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 border-slate-200">
            <Filter className="h-4 w-4 text-slate-600" />
          </Button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                statusFilter === tab.value
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              )}
            >
              {tab.dot && <div className={cn("w-2 h-2 rounded-full", tab.dot)} />}
              {tab.label}
              <span className={cn(
                "ml-1 px-1.5 py-0.5 rounded-full text-[10px]",
                statusFilter === tab.value ? "bg-white/20" : "bg-slate-100"
              )}>
                {appointments?.filter(a => tab.value === "all" ? true : a.status === tab.value).length ?? 0}
              </span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
        ) : (filteredAppointments?.length ?? 0) === 0 ? (
          <div className="py-20 text-center">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No appointments found</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-1">
              {searchQuery ? "No appointments match your search criteria." : "You haven't booked any appointments yet."}
            </p>
            {!searchQuery && (
              <Button asChild className="mt-6 bg-green-600 hover:bg-green-700">
                <Link href="/appointments/new">Book your first appointment</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments?.map((appt) => (
              <Card key={appt.id} className={cn("border-none border-l-4 shadow-sm overflow-hidden", getStatusColor(appt.status))} data-testid={`card-appointment-${appt.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0 border border-slate-200">
                        {appt.patientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-bold text-slate-900 leading-tight">{appt.patientName}</h3>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: BG-{new Date(appt.createdAt).getFullYear()}-{appt.id.slice(0, 6).toUpperCase()}</p>
                        </div>
                        
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-xs font-medium">{appt.preferredDate}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-xs font-medium">{appt.preferredTime}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clipboard className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-xs">{appt.reason}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-xs">Barangay Health Center</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(appt.status)}
                      <button className="p-1 hover:bg-slate-50 rounded-full transition-colors">
                        <ChevronRight className="h-5 w-5 text-slate-300" />
                      </button>
                    </div>
                  </div>

                  {getStatusMessage(appt.status)}

                  {appt.status === "pending" && (
                    <div className="mt-4 flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 text-xs font-semibold"
                        onClick={() => handleCancel(appt.id)}
                        data-testid={`button-cancel-${appt.id}`}
                      >
                        Cancel Request
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Button asChild className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg bg-green-600 hover:bg-green-700 md:hidden" data-testid="button-new-appointment-fab">
          <Link href="/appointments/new">
            <Plus className="h-6 w-6" />
          </Link>
        </Button>
      </div>
    </AppLayout>
  );
}
