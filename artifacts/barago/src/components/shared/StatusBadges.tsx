import { Badge } from "@/components/ui/badge";

export function AppointmentStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    case "approved":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
    case "completed":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>;
    case "rejected":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
    case "cancelled":
      return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Cancelled</Badge>;
    case "rescheduled":
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Rescheduled</Badge>;
    case "dispatched":
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Dispatched</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function AmbulanceStatusBadge({ status }: { status: string }) {
  return <AppointmentStatusBadge status={status} />;
}

export function StatusBadge({ status }: { status: string }) {
  return <AppointmentStatusBadge status={status} />;
}

export function UrgencyBadge({ urgency, level }: { urgency?: string; level?: string }) {
  const value = urgency ?? level ?? "";
  switch (value) {
    case "low":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
    case "medium":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>;
    case "high":
      return <Badge className="bg-red-100 text-red-800 border-red-200">High</Badge>;
    default:
      return <Badge variant="outline">{value}</Badge>;
  }
}
