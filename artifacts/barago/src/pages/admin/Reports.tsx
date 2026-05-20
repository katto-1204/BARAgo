import { useState } from "react";
import { useListReports, getListReportsQueryKey, useGenerateReport, useDeleteReport, useGetAdminDashboard } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Trash2, Calendar, Filter, BarChart3, LineChart, PieChart, Activity, CheckCircle2, Clock, XCircle } from "lucide-react";

const REPORT_TYPES = [
  { value: "appointments", label: "Appointment List" },
  { value: "ambulance", label: "Ambulance Request Report" },
  { value: "residents", label: "Resident List" },
  { value: "completed_checkups", label: "Completed Checkup Report" },
  { value: "monthly_summary", label: "Monthly Summary Report" },
];

export default function Reports() {
  const [reportType, setReportType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: reports, isLoading } = useListReports({
    query: { queryKey: getListReportsQueryKey() },
  });

  const { data: stats } = useGetAdminDashboard();

  const generateMutation = useGenerateReport();
  const deleteMutation = useDeleteReport();

  const handleGenerate = () => {
    if (!reportType) {
      toast({ title: "Please select a report type", variant: "destructive" });
      return;
    }
    generateMutation.mutate({ data: { reportType: reportType as any, startDate: startDate || undefined, endDate: endDate || undefined } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
        toast({ title: "Report generated successfully" });
        setReportType("");
        setStartDate("");
        setEndDate("");
      },
      onError: () => toast({ title: "Failed to generate report", variant: "destructive" }),
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
        toast({ title: "Report deleted" });
      },
    });
  };

  const handleDownload = (report: any) => {
    // In a real app, this would download a PDF/CSV
    // For now we'll simulate it by creating a text file
    const content = `BaraGo Report: ${getReportLabel(report.reportType)}\nGenerated: ${new Date(report.createdAt).toLocaleString()}\nRange: ${report.startDate || 'Start'} to ${report.endDate || 'End'}\n\nSummary Data:\n- Total Residents: ${stats?.totalResidents || 0}\n- Pending Appointments: ${stats?.pendingAppointments || 0}\n- Pending Ambulance: ${stats?.pendingAmbulanceRequests || 0}\n- Completed Checkups: ${stats?.completedCheckups || 0}`;
    
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `barago-report-${report.reportType}-${report.id.substring(0,8)}.txt`;
    document.body.appendChild(element);
    element.click();
    toast({ title: "Report download started" });
  };

  const getReportLabel = (type: string) => REPORT_TYPES.find(r => r.value === type)?.label ?? type;

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate data-driven insights and export health service records.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-blue-50/50 border-blue-100">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg"><Activity className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Total Requests</p>
                <p className="text-2xl font-bold">{(stats?.pendingAppointments || 0) + (stats?.pendingAmbulanceRequests || 0) + (stats?.completedCheckups || 0)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50/50 border-green-100">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-xs text-green-600 font-semibold uppercase">Completed</p>
                <p className="text-2xl font-bold">{stats?.completedCheckups || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50/50 border-yellow-100">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg"><Clock className="h-5 w-5 text-yellow-600" /></div>
              <div>
                <p className="text-xs text-yellow-600 font-semibold uppercase">Pending</p>
                <p className="text-2xl font-bold">{stats?.pendingAppointments || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-50/50 border-red-100">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg"><Activity className="h-5 w-5 text-red-600" /></div>
              <div>
                <p className="text-xs text-red-600 font-semibold uppercase">Ambulance</p>
                <p className="text-2xl font-bold">{stats?.pendingAmbulanceRequests || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Chart Placeholders */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Appointments Over Time</CardTitle>
              <CardDescription>Visual representation of checkup requests for the current month</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-end justify-around pb-4 pt-8">
              {[45, 75, 55, 90, 65, 80, 50, 85, 95, 70, 60, 40].map((val, i) => (
                <div key={i} className="w-4 bg-primary/20 hover:bg-primary transition-colors rounded-t-sm relative group" style={{ height: `${val}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                    {Math.floor(val/2)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Request Status</CardTitle>
              <CardDescription>Breakdown by current status</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-4">
              <div className="relative h-48 w-48">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#16A34A" strokeWidth="20" strokeDasharray="180 251" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2563EB" strokeWidth="20" strokeDasharray="50 251" strokeDashoffset="-180" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F59E0B" strokeWidth="20" strokeDasharray="21 251" strokeDashoffset="-230" />
                </svg>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-xs w-full">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" /> Approved</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600" /> Completed</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500" /> Pending</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-600" /> Cancelled</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Generate New Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger data-testid="select-report-type"><SelectValue placeholder="Select report type" /></SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Start Date (optional)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="date" className="pl-9" value={startDate} onChange={e => setStartDate(e.target.value)} data-testid="input-start-date" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>End Date (optional)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="date" className="pl-9" value={endDate} onChange={e => setEndDate(e.target.value)} data-testid="input-end-date" />
                </div>
              </div>
            </div>
            <Button onClick={handleGenerate} disabled={generateMutation.isPending || !reportType} data-testid="button-generate-report" className="w-full sm:w-auto">
              {generateMutation.isPending ? "Generating..." : "Generate Report"}
            </Button>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Generated Reports
          </h2>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
          ) : (reports?.length ?? 0) === 0 ? (
            <Card className="border-dashed bg-muted/30">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground">No reports generated yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reports?.map((report) => (
                <Card key={report.id} data-testid={`row-report-${report.id}`} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-2.5 rounded-full">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold">{getReportLabel(report.reportType)}</p>
                        <div className="flex items-center gap-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(report.createdAt).toLocaleDateString()}</span>
                          <span>{report.startDate && report.endDate ? `${report.startDate} to ${report.endDate}` : "Full History"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="outline" className="h-8" onClick={() => handleDownload(report)}>
                        <Download className="h-3.5 w-3.5 mr-1" /> Export
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50" data-testid={`button-delete-report-${report.id}`}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Report Record?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently remove this report from your generated list. The actual data remains in the system.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(report.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
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
      </div>
    </AppLayout>
  );
}

