import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminListUsers,
  useAdminListNotificationRecipients,
  useAdminCreateNotificationRecipient,
  useAdminUpdateNotificationRecipient,
  useAdminDeleteNotificationRecipient,
  getAdminListNotificationRecipientsQueryKey,
  NotificationModule,
  type NotificationRecipient,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, Plus, Trash2 } from "lucide-react";

const MODULES = [
  { value: NotificationModule.donations, label: "Donations" },
  { value: NotificationModule.enquiries, label: "Enquiries" },
  { value: NotificationModule.courses, label: "Course Registrations" },
  { value: NotificationModule.volunteers, label: "Volunteer Applications" },
];

export default function AdminNotificationsPage() {
  const { admin: currentAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: getAdminListNotificationRecipientsQueryKey() });

  const { data: users, isLoading: usersLoading } = useAdminListUsers();
  const { data: recipients, isLoading: recipientsLoading } = useAdminListNotificationRecipients();
  const [addingModule, setAddingModule] = useState<Record<string, string>>({});

  const createMutation = useAdminCreateNotificationRecipient({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Recipient added" });
      },
      onError: (error: unknown) =>
        toast({
          title: "Failed to add recipient",
          description: error instanceof Error ? error.message : undefined,
          variant: "destructive",
        }),
    },
  });

  const updateMutation = useAdminUpdateNotificationRecipient({
    mutation: {
      onSuccess: () => invalidate(),
      onError: (error: unknown) =>
        toast({
          title: "Failed to update recipient",
          description: error instanceof Error ? error.message : undefined,
          variant: "destructive",
        }),
    },
  });

  const deleteMutation = useAdminDeleteNotificationRecipient({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Recipient removed" });
      },
      onError: (error: unknown) =>
        toast({
          title: "Failed to remove recipient",
          description: error instanceof Error ? error.message : undefined,
          variant: "destructive",
        }),
    },
  });

  if (currentAdmin && currentAdmin.role !== "super_admin") {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <ShieldAlert className="h-10 w-10 mb-4" />
          <p>Only super admins can manage notification recipients.</p>
        </div>
      </AdminLayout>
    );
  }

  const activeUsers = (users ?? []).filter((u) => u.active).sort((a, b) => a.name.localeCompare(b.name));
  const isLoading = usersLoading || recipientsLoading;

  function recipientsForModule(module: string): NotificationRecipient[] {
    return (recipients ?? []).filter((r) => r.module === module);
  }

  function handleAdd(module: string) {
    const adminUserId = addingModule[module];
    if (!adminUserId) return;
    createMutation.mutate({ data: { adminUserId, module: module as NotificationModule, emailEnabled: true, smsEnabled: false } });
    setAddingModule((prev) => ({ ...prev, [module]: "" }));
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-3xl mb-2">Notification Recipients</h1>
        <p className="text-muted-foreground">
          Choose which admin users receive email and SMS alerts when someone submits a form on the website.
        </p>
      </div>

      <div className="space-y-6">
        {MODULES.map((mod) => {
          const rows = recipientsForModule(mod.value);
          const assignedIds = new Set(rows.map((r) => r.adminUserId));
          const availableUsers = activeUsers.filter((u) => !assignedIds.has(u.id));

          return (
            <Card key={mod.value} className="border-card-border" data-testid={`card-module-${mod.value}`}>
              <CardHeader>
                <CardTitle className="text-lg">{mod.label}</CardTitle>
                <CardDescription>Recipients notified for new {mod.label.toLowerCase()} submissions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Admin User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-center">Email Alerts</TableHead>
                        <TableHead className="text-center">SMS Alerts</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                            No recipients assigned yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        rows.map((row) => {
                          const user = (users ?? []).find((u) => u.id === row.adminUserId);
                          return (
                            <TableRow key={row.id} data-testid={`row-recipient-${row.id}`}>
                              <TableCell className="font-medium">{user?.name ?? "Unknown user"}</TableCell>
                              <TableCell>{user?.email ?? "-"}</TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={row.emailEnabled}
                                  onCheckedChange={(checked) =>
                                    updateMutation.mutate({ id: row.id, data: { emailEnabled: checked } })
                                  }
                                  data-testid={`switch-email-${row.id}`}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={row.smsEnabled}
                                  onCheckedChange={(checked) =>
                                    updateMutation.mutate({ id: row.id, data: { smsEnabled: checked } })
                                  }
                                  data-testid={`switch-sms-${row.id}`}
                                />
                                {row.smsEnabled && !user?.phone && (
                                  <p className="text-xs text-destructive mt-1">No phone number on file</p>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => deleteMutation.mutate({ id: row.id })}
                                  data-testid={`button-remove-recipient-${row.id}`}
                                  aria-label={`Remove ${user?.name ?? "recipient"}`}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {availableUsers.length > 0 && (
                  <div className="flex items-center gap-2 mt-4">
                    <Select
                      value={addingModule[mod.value] ?? ""}
                      onValueChange={(value) => setAddingModule((prev) => ({ ...prev, [mod.value]: value }))}
                    >
                      <SelectTrigger className="w-64" data-testid={`select-add-recipient-${mod.value}`}>
                        <SelectValue placeholder="Select an admin user" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} ({u.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      disabled={!addingModule[mod.value] || createMutation.isPending}
                      onClick={() => handleAdd(mod.value)}
                      data-testid={`button-add-recipient-${mod.value}`}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AdminLayout>
  );
}
