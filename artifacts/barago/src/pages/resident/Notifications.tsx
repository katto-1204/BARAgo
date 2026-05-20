import { useListNotifications, getListNotificationsQueryKey, useMarkNotificationRead, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Bell, Calendar, Truck, Info, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TYPE_ICONS: Record<string, typeof Bell> = {
  appointment: Calendar,
  ambulance: Truck,
  system: Info,
};

const TYPE_COLORS: Record<string, string> = {
  appointment: "bg-green-100 text-green-600 border-green-200",
  ambulance: "bg-red-100 text-red-600 border-red-200",
  system: "bg-blue-100 text-blue-600 border-blue-200",
  reminder: "bg-yellow-100 text-yellow-600 border-yellow-200",
};

export default function Notifications() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");

  const { data: notifications, isLoading } = useListNotifications({
    query: { queryKey: getListNotificationsQueryKey() },
  });

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() }),
    });
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
        toast({ title: "All notifications marked as read" });
      },
    });
  };

  const filteredNotifications = notifications?.filter(n => {
    if (filter === "unread") return !n.isRead;
    if (filter === "appointment") return n.type === "appointment";
    if (filter === "ambulance") return n.type === "ambulance";
    return true;
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} disabled={markAllReadMutation.isPending} className="text-primary hover:text-primary hover:bg-primary/10">
              Mark all as read
            </Button>
          )}
        </div>

        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="bg-transparent h-auto p-0 gap-2 flex-wrap">
            <TabsTrigger value="all" className="rounded-full px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All</TabsTrigger>
            <TabsTrigger value="unread" className="rounded-full px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Unread</TabsTrigger>
            <TabsTrigger value="appointment" className="rounded-full px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Appointment</TabsTrigger>
            <TabsTrigger value="ambulance" className="rounded-full px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Ambulance</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : (filteredNotifications?.length ?? 0) === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-muted-foreground">No notifications found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications?.map((notif) => {
              const Icon = TYPE_ICONS[notif.type] ?? Bell;
              const colorClass = TYPE_COLORS[notif.type] ?? TYPE_COLORS.system;
              return (
                <div
                  key={notif.id}
                  data-testid={`card-notification-${notif.id}`}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer bg-card hover:shadow-sm ${!notif.isRead ? "border-primary/20" : "border-border/50"}`}
                  onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                >
                  <div className={`p-2.5 rounded-full border ${colorClass} flex-shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${!notif.isRead ? "font-bold text-foreground" : "font-semibold text-muted-foreground"}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary" data-testid={`unread-dot-${notif.id}`} />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  <div className="flex-shrink-0 self-center">
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
