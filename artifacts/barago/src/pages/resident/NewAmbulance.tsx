import { useLocation, Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateAmbulanceRequest, getListAmbulanceRequestsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, AlertTriangle } from "lucide-react";

const schema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  exactLocation: z.string().min(1, "Location is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  emergencyType: z.string().min(1, "Emergency type is required"),
  description: z.string().optional(),
  urgencyLevel: z.enum(["low", "medium", "high"]),
});

type FormValues = z.infer<typeof schema>;

export default function NewAmbulance() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateAmbulanceRequest();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientName: "",
      exactLocation: "",
      contactNumber: "",
      emergencyType: "",
      description: "",
      urgencyLevel: "medium",
    },
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAmbulanceRequestsQueryKey() });
        toast({ title: "Ambulance request submitted", description: "The barangay will respond shortly." });
        setLocation("/ambulance");
      },
      onError: () => {
        toast({ title: "Failed to submit", variant: "destructive" });
      },
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/ambulance"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Request Ambulance</h1>
            <p className="text-muted-foreground">Submit an ambulance assistance request</p>
          </div>
        </div>

        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive font-medium">
            For life-threatening emergencies, call 911 or your local emergency hotline immediately. BaraGo is for barangay ambulance coordination only.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emergency Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="patientName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" data-testid="input-patient-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="contactNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="09XX XXX XXXX" data-testid="input-contact-number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="exactLocation" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exact Location</FormLabel>
                    <FormControl>
                      <Input placeholder="House number, street, purok, landmarks..." data-testid="input-location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="emergencyType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Accident, cannot walk, severe pain" data-testid="input-emergency-type" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="urgencyLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urgency Level</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-testid="select-urgency-level">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional details about the emergency..." data-testid="input-description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-ambulance">
                    {createMutation.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/ambulance">Cancel</Link>
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
