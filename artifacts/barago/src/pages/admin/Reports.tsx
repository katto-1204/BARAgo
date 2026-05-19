import { useState } from "react";
import { useListReports, getListReportsQueryKey, useGenerateReport, useDeleteReport } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { FileText } from "lucide-react";

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

  const getReportLabel = (type: string) => REPORT_TYPES.find(r => r.value === type)?.label ?? type;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">Generate and manage barangay health reports</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Generate Report</CardTitle></CardHeader>
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
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} data-testid="input-start-date" />
              </div>
              <div className="space-y-1.5">
                <Label>End Date (optional)</Label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} data-testid="input-end-date" />
              </div>
            </div>
            <Button onClick={handleGenerate} disabled={generateMutation.isPending || !reportType} data-testid="button-generate-report">
              {generateMutation.isPending ? "Generating..." : "Generate Report"}
            </Button>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-lg font-semibold mb-3">Generated Reports</h2>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : (reports?.length ?? 0) === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground">No reports generated yet</p>
            </CardContent></Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border rounded-lg overflow-hidden">
                <thead className="bg-muted">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-medium">Report Type</th>
                    <th className="px-4 py-3 font-medium">Date Range</th>
                    <th className="px-4 py-3 font-medium">Generated</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports?.map((report) => (
                    <tr key={report.id} data-testid={`row-report-${report.id}`} className="border-t hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{getReportLabel(report.reportType)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {report.startDate && report.endDate ? `${report.startDate} to ${report.endDate}` : report.startDate ?? "All dates"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(report.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" data-testid={`button-delete-report-${report.id}`}>Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Report?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently delete this report record.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(report.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
