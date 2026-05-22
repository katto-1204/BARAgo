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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, User, Calendar as CalendarIcon, Clock, Info,
  CheckCircle2, Heart, Stethoscope
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

const schema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  patientAge: z.coerce.number().int().positive().optional(),
  reason: z.string().min(1, "Reason is required"),
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

export default function NewAppointment() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateAppointment();
  const { data: schedules } = useListSchedules({ status: "available" });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientName: "",
      reason: "",
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
      preferredDate: values.preferredDate,
      preferredTime: values.preferredTime,
    }}, {
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

  const selectedDate = form.watch("preferredDate");

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
                        <Input type="number" placeholder="Age" data-testid="input-patient-age" className="rounded-xl" {...field} />
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
                  <FormLabel className="font-semibold text-foreground">Available Schedules</FormLabel>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {schedules && schedules.length > 0 ? (
                      schedules.map((s) => {
                        const date = parseISO(s.scheduleDate);
                        const isSelected = selectedDate === s.scheduleDate;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              form.setValue("preferredDate", s.scheduleDate);
                              form.setValue("preferredTime", s.startTime);
                            }}
                            className={cn(
                              "flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 transition-all duration-200 shadow-sm",
                              isSelected
                                ? "border-primary bg-primary/10 text-primary shadow-primary/20 scale-105"
                                : "border-border/60 bg-card hover:border-primary/50 hover:shadow-sm"
                            )}
                          >
                            <span className="text-xs font-semibold uppercase text-muted-foreground">{format(date, "EEE")}</span>
                            <span className="text-2xl font-extrabold text-foreground">{format(date, "dd")}</span>
                            <span className="text-xs font-medium text-muted-foreground">{format(date, "MMM")}</span>
                            <span className="text-[10px] mt-0.5 font-bold text-primary">{s.slotLimit - (s.currentSlots || 0)} slots</span>
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground italic py-3">No available schedules found.</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="preferredDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 font-semibold">
                        <CalendarIcon className="h-4 w-4 text-primary" /> Preferred Date
                      </FormLabel>
                      <FormControl>
                        <Input type="date" data-testid="input-preferred-date" className="rounded-xl" {...field} />
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
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-testid="select-preferred-time" className="rounded-xl">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                            <SelectItem value="afternoon">Afternoon (1PM - 5PM)</SelectItem>
                          </SelectContent>
                        </Select>
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
