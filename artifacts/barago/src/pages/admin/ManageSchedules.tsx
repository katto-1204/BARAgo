import { useState } from "react";
import { useListSchedules, getListSchedulesQueryKey, useCreateSchedule, useUpdateSchedule, useDeleteSchedule } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Clock, Plus } from "lucide-react";

type ScheduleForm = { scheduleDate: string; startTime: string; endTime: string; slotLimit: string; assignedStaff: string; status: string };
const DEFAULT_FORM: ScheduleForm = { scheduleDate: "", startTime: "", endTime: "", slotLimit: "20", assignedStaff: "", status: "open" };

const STATUS_COLORS: Record<string, string> = {
  open: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-gray-100 text-gray-800 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function ManageSchedules() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ScheduleForm>(DEFAULT_FORM);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: schedules, isLoading } = useListSchedules({}, {
    query: { queryKey: getListSchedulesQueryKey() },
  });

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
            <h1 className="text-2xl font-bold">Manage Schedules</h1>
            <p className="text-muted-foreground mt-1">Create and manage available checkup schedules</p>
          </div>
          <Button onClick={openCreate} data-testid="button-add-schedule">
            <Plus className="mr-2 h-4 w-4" /> Add Schedule
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : (schedules?.length ?? 0) === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">No schedules yet</p>
            <Button onClick={openCreate} className="mt-4">Create first schedule</Button>
          </CardContent></Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Slots</th>
                  <th className="px-4 py-3 font-medium">Staff</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules?.map((sched) => (
                  <tr key={sched.id} data-testid={`row-schedule-${sched.id}`} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{sched.scheduleDate}</td>
                    <td className="px-4 py-3 text-muted-foreground">{sched.startTime} - {sched.endTime}</td>
                    <td className="px-4 py-3 text-muted-foreground">{sched.currentSlots} / {sched.slotLimit}</td>
                    <td className="px-4 py-3 text-muted-foreground">{sched.assignedStaff ?? "-"}</td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${STATUS_COLORS[sched.status] ?? ""}`}>{sched.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(sched)} data-testid={`button-edit-${sched.id}`}>Edit</Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" data-testid={`button-delete-${sched.id}`}>Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Schedule?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently delete the schedule for {sched.scheduleDate}.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(sched.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? "Edit Schedule" : "Add Schedule"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={form.scheduleDate} onChange={e => setForm(f => ({...f, scheduleDate: e.target.value}))} data-testid="input-schedule-date" />
              </div>
              <div className="space-y-1.5">
                <Label>Slot Limit</Label>
                <Input type="number" value={form.slotLimit} onChange={e => setForm(f => ({...f, slotLimit: e.target.value}))} data-testid="input-slot-limit" />
              </div>
              <div className="space-y-1.5">
                <Label>Start Time</Label>
                <Input type="time" value={form.startTime} onChange={e => setForm(f => ({...f, startTime: e.target.value}))} data-testid="input-start-time" />
              </div>
              <div className="space-y-1.5">
                <Label>End Time</Label>
                <Input type="time" value={form.endTime} onChange={e => setForm(f => ({...f, endTime: e.target.value}))} data-testid="input-end-time" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Assigned Staff</Label>
              <Input value={form.assignedStaff} onChange={e => setForm(f => ({...f, assignedStaff: e.target.value}))} placeholder="Doctor, nurse, or health worker name" data-testid="input-assigned-staff" />
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isPending} data-testid="button-save-schedule">
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
