import { useState, useEffect, useRef } from "react";
import { useListSchedules, getListSchedulesQueryKey, useCreateSchedule, useUpdateSchedule, useDeleteSchedule } from "@workspace/api-client-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Clock, Plus, Calendar as CalendarIcon, Users, Edit2, Trash2, User, Check } from "lucide-react";

type ScheduleForm = { scheduleDate: string; startTime: string; endTime: string; slotLimit: string; assignedStaff: string; status: string };
const DEFAULT_FORM: ScheduleForm = { scheduleDate: "", startTime: "", endTime: "", slotLimit: "20", assignedStaff: "", status: "open" };

const STATUS_COLORS: Record<string, string> = {
  open: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-gray-100 text-gray-800 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

type HealthWorker = { id: string; fullName: string; email: string; role: string; status: string };

// Custom hook: fetch health workers via the new /api/users endpoint
function useHealthWorkers() {
  return useQuery<HealthWorker[]>({
    queryKey: ["/api/users", "health_worker"],
    queryFn: async () => {
      const res = await fetch("/api/users?role=health_worker", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch health workers");
      return res.json();
    },
    staleTime: 60_000,
  });
}

// Worker Combobox — autocomplete input with dropdown suggestions
function WorkerCombobox({
  value,
  onChange,
  workers,
}: {
  value: string;
  onChange: (v: string) => void;
  workers: HealthWorker[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value changes (e.g. when dialog opens for editing)
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filtered = query.length > 0
    ? workers.filter((w) =>
        w.fullName.toLowerCase().includes(query.toLowerCase()) ||
        w.email.toLowerCase().includes(query.toLowerCase())
      )
    : workers;

  const handleSelect = (worker: HealthWorker) => {
    setQuery(worker.fullName);
    onChange(worker.fullName);
    setOpen(false);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onChange(e.target.value);
    setOpen(true);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          id="staff"
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder="Search or type staff name..."
          className="pl-9"
          autoComplete="off"
          data-testid="input-assigned-staff"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
          {filtered.map((worker) => {
            const isSelected = query === worker.fullName;
            return (
              <button
                key={worker.id}
                type="button"
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted text-left transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(worker);
                }}
              >
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  {worker.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{worker.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{worker.email}</p>
                </div>
                {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
      {open && filtered.length === 0 && query.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg">
          <p className="p-3 text-sm text-muted-foreground text-center">
            No health workers found — "{query}" will be saved as typed.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ManageSchedules() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ScheduleForm>(DEFAULT_FORM);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: schedules, isLoading } = useListSchedules({}, {
    query: { queryKey: getListSchedulesQueryKey() },
  });

  const { data: healthWorkers = [] } = useHealthWorkers();

  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const deleteMutation = useDeleteSchedule();

  const handleSave = () => {
    const data = { ...form, slotLimit: parseInt(form.slotLimit, 10), status: form.status as any };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSchedulesQueryKey() });
          toast({ title: "Schedule updated" });
          setShowDialog(false);
        },
        onError: () => toast({ title: "Failed to update", variant: "destructive" }),
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSchedulesQueryKey() });
          toast({ title: "Schedule created" });
          setShowDialog(false);
        },
        onError: () => toast({ title: "Failed to create", variant: "destructive" }),
      });
    }
  };

  const handleEdit = (sched: any) => {
    setForm({
      scheduleDate: sched.scheduleDate,
      startTime: sched.startTime,
      endTime: sched.endTime,
      slotLimit: String(sched.slotLimit),
      assignedStaff: sched.assignedStaff ?? "",
      status: sched.status,
    });
    setEditingId(sched.id);
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSchedulesQueryKey() });
        toast({ title: "Schedule deleted" });
      },
    });
  };

  const openCreate = () => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
    setShowDialog(true);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Health Schedules</h1>
            <p className="text-muted-foreground mt-1">Manage available checkup slots and staff assignments.</p>
          </div>
          <Button onClick={openCreate} className="bg-green-600 hover:bg-green-700" data-testid="button-add-schedule">
            <Plus className="mr-2 h-4 w-4" /> New Schedule
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
          </div>
        ) : (schedules?.length ?? 0) === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="bg-muted rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-muted-foreground opacity-50" />
              </div>
              <p className="text-lg font-medium">No schedules defined</p>
              <p className="text-muted-foreground mb-6">Start by creating the first available health checkup schedule.</p>
              <Button onClick={openCreate} variant="outline">Create First Schedule</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {schedules?.map((sched) => (
              <Card key={sched.id} data-testid={`row-schedule-${sched.id}`} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-lg leading-tight">{new Date(sched.scheduleDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <p className="text-sm text-muted-foreground">{sched.startTime} - {sched.endTime}</p>
                      </div>
                    </div>
                    <Badge className={`text-[10px] uppercase font-bold tracking-wider ${STATUS_COLORS[sched.status] ?? ""}`}>{sched.status}</Badge>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-2">Slots:</span>
                      <span className="font-semibold">{sched.currentSlots} / {sched.slotLimit}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-2">Staff:</span>
                      <span className="font-semibold truncate">
                        {sched.assignedStaff ? (
                          <span className="flex items-center gap-1.5">
                            <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[9px] font-bold shrink-0">
                              {sched.assignedStaff.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                            </span>
                            {sched.assignedStaff}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">Unassigned</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button size="sm" variant="outline" className="flex-1 h-8" onClick={() => handleEdit(sched)} data-testid={`button-edit-${sched.id}`}>
                      <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50" data-testid={`button-delete-${sched.id}`}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Schedule?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the schedule for {sched.scheduleDate}. Residents will no longer be able to book slots for this date.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(sched.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              {editingId ? "Edit Schedule" : "Create New Schedule"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={form.scheduleDate} onChange={e => setForm(f => ({...f, scheduleDate: e.target.value}))} data-testid="input-schedule-date" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="start">Start Time</Label>
                <Input id="start" type="time" value={form.startTime} onChange={e => setForm(f => ({...f, startTime: e.target.value}))} data-testid="input-start-time" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end">End Time</Label>
                <Input id="end" type="time" value={form.endTime} onChange={e => setForm(f => ({...f, endTime: e.target.value}))} data-testid="input-end-time" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="slots">Slot Limit</Label>
                <Input id="slots" type="number" value={form.slotLimit} onChange={e => setForm(f => ({...f, slotLimit: e.target.value}))} data-testid="input-slot-limit" />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({...f, status: v}))}>
                  <SelectTrigger data-testid="select-schedule-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff">
                Assigned Health Worker
                {healthWorkers.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground font-normal">({healthWorkers.length} available)</span>
                )}
              </Label>
              <WorkerCombobox
                value={form.assignedStaff}
                onChange={(v) => setForm(f => ({ ...f, assignedStaff: v }))}
                workers={healthWorkers}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isPending} className="bg-green-600 hover:bg-green-700" data-testid="button-save-schedule">
              {isPending ? "Saving..." : editingId ? "Update Schedule" : "Create Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
