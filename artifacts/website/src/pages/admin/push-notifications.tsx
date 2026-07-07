import { AdminLayout } from "@/components/admin/admin-layout";
import { useAdminDeviceTokenStats } from "@workspace/api-client-react";
import { Smartphone, Users, Wifi } from "lucide-react";

export default function AdminPushNotificationsPage() {
  const { data: stats, isLoading } = useAdminDeviceTokenStats();

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Push Notifications Overview
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Notifications are automatically sent to registered devices when you
            publish announcements, events, or blog posts.
          </p>
        </div>

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
                {isLoading ? "—" : (stats?.count ?? 0)}
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

        <div className="rounded-xl border bg-white dark:bg-gray-800 p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            How it works
          </h3>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex gap-3">
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                1
              </span>
              <span>
                App users grant notification permission during onboarding. Their
                Expo push token is registered against a unique device ID.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                2
              </span>
              <span>
                When you publish an announcement, event, or blog post, the API
                automatically sends a push notification to all eligible
                registered devices.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                3
              </span>
              <span>
                Users can manage which categories they receive (Announcements,
                Events, Blog) via the app's Notification Settings screen.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
