import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import {
  Ambulance,
  ArrowLeft,
  Bell,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  HelpCircle,
  LogIn,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react";

const guides = [
  {
    value: "resident",
    title: "Resident Guide",
    icon: UserRound,
    purpose: "Residents use BaraGo to book checkups, view schedules, request ambulance assistance, and receive updates from the barangay.",
    steps: [
      "Create an account or log in.",
      "Complete resident profile information.",
      "View available health schedules.",
      "Choose a schedule and submit an appointment request.",
      "Wait for admin approval or confirmation.",
      "Check appointment status on the dashboard.",
      "Request ambulance assistance if the patient cannot walk or travel safely.",
      "Read notifications for updates.",
      "Attend the checkup on the confirmed date and time.",
    ],
    responsibilities: [
      "Provide correct personal information.",
      "Choose only schedules they can attend.",
      "Monitor appointment status.",
      "Arrive on time for approved appointments.",
      "Use ambulance request only when needed.",
    ],
  },
  {
    value: "admin",
    title: "Admin Guide",
    icon: ShieldCheck,
    purpose: "Admins manage the whole barangay healthcare appointment system.",
    steps: [
      "Review resident registrations.",
      "Create and manage health schedules.",
      "Approve or reject appointment requests.",
      "Review ambulance assistance requests.",
      "Assign or coordinate workers if applicable.",
      "Send notifications or updates to residents.",
      "Monitor reports and appointment records.",
      "Manage users and system data.",
    ],
    responsibilities: [
      "Keep schedules updated.",
      "Approve requests responsibly.",
      "Avoid schedule conflicts.",
      "Monitor urgent ambulance requests.",
      "Ensure residents receive clear updates.",
      "Maintain accurate health records.",
    ],
  },
  {
    value: "worker",
    title: "Worker Guide",
    icon: UsersRound,
    purpose: "Workers support the barangay health office by assisting with daily appointments, viewing schedules, helping residents, and marking progress when needed.",
    steps: [
      "View approved appointments.",
      "Check daily or upcoming health schedules.",
      "View resident appointment details.",
      "Assist residents during checkup day.",
      "Help verify attendance.",
      "Mark appointments as completed if this function exists.",
      "Coordinate ambulance assistance if assigned.",
      "Report issues to the admin.",
    ],
    responsibilities: [
      "Check the dashboard regularly.",
      "Assist only assigned or approved appointments.",
      "Follow the health schedule prepared by the admin.",
      "Help residents during the actual appointment process.",
      "Keep appointment status updated if allowed.",
      "Coordinate with admin for problems or urgent cases.",
    ],
  },
];

const faqs = [
  {
    question: "Why can't I see schedules?",
    answer: "There may be no available schedules yet, or the barangay admin has not posted one.",
  },
  {
    question: "Why is my appointment pending?",
    answer: "The admin still needs to review and approve your request.",
  },
  {
    question: "What does a worker do?",
    answer: "Workers assist the barangay health office by viewing approved appointments, checking schedules, helping residents during checkups, and coordinating with admins.",
  },
  {
    question: "Can residents request ambulance assistance?",
    answer: "Yes, residents can request ambulance assistance if the patient cannot safely travel to the health center.",
  },
];

export default function UserManual() {
  return (
    <PublicLayout>
      <div className="flex-1 bg-gradient-to-b from-emerald-50/60 via-background to-blue-50/50 dark:from-emerald-950/20 dark:via-background dark:to-blue-950/20">
        <section className="container mx-auto max-w-6xl px-4 py-10 md:py-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                <Stethoscope className="h-4 w-4" />
                BaraGo Healthcare Scheduling Management System
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">BaraGo User Manual</h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                Learn how residents, admins, and workers use the BaraGo Healthcare Scheduling Management System.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" asChild className="rounded-xl gap-2">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              <Button asChild className="rounded-xl gap-2 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-400">
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  Go to Login
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              { label: "Schedules", icon: CalendarCheck },
              { label: "Appointments", icon: ClipboardList },
              { label: "Ambulance", icon: Ambulance },
              { label: "Notifications", icon: Bell },
            ].map(({ label, icon: Icon }) => (
              <Card key={label} className="rounded-2xl border-border/70 bg-card/90 shadow-sm">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold text-foreground">{label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="container mx-auto max-w-6xl px-4 pb-12">
          <Tabs defaultValue="resident" className="space-y-6">
            <TabsList className="grid h-auto grid-cols-1 gap-2 bg-transparent p-0 sm:grid-cols-3">
              {guides.map(({ value, title, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="justify-start gap-3 rounded-2xl border border-border/70 bg-card px-4 py-4 text-left data-[state=active]:border-primary/40 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-bold">{title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {guides.map(({ value, title, icon: Icon, purpose, steps, responsibilities }) => (
              <TabsContent key={value} value={value} className="mt-0">
                <Card className="rounded-2xl border-border/70 shadow-sm">
                  <CardHeader className="border-b border-border/70">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <span className="rounded-2xl bg-primary/10 p-3 text-primary">
                        <Icon className="h-6 w-6" />
                      </span>
                      {title}
                    </CardTitle>
                    <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{purpose}</p>
                  </CardHeader>
                  <CardContent className="grid gap-6 p-5 lg:grid-cols-2">
                    <div>
                      <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-foreground">
                        <ClipboardList className="h-4 w-4 text-primary" />
                        What to Do
                      </h3>
                      <ol className="space-y-3">
                        {steps.map((step, index) => (
                          <li key={step} className="flex gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground">
                              {index + 1}
                            </span>
                            <span className="text-sm leading-relaxed text-foreground">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Expected Responsibilities
                      </h3>
                      <div className="space-y-3">
                        {responsibilities.map((item) => (
                          <div key={item} className="flex gap-3 rounded-xl bg-emerald-500/5 p-3">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            <span className="text-sm leading-relaxed text-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          <Card className="mt-8 rounded-2xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <HelpCircle className="h-5 w-5 text-primary" />
                Quick FAQ
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-xl border border-border/70 bg-muted/20 p-4">
                  <p className="font-bold text-foreground">{faq.question}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </PublicLayout>
  );
}
