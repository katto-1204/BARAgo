import type { ComponentType } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "next-themes";

import Landing from "@/pages/public/Landing";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

import ResidentDashboard from "@/pages/resident/Dashboard";
import Appointments from "@/pages/resident/Appointments";
import NewAppointment from "@/pages/resident/NewAppointment";
import AmbulanceRequests from "@/pages/resident/AmbulanceRequests";
import NewAmbulance from "@/pages/resident/NewAmbulance";
import Notifications from "@/pages/resident/Notifications";
import Profile from "@/pages/resident/Profile";

import AdminDashboard from "@/pages/admin/Dashboard";
import ManageAppointments from "@/pages/admin/ManageAppointments";
import ManageAmbulance from "@/pages/admin/ManageAmbulance";
import ManageSchedules from "@/pages/admin/ManageSchedules";
import ManageResidents from "@/pages/admin/ManageResidents";
import Reports from "@/pages/admin/Reports";

import HealthWorkerDashboard from "@/pages/health-worker/HealthWorkerDashboard";
import WorkerProfile from "@/pages/health-worker/WorkerProfile";

function ProtectedRoute({ component: Component, allowedRoles }: { component: ComponentType; allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading...</div>;

  if (!user) return <Redirect to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Redirect to="/admin" />;
    if (user.role === "health_worker") return <Redirect to="/health-worker" />;
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function HomeRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Landing />;
  if (user.role === "admin") return <Redirect to="/admin" />;
  if (user.role === "health_worker") return <Redirect to="/health-worker" />;
  return <Redirect to="/dashboard" />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Resident routes */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={ResidentDashboard} allowedRoles={["resident"]} />}
      </Route>
      <Route path="/appointments/new">
        {() => <ProtectedRoute component={NewAppointment} allowedRoles={["resident"]} />}
      </Route>
      <Route path="/appointments">
        {() => <ProtectedRoute component={Appointments} allowedRoles={["resident"]} />}
      </Route>
      <Route path="/ambulance/new">
        {() => <ProtectedRoute component={NewAmbulance} allowedRoles={["resident"]} />}
      </Route>
      <Route path="/ambulance">
        {() => <ProtectedRoute component={AmbulanceRequests} allowedRoles={["resident"]} />}
      </Route>
      <Route path="/notifications">
        {() => <ProtectedRoute component={Notifications} allowedRoles={["resident"]} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={Profile} allowedRoles={["resident"]} />}
      </Route>

      {/* Admin routes */}
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/appointments">
        {() => <ProtectedRoute component={ManageAppointments} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/ambulance">
        {() => <ProtectedRoute component={ManageAmbulance} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/schedules">
        {() => <ProtectedRoute component={ManageSchedules} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/residents">
        {() => <ProtectedRoute component={ManageResidents} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/reports">
        {() => <ProtectedRoute component={Reports} allowedRoles={["admin"]} />}
      </Route>

      {/* Health Worker routes */}
      <Route path="/health-worker">
        {() => <ProtectedRoute component={HealthWorkerDashboard} allowedRoles={["health_worker"]} />}
      </Route>
      <Route path="/health-worker/profile">
        {() => <ProtectedRoute component={WorkerProfile} allowedRoles={["health_worker"]} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthProvider>
              <Router />
            </AuthProvider>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
