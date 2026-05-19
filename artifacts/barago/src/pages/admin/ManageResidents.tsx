import { useState } from "react";
import { useListResidents, getListResidentsQueryKey, useVerifyResident, useDisableResident } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Users, Search } from "lucide-react";

export default function ManageResidents() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: residents, isLoading } = useListResidents({}, {
    query: { queryKey: getListResidentsQueryKey() },
  });

  const verifyMutation = useVerifyResident();
  const disableMutation = useDisableResident();

  const filtered = (residents ?? []).filter(r => {
    const s = search.toLowerCase();
    return (
      (r.user?.fullName ?? "").toLowerCase().includes(s) ||
      (r.user?.email ?? "").toLowerCase().includes(s) ||
      (r.address ?? "").toLowerCase().includes(s) ||
      (r.contactNumber ?? "").toLowerCase().includes(s)
    );
  });

  const handleVerify = (id: string, verified: boolean) => {
    verifyMutation.mutate({ id, data: { verified } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListResidentsQueryKey() });
        toast({ title: verified ? "Resident verified" : "Verification removed" });
      },
    });
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "disabled" : "active";
    disableMutation.mutate({ id, data: { status: newStatus as any } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListResidentsQueryKey() });
        toast({ title: `Account ${newStatus === "active" ? "enabled" : "disabled"}` });
      },
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Residents</h1>
          <p className="text-muted-foreground mt-1">View and manage registered resident accounts</p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, email, or address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            data-testid="input-search-residents"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">{search ? "No residents match your search" : "No residents registered"}</p>
          </CardContent></Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Address / Purok</th>
                  <th className="px-4 py-3 font-medium">Verified</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((resident) => (
                  <tr key={resident.id} data-testid={`row-resident-${resident.id}`} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{resident.user?.fullName}</p>
                      <p className="text-xs text-muted-foreground">{resident.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{resident.contactNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <p>{resident.address}</p>
                      {resident.purok && <p className="text-xs">{resident.purok}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={resident.verified ? "bg-green-100 text-green-800 border-green-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}>
                        {resident.verified ? "Verified" : "Unverified"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={resident.user?.status === "active" ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}>
                        {resident.user?.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerify(resident.id, !resident.verified)}
                          disabled={verifyMutation.isPending}
                          data-testid={`button-verify-${resident.id}`}
                        >
                          {resident.verified ? "Unverify" : "Verify"}
                        </Button>
                        <Button
                          size="sm"
                          variant={resident.user?.status === "active" ? "destructive" : "outline"}
                          onClick={() => handleToggleStatus(resident.id, resident.user?.status ?? "active")}
                          disabled={disableMutation.isPending}
                          data-testid={`button-toggle-status-${resident.id}`}
                        >
                          {resident.user?.status === "active" ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-muted-foreground mt-2 px-1">Showing {filtered.length} of {residents?.length ?? 0} residents</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
