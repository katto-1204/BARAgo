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
import { ArrowLeft, User, Calendar as CalendarIcon, Clock, Info, CheckCircle2 } from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";
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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/appointments"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Book Checkup</h1>
            <p className="text-muted-foreground">Request a schedule for health services</p>
          </div>
        </div>

        {/* Doctor Banner */}
        <Card className="bg-primary/10 border-primary/20 overflow-hidden relative">
          <CardContent className="p-6 flex justify-between items-center">
            <div className="space-y-2 z-10">
              <h2 className="text-xl font-bold text-primary">We're here to keep you and your family healthy.</h2>
              <p className="text-sm text-primary/80">Select your preferred date and time for your consultation.</p>
            </div>
            <img 
              src="/assets/ChatGPT_Image_May_20,_2026,_12_06_31_AM_(5)_1779287509629.png" 
              alt="Doctor" 
              className="absolute right-0 top-0 h-full object-cover opacity-20 sm:opacity-100 sm:relative sm:h-32"
            />
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-5 w-5" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="patientName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        Patient Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Full name of patient" data-testid="input-patient-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="patientAge" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        Patient Age (optional)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Age" data-testid="input-patient-age" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="reason" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Checkup</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="input-reason">
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

                <div className="space-y-4">
                  <FormLabel>Available Schedules</FormLabel>
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
                              "flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-xl border-2 transition-all",
                              isSelected 
                                ? "border-primary bg-primary/10 text-primary" 
                                : "border-muted bg-card hover:border-primary/50"
                            )}
                          >
                            <span className="text-xs font-medium uppercase opacity-70">{format(date, "EEE")}</span>
                            <span className="text-xl font-bold">{format(date, "dd")}</span>
                            <span className="text-xs font-medium">{format(date, "MMM")}</span>
                            <span className="text-[10px] mt-1 text-primary">{s.slotLimit - (s.currentSlots || 0)} slots</span>
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No available schedules found.</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="preferredDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        Preferred Date
                      </FormLabel>
                      <FormControl>
                        <Input type="date" data-testid="input-preferred-date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="preferredTime" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        Preferred Time
                      </FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-testid="select-preferred-time">
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
                    <FormLabel>Additional Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any other concerns or information..." data-testid="input-notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
                  <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Appointments are subject to availability. You will receive a notification via the app once your request is reviewed by the barangay health staff.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending} 
                    className="flex-1 h-12 text-base font-semibold gap-2"
                    data-testid="button-submit-appointment"
                  >
                    <CalendarIcon className="h-5 w-5" />
                    {createMutation.isPending ? "Submitting..." : "Submit Appointment Request"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
