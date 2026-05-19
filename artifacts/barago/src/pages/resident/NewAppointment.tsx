import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateAppointment, getListAppointmentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const schema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  patientAge: z.coerce.number().int().positive().optional(),
  reason: z.string().min(1, "Reason is required"),
  preferredDate: z.string().min(1, "Preferred date is required"),
  preferredTime: z.string().min(1, "Preferred time is required"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewAppointment() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateAppointment();

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

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/appointments"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Book Appointment</h1>
            <p className="text-muted-foreground">Request a checkup schedule</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appointment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="patientName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name of patient" data-testid="input-patient-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="patientAge" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Age (optional)</FormLabel>
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
                    <FormControl>
                      <Input placeholder="e.g. Fever, follow-up, blood pressure check" data-testid="input-reason" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="preferredDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Date</FormLabel>
                      <FormControl>
                        <Input type="date" data-testid="input-preferred-date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="preferredTime" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Time</FormLabel>
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

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-appointment">
                    {createMutation.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/appointments">Cancel</Link>
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
