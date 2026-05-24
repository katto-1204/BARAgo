import { useLocation, Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateAppointment, getListAppointmentsQueryKey, useListSchedules } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, ChevronDown, User, Calendar as CalendarIcon, Clock, Info,
  CheckCircle2, Heart, Stethoscope
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

const schema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  patientAge: z.preprocess(
    (value) => value === "" || value === undefined ? undefined : Number(value),
    z.number().int().positive().max(99, "Age must be 2 digits only").optional()
  ),
  reason: z.string().min(1, "Reason is required"),
  scheduleId: z.string().min(1, "Please choose an available schedule"),
  preferredDate: z.string().min(1, "Preferred date is required"),
  preferredTime: z.string().min(1, "Preferred time is required"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const REASONS = [
  "General Checkup",
  "Fever / Flu",
  "Follow-up",
  "Blood Pressure Check",
  "Vaccination",
  "Prenatal",
  "Dental",
  "Other"
];

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function NewAppointment() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateAppointment();
  const { data: schedules, isLoading: isSchedulesLoading, isError: isSchedulesError } = useListSchedules({ status: "open" });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientName: "",
      reason: "",
      scheduleId: "",
      preferredDate: "",
      preferredTime: "",
      notes: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate({ data: {
      patientName: values.patientName,
      patientAge: values.patientAge,
      reason: values.reason,
      scheduleId: values.scheduleId,
      preferredDate: values.preferredDate,
      preferredTime: values.preferredTime,
    } as any}, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        toast({ title: "Appointment request submitted", description: "The barangay health staff will review your request." });
        setLocation("/appointments");
      },
      onError: () => {
        toast({ title: "Failed to submit", description: "Please try again.", variant: "destructive" });
      },
    });
  };

  const selectedScheduleId = form.watch("scheduleId");
  const selectedPreferredDate = form.watch("preferredDate");
  const minimumAppointmentDate = toDateString(addDays(new Date(), 2));
  const availableSchedules = (schedules ?? []).filter((schedule) => {
    const remainingSlots = schedule.slotLimit - (schedule.currentSlots || 0);
    return schedule.status === "open" && schedule.scheduleDate >= minimumAppointmentDate && remainingSlots > 0;
  });
  const availableDateSet = new Set(availableSchedules.map((schedule) => schedule.scheduleDate));
  const filteredSchedules = selectedPreferredDate
    ? availableSchedules.filter((schedule) => schedule.scheduleDate === selectedPreferredDate)
    : availableSchedules;
  const selectedDateValue = selectedPreferredDate ? parseISO(selectedPreferredDate) : undefined;

  const selectSchedule = (scheduleId: string) => {
    const schedule = availableSchedules.find((item) => item.id === scheduleId);
    if (!schedule) return;
    form.setValue("scheduleId", schedule.id, { shouldValidate: true });
    form.setValue("preferredDate", schedule.scheduleDate, { shouldValidate: true });
    form.setValue("preferredTime", `${schedule.startTime} - ${schedule.endTime}`, { shouldValidate: true });
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl pb-10">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-xl h-10 w-10 border border-border/60">
            <Link href="/appointments"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Book Checkup</h1>
            <p className="text-sm text-muted-foreground">Request a schedule for health services</p>
          </div>
        </div>

        {/* Banner Card — no stock image, uses gradient + icons */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-r from-primary via-emerald-500 to-teal-400 p-6 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-white/5 rounded-full blur-xl" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-white/80" />
                  <span className="text-white/80 text-xs font-semibold uppercase tracking-wide">BaraGo Health Center</span>
                </div>
                <h2 className="text-xl font-extrabold text-white leading-snug">
                  We're here to keep you and<br />your family healthy.
                </h2>
                <p className="text-sm text-white/80">
                  Select your preferred date and time for your consultation.
                </p>
              </div>
              <div className="hidden sm:flex h-24 w-24 rounded-2xl bg-white/15 items-center justify-center backdrop-blur-sm border border-white/20 shrink-0">
                <Stethoscope className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </Card>

        {/* Form Card */}
        <Card className="border border-border/60 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-primary to-emerald-400" />
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="patientName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 font-semibold">
                        <User className="h-4 w-4 text-primary" /> Patient Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Full name of patient" data-testid="input-patient-name" className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="patientAge" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 font-semibold">
                        <User className="h-4 w-4 text-primary" /> Age <span className="text-muted-foreground font-normal">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          maxLength={2}
                          placeholder="Age"
                          data-testid="input-patient-age"
                          className="rounded-xl"
                          value={field.value?.toString() ?? ""}
                          onChange={(e) => {
                            const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 2);
                            field.onChange(digitsOnly);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="reason" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Reason for Checkup</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="input-reason" className="rounded-xl">
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {REASONS.map(reason => (
                          <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Available Schedules */}
                <div className="space-y-3">
                  <Label className="font-semibold text-foreground">Available Schedules</Label>
                  <p className="text-xs text-muted-foreground">
                    Appointments must be booked at least 2 days before the scheduled date.
                  </p>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Choose Date</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between rounded-xl bg-white text-left font-medium",
                            !selectedPreferredDate && "text-muted-foreground"
                          )}
                        >
                          {selectedPreferredDate ? format(parseISO(selectedPreferredDate), "MMMM dd, yyyy") : "Open calendar"}
                          <ChevronDown className="h-4 w-4 opacity-60" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDateValue}
                          onSelect={(date) => {
                            if (!date) return;
                            const dateStr = toDateString(date);
                            form.setValue("preferredDate", dateStr, { shouldValidate: true });
                            const firstSchedule = availableSchedules.find((schedule) => schedule.scheduleDate === dateStr);
                            if (firstSchedule) {
                              selectSchedule(firstSchedule.id);
                            } else {
                              form.setValue("scheduleId", "", { shouldValidate: true });
                              form.setValue("preferredTime", "", { shouldValidate: true });
                            }
                          }}
                          disabled={(date) => !availableDateSet.has(toDateString(date))}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {isSchedulesLoading ? (
                      <div className="grid w-full gap-3 sm:grid-cols-2">
                        <div className="h-28 rounded-2xl bg-muted animate-pulse" />
                        <div className="h-28 rounded-2xl bg-muted animate-pulse" />
                      </div>
                    ) : isSchedulesError ? (
                      <div className="w-full rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                        Unable to load health schedules. Please refresh the page or contact the barangay health office.
                      </div>
                    ) : filteredSchedules.length > 0 ? (
                      filteredSchedules.map((s) => {
                        const date = parseISO(s.scheduleDate);
                        const remainingSlots = s.slotLimit - (s.currentSlots || 0);
                        const isSelected = selectedScheduleId === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => selectSchedule(s.id)}
                            className={cn(
                              "flex-shrink-0 flex w-44 flex-col items-start justify-center rounded-2xl border-2 p-4 text-left transition-all duration-200 shadow-sm",
                              isSelected
                                ? "border-primary bg-primary/10 text-primary shadow-primary/20 scale-105"
                                : "border-border/60 bg-card hover:border-primary/50 hover:shadow-sm"
                            )}
                          >
                            <span className="text-xs font-semibold uppercase text-muted-foreground">{format(date, "EEE, MMM dd")}</span>
                            <span className="mt-1 text-sm font-extrabold text-foreground">{s.startTime} - {s.endTime}</span>
                            <span className="mt-1 text-xs text-muted-foreground">Service: Barangay health checkup</span>
                            <span className="text-xs text-muted-foreground">Staff: {s.assignedStaff || "To be assigned"}</span>
                            <span className="mt-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                              {remainingSlots} slots available
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="w-full rounded-xl border border-dashed bg-muted/30 p-5 text-center">
                        <CalendarIcon className="mx-auto mb-2 h-7 w-7 text-muted-foreground/50" />
                        <p className="text-sm font-semibold text-foreground">
                          {selectedPreferredDate ? "No schedules available on this date." : "No available health schedules yet."}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPreferredDate ? "Pick another available date from the calendar." : "Please check again later or contact the barangay health office."}
                        </p>
                      </div>
                    )}
                  </div>
                  <FormField control={form.control} name="scheduleId" render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="preferredDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 font-semibold">
                        <CalendarIcon className="h-4 w-4 text-primary" /> Preferred Date
                      </FormLabel>
                      <FormControl>
                        <Input type="date" data-testid="input-preferred-date" className="rounded-xl bg-muted/40" readOnly {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="preferredTime" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 font-semibold">
                        <Clock className="h-4 w-4 text-primary" /> Preferred Time
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          data-testid="select-preferred-time"
                          className="rounded-xl bg-muted/40"
                          readOnly
                          placeholder="Choose a schedule first"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Additional Notes <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any other concerns or information..." data-testid="input-notes" className="rounded-xl resize-none" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 flex gap-3">
                  <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    Appointments are subject to availability. You will receive a notification once your request is reviewed by the barangay health staff.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full h-12 text-base font-semibold gap-2 rounded-xl bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-400 shadow-sm"
                  data-testid="button-submit-appointment"
                >
                  <CalendarIcon className="h-5 w-5" />
                  {createMutation.isPending ? "Submitting..." : "Submit Appointment Request"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
