import { AdminLayout } from "@/components/admin/admin-layout";
import { useAdminGetDeviceTokenStats, useAdminListPushNotificationHistory } from "@workspace/api-client-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Smartphone, Users, Wifi, Send, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAdminListPushNotificationHistoryQueryKey } from "@workspace/api-client-react";

const CATEGORY_LABELS: Record<string, string> = {
  announcements: "Announcement",
  events: "Event",
  blog: "Blog",
};

const CATEGORY_COLORS: Record<string, string> = {
  announcements: "bg-blue-100 text-blue-800",
  events: "bg-green-100 text-green-800",
  blog: "bg-purple-100 text-purple-800",
};

const PAGE_SIZE = 10;

export default function AdminPushNotificationsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: stats, isLoading: statsLoading } = useAdminGetDeviceTokenStats();

  const [page, setPage] = useState(1);

  const { data: historyPage, isLoading: historyLoading } = useAdminListPushNotificationHistory(
    { page, limit: PAGE_SIZE },
  );

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("announcements");

  const broadcastMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/push-notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, body, category }),
      });
      if (!res.ok) throw new Error("Broadcast failed");
      return res.json() as Promise<{ sent: number }>;
    },
    onSuccess: (data) => {
      toast({
        title: "Notification sent",
        description: `Delivered to ${data.sent} device${data.sent !== 1 ? "s" : ""}.`,
      });
      setTitle("");
      setBody("");
      setPage(1);
      void queryClient.invalidateQueries({
        queryKey: getAdminListPushNotificationHistoryQueryKey({ page: 1, limit: PAGE_SIZE }),
      });
    },
    onError: () => {
      toast({ title: "Failed to send notification", variant: "destructive" });
    },
  });

  const canSend = title.trim().length > 0 && body.trim().length > 0;
  const history = historyPage?.data ?? [];
  const hasMore = historyPage?.hasMore ?? false;

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-3xl">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Push Notifications
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Automatically sent when you publish content. You can also send a manual broadcast below.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white dark:bg-gray-800 p-5 flex items-start gap-4 shadow-sm">
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-2.5">
              <Smartphone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Registered Devices
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                {statsLoading ? "—" : (stats?.count ?? 0)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-white dark:bg-gray-800 p-5 flex items-start gap-4 shadow-sm">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-2.5">
              <Wifi className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Auto-broadcast
              </p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">
                On publish
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-white dark:bg-gray-800 p-5 flex items-start gap-4 shadow-sm">
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/30 p-2.5">
              <Users className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Channels
              </p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">
                Announcements, Events, Blog
              </p>
            </div>
          </div>
        </div>

        {/* Manual broadcast form */}
        <div className="rounded-xl border bg-white dark:bg-gray-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Send Manual Broadcast
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="notif-title">Title</Label>
              <Input
                id="notif-title"
                placeholder="e.g. Masjid closure notice"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="notif-body">Message</Label>
              <Textarea
                id="notif-body"
                placeholder="e.g. The masjid will be closed this Saturday for maintenance."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={300}
                rows={3}
              />
              <p className="text-xs text-gray-400">{body.length}/300</p>
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcements">Announcement</SelectItem>
                  <SelectItem value="events">Event</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => broadcastMutation.mutate()}
                disabled={!canSend || broadcastMutation.isPending}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {broadcastMutation.isPending ? "Sending…" : "Send Notification"}
              </Button>
            </div>
          </div>
        </div>

        {/* Broadcast history */}
        <div className="rounded-xl border bg-white dark:bg-gray-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Broadcast History
            </h3>
          </div>

          {historyLoading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-gray-400">No broadcasts sent yet.</p>
          ) : (
            <>
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 py-3 border-b last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.title}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            CATEGORY_COLORS[item.category] ?? "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {CATEGORY_LABELS[item.category] ?? item.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.body}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {item.sentCount} device{item.sentCount !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-gray-400">Page {page}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!hasMore}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
