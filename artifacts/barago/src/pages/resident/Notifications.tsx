import { useListNotifications, getListNotificationsQueryKey, useMarkNotificationRead, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Bell, Calendar, Truck, Info } from "lucide-react";

const TYPE_ICONS: Record<string, typeof Bell> = {
  appointment: Calendar,
  ambulance: Truck,
  system: Info,
};

const TYPE_COLORS: Record<string, string> = {
  appointment: "bg-primary/10 text-primary border-primary/20",
  ambulance: "bg-destructive/10 text-destructive border-destructive/20",
  system: "bg-muted text-muted-foreground border-border",
};

export default function Notifications() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
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

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={markAllReadMutation.isPending} data-testid="button-mark-all-read">
              Mark all as read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : (notifications?.length ?? 0) === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-muted-foreground">No notifications yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications?.map((notif) => {
              const Icon = TYPE_ICONS[notif.type] ?? Bell;
              const colorClass = TYPE_COLORS[notif.type] ?? TYPE_COLORS.system;
              return (
                <Card
                  key={notif.id}
                  data-testid={`card-notification-${notif.id}`}
                  className={`transition-colors cursor-pointer ${!notif.isRead ? "border-primary/30 bg-primary/5" : ""}`}
                  onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full border ${colorClass} flex-shrink-0`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notif.isRead ? "font-semibold" : "font-medium"}`}>{notif.title}</p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!notif.isRead && (
                              <span className="h-2 w-2 rounded-full bg-primary" data-testid={`unread-dot-${notif.id}`} />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
