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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ArrowLeft, AlertTriangle, User, MapPin, Phone, Info, Ambulance, Check, ChevronsUpDown } from "lucide-react";
import { DAVAO_BARANGAYS } from "@/lib/barangays";
import { findNearestHospitals } from "@/lib/nearestHospital";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const schema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  exactLocation: z.string().min(1, "Location is required"),
  barangay: z.string().min(1, "Barangay is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  emergencyType: z.string().min(1, "Emergency type is required"),
  description: z.string().max(250, "Description must be less than 250 characters").optional(),
  urgencyLevel: z.enum(["low", "medium", "high"]),
});

type FormValues = z.infer<typeof schema>;

const EMERGENCY_TYPES = [
  "Accident",
  "Stroke",
  "Heart Attack",
  "Difficulty Breathing",
  "Childbirth",
  "Unconscious",
  "Severe Pain",
  "Other"
];

export default function NewAmbulance() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateAmbulanceRequest();
  const [nearestHospitals, setNearestHospitals] = useState<ReturnType<typeof findNearestHospitals>>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientName: "",
      exactLocation: "",
      barangay: "",
      contactNumber: "",
      emergencyType: "",
      description: "",
      urgencyLevel: "medium",
    },
  });

  const selectedBarangay = form.watch("barangay");

  useEffect(() => {
    if (selectedBarangay) {
      setNearestHospitals(findNearestHospitals(selectedBarangay));
    } else {
      setNearestHospitals([]);
    }
  }, [selectedBarangay]);

  const useMyLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        form.setValue("exactLocation", `GPS: ${position.coords.latitude}, ${position.coords.longitude}`);
        toast({ title: "Location captured", description: "Your current GPS coordinates have been added." });
      }, () => {
        toast({ title: "Location failed", description: "Could not get your location.", variant: "destructive" });
      });
    }
  };

  const onSubmit = (values: FormValues) => {
    // Combine exactLocation and barangay for the API if needed, 
    // but the task says to keep existing mutation logic.
    // The API schema for AmbulanceInput doesn't have a 'barangay' field, 
    // so we'll prepend it to exactLocation.
    const submissionData = {
      ...values,
      exactLocation: `${values.barangay}, ${values.exactLocation}`
    };
    
    createMutation.mutate({ data: submissionData }, {
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
      <div className="space-y-6 max-w-2xl pb-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/ambulance"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Request Ambulance</h1>
            <p className="text-muted-foreground">Emergency medical assistance</p>
          </div>
        </div>

        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center sm:justify-between">
            <AlertDescription className="text-destructive font-bold text-base">
              For life-threatening emergencies, call 911 immediately.
            </AlertDescription>
            <Button variant="destructive" size="sm" asChild className="font-bold">
              <a href="tel:911">Call Now</a>
            </Button>
          </div>
        </Alert>

        <Card className="border-t-4 border-t-destructive">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-destructive flex items-center gap-2">
              <Ambulance className="h-5 w-5" />
              Ambulance Request Form
            </CardTitle>
            <p className="text-sm text-muted-foreground">Please provide accurate details so we can reach you quickly.</p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="barangay" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Barangay</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? DAVAO_BARANGAYS.find((b) => b === field.value)
                                : "Select barangay..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 max-h-[300px] overflow-y-auto">
                          <Command>
                            <CommandInput placeholder="Search barangay..." />
                            <CommandList>
                              <CommandEmpty>No barangay found.</CommandEmpty>
                              <CommandGroup>
                                {DAVAO_BARANGAYS.map((b) => (
                                  <CommandItem
                                    value={b}
                                    key={b}
                                    onSelect={() => {
                                      form.setValue("barangay", b);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        b === field.value ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {b}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="contactNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        Contact Number
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="09XX XXX XXXX" data-testid="input-contact-number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="exactLocation" render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-1">
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Exact Location
                      </FormLabel>
                      <Button type="button" variant="link" size="sm" onClick={useMyLocation} className="h-auto p-0 text-primary">
                        Use My Location
                      </Button>
                    </div>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-emergency-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EMERGENCY_TYPES.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="urgencyLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urgency Level</FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'low', label: 'Low', color: 'bg-green-100 text-green-700 border-green-200', active: 'bg-green-600 text-white border-green-600', sub: '2 hours' },
                          { id: 'medium', label: 'Med', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', active: 'bg-yellow-500 text-white border-yellow-500', sub: '30 mins' },
                          { id: 'high', label: 'High', color: 'bg-red-100 text-red-700 border-red-200', active: 'bg-red-600 text-white border-red-600', sub: 'Immediate' },
                        ].map((level) => (
                          <button
                            key={level.id}
                            type="button"
                            onClick={() => field.onChange(level.id)}
                            className={cn(
                              "flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all",
                              field.value === level.id ? level.active : level.color
                            )}
                          >
                            <span className="text-sm font-bold">{level.label}</span>
                            <span className="text-[10px] opacity-80">{level.sub}</span>
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-1">
                      <FormLabel>Description (optional)</FormLabel>
                      <span className="text-[10px] text-muted-foreground">{(field.value || "").length}/250</span>
                    </div>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional details about the emergency..." 
                        data-testid="input-description" 
                        className="resize-none h-24"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {nearestHospitals.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Nearest Hospitals
                    </h3>
                    <div className="grid gap-3">
                      {nearestHospitals.map((h) => (
                        <div key={h.id} className="p-3 border rounded-lg bg-muted/50 flex justify-between items-start gap-4">
                          <div>
                            <p className="text-sm font-bold leading-none">{h.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{h.address}</p>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                            {h.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
                  <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <p className="text-xs text-blue-700 leading-relaxed font-medium">
                    We're here to help, 24/7. Our team will respond and dispatch the nearest ambulance to your location.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending} 
                    variant="destructive"
                    className="flex-1 h-12 text-base font-bold gap-2"
                    data-testid="button-submit-ambulance"
                  >
                    <Ambulance className="h-5 w-5" />
                    {createMutation.isPending ? "Submitting..." : "Submit Ambulance Request"}
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
