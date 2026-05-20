import { useState } from "react";
import { useListResidents, getListResidentsQueryKey, useVerifyResident, useDisableResident } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Users, Search, Filter, ShieldCheck, ShieldAlert, UserX, UserCheck, MapPin, Phone, Mail } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ManageResidents() {
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: residents, isLoading } = useListResidents({}, {
    query: { queryKey: getListResidentsQueryKey() },
  });

  const verifyMutation = useVerifyResident();
  const disableMutation = useDisableResident();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const filtered = (residents ?? []).filter(r => {
    const s = search.toLowerCase();
    const matchesSearch = (
      (r.user?.fullName ?? "").toLowerCase().includes(s) ||
      (r.user?.email ?? "").toLowerCase().includes(s) ||
      (r.address ?? "").toLowerCase().includes(s) ||
      (r.contactNumber ?? "").toLowerCase().includes(s)
    );

    if (filterTab === "all") return matchesSearch;
    if (filterTab === "verified") return matchesSearch && r.verified;
    if (filterTab === "unverified") return matchesSearch && !r.verified;
    if (filterTab === "disabled") return matchesSearch && r.user?.status === "disabled";
    return matchesSearch;
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
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Manage Residents</h1>
          <p className="text-muted-foreground">View and manage registered resident accounts, verification, and status.</p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Tabs value={filterTab} onValueChange={setFilterTab} className="w-full md:w-auto">
            <TabsList className="grid grid-cols-4 md:flex w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="unverified">Unverified</TabsTrigger>
              <TabsTrigger value="disabled">Disabled</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name, email, or address..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              data-testid="input-search-residents"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Card key={i} className="w-full">
                <CardContent className="p-4 flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="bg-muted rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-muted-foreground opacity-50" />
              </div>
              <p className="text-lg font-medium">No residents found</p>
              <p className="text-muted-foreground">{search ? "Try adjusting your search query." : "No residents are currently registered."}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filtered.map((resident) => (
              <Card key={resident.id} data-testid={`row-resident-${resident.id}`} className="hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 p-4">
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-12 w-12 border-2 border-primary/10">
                        <AvatarFallback className="bg-primary/5 text-primary font-bold">
                          {getInitials(resident.user?.fullName ?? "R")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base leading-none">{resident.user?.fullName}</h3>
                          {resident.verified ? (
                            <ShieldCheck className="h-4 w-4 text-green-600" />
                          ) : (
                            <ShieldAlert className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {resident.user?.email}</span>
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {resident.contactNumber}</span>
                        </div>
                        <div className="flex items-start gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                          <span>{resident.address}{resident.purok && `, ${resident.purok}`}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:ml-auto">
                      <Badge variant="outline" className={resident.verified ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}>
                        {resident.verified ? "Verified" : "Unverified"}
                      </Badge>
                      <Badge variant="outline" className={resident.user?.status === "active" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-red-50 text-red-700 border-red-200"}>
                        {resident.user?.status}
                      </Badge>
                      
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleVerify(resident.id, !resident.verified)}
                          disabled={verifyMutation.isPending}
                          title={resident.verified ? "Unverify Resident" : "Verify Resident"}
                          data-testid={`button-verify-${resident.id}`}
                        >
                          {resident.verified ? <ShieldAlert className="h-4 w-4 text-orange-500" /> : <ShieldCheck className="h-4 w-4 text-green-600" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleToggleStatus(resident.id, resident.user?.status ?? "active")}
                          disabled={disableMutation.isPending}
                          title={resident.user?.status === "active" ? "Disable Account" : "Enable Account"}
                          data-testid={`button-toggle-status-${resident.id}`}
                        >
                          {resident.user?.status === "active" ? <UserX className="h-4 w-4 text-red-500" /> : <UserCheck className="h-4 w-4 text-blue-600" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <p className="text-xs text-muted-foreground text-right px-1 mt-2">
              Showing {filtered.length} of {residents?.length ?? 0} residents
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

