import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useAdminListPrayerTimes,
  useAdminCreatePrayerTime,
  useAdminUpdatePrayerTime,
  useAdminDeletePrayerTime,
  useAdminListTimetablePdfs,
  useAdminCreateTimetablePdf,
  useAdminUpdateTimetablePdf,
  useAdminDeleteTimetablePdf,
  getAdminListPrayerTimesQueryKey,
  getAdminListTimetablePdfsQueryKey,
  type PrayerTime,
  type TimetablePdf,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const prayerTimeSchema = z.object({
  date: z.string().min(1, "Date is required"),
  fajrAdhan: z.string().min(1),
  fajrIqamah: z.string().min(1),
  dhuhrAdhan: z.string().min(1),
  dhuhrIqamah: z.string().min(1),
  asrAdhan: z.string().min(1),
  asrIqamah: z.string().min(1),
  maghribAdhan: z.string().min(1),
  maghribIqamah: z.string().min(1),
  ishaAdhan: z.string().min(1),
  ishaIqamah: z.string().min(1),
  jummahKhutbah: z.string().optional(),
  jummahIqamah: z.string().optional(),
  sunrise: z.string().optional(),
});
type PrayerTimeForm = z.infer<typeof prayerTimeSchema>;

const FIELD_GROUPS: { label: string; adhan: keyof PrayerTimeForm; iqamah?: keyof PrayerTimeForm }[] = [
  { label: "Fajr", adhan: "fajrAdhan", iqamah: "fajrIqamah" },
  { label: "Dhuhr", adhan: "dhuhrAdhan", iqamah: "dhuhrIqamah" },
  { label: "Asr", adhan: "asrAdhan", iqamah: "asrIqamah" },
  { label: "Maghrib", adhan: "maghribAdhan", iqamah: "maghribIqamah" },
  { label: "Isha", adhan: "ishaAdhan", iqamah: "ishaIqamah" },
];

function PrayerTimeDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: PrayerTime | null;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<PrayerTimeForm>({
    resolver: zodResolver(prayerTimeSchema),
    defaultValues: editing
      ? {
          date: editing.date,
          fajrAdhan: editing.fajrAdhan,
          fajrIqamah: editing.fajrIqamah,
          dhuhrAdhan: editing.dhuhrAdhan,
          dhuhrIqamah: editing.dhuhrIqamah,
          asrAdhan: editing.asrAdhan,
          asrIqamah: editing.asrIqamah,
          maghribAdhan: editing.maghribAdhan,
          maghribIqamah: editing.maghribIqamah,
          ishaAdhan: editing.ishaAdhan,
          ishaIqamah: editing.ishaIqamah,
          jummahKhutbah: editing.jummahKhutbah ?? "",
          jummahIqamah: editing.jummahIqamah ?? "",
          sunrise: editing.sunrise ?? "",
        }
      : {
          date: "",
          fajrAdhan: "",
          fajrIqamah: "",
          dhuhrAdhan: "",
          dhuhrIqamah: "",
          asrAdhan: "",
          asrIqamah: "",
          maghribAdhan: "",
          maghribIqamah: "",
          ishaAdhan: "",
          ishaIqamah: "",
          jummahKhutbah: "",
          jummahIqamah: "",
          sunrise: "",
        },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getAdminListPrayerTimesQueryKey() });

  const createMutation = useAdminCreatePrayerTime({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Prayer time added" });
        onOpenChange(false);
      },
      onError: (error: unknown) =>
        toast({ title: "Failed to save", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
    },
  });

  const updateMutation = useAdminUpdatePrayerTime({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Prayer time updated" });
        onOpenChange(false);
      },
      onError: (error: unknown) =>
        toast({ title: "Failed to save", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
    },
  });

  function onSubmit(values: PrayerTimeForm) {
    const payload = {
      ...values,
      jummahKhutbah: values.jummahKhutbah || undefined,
      jummahIqamah: values.jummahIqamah || undefined,
      sunrise: values.sunrise || undefined,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Prayer Time" : "Add Prayer Time"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" data-testid="input-prayer-date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sunrise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sunrise</FormLabel>
                  <FormControl>
                    <Input placeholder="06:15" data-testid="input-sunrise" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FIELD_GROUPS.map((group) => (
                <div key={group.label} className="border border-border rounded-md p-3 space-y-3">
                  <p className="text-sm font-medium">{group.label}</p>
                  <FormField
                    control={form.control}
                    name={group.adhan}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Adhan</FormLabel>
                        <FormControl>
                          <Input placeholder="05:12" data-testid={`input-${group.adhan}`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {group.iqamah && (
                    <FormField
                      control={form.control}
                      name={group.iqamah}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Iqamah</FormLabel>
                          <FormControl>
                            <Input placeholder="05:30" data-testid={`input-${group.iqamah}`} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jummahKhutbah"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumu'ah Khutbah</FormLabel>
                    <FormControl>
                      <Input placeholder="13:00" data-testid="input-jummah-khutbah" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jummahIqamah"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumu'ah Iqamah</FormLabel>
                    <FormControl>
                      <Input placeholder="13:15" data-testid="input-jummah-iqamah" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending} data-testid="button-save-prayer-time">
                {isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function PrayerTimesTab() {
  const { data, isLoading } = useAdminListPrayerTimes();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PrayerTime | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteMutation = useAdminDeletePrayerTime({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListPrayerTimesQueryKey() });
        toast({ title: "Prayer time deleted" });
        setDeleteId(null);
      },
    },
  });

  const sorted = [...(data ?? [])].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          data-testid="button-add-prayer-time"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Prayer Time
        </Button>
      </div>
      <Card className="border-card-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Fajr</TableHead>
                <TableHead>Dhuhr</TableHead>
                <TableHead>Asr</TableHead>
                <TableHead>Maghrib</TableHead>
                <TableHead>Isha</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No prayer times yet.
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((row) => (
                  <TableRow key={row.id} data-testid={`row-prayer-time-${row.id}`}>
                    <TableCell className="font-medium">{row.date}</TableCell>
                    <TableCell>{row.fajrIqamah}</TableCell>
                    <TableCell>{row.dhuhrIqamah}</TableCell>
                    <TableCell>{row.asrIqamah}</TableCell>
                    <TableCell>{row.maghribIqamah}</TableCell>
                    <TableCell>{row.ishaIqamah}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditing(row);
                          setDialogOpen(true);
                        }}
                        data-testid={`button-edit-${row.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteId(row.id)}
                        data-testid={`button-delete-${row.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      <PrayerTimeDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete prayer time?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const timetablePdfSchema = z.object({
  title: z.string().min(1, "Title is required"),
  fileUrl: z.string().min(1, "File URL is required"),
  monthLabel: z.string().min(1, "Month label is required"),
  active: z.boolean(),
  sortOrder: z.coerce.number().int().default(0),
});
type TimetablePdfForm = z.infer<typeof timetablePdfSchema>;

function TimetablePdfDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: TimetablePdf | null;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<TimetablePdfForm>({
    resolver: zodResolver(timetablePdfSchema),
    defaultValues: editing
      ? {
          title: editing.title,
          fileUrl: editing.fileUrl,
          monthLabel: editing.monthLabel,
          active: editing.active,
          sortOrder: editing.sortOrder,
        }
      : { title: "", fileUrl: "", monthLabel: "", active: true, sortOrder: 0 },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getAdminListTimetablePdfsQueryKey() });

  const createMutation = useAdminCreateTimetablePdf({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Timetable added" });
        onOpenChange(false);
      },
      onError: (error: unknown) =>
        toast({ title: "Failed to save", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
    },
  });
  const updateMutation = useAdminUpdateTimetablePdf({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Timetable updated" });
        onOpenChange(false);
      },
      onError: (error: unknown) =>
        toast({ title: "Failed to save", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
    },
  });

  function onSubmit(values: TimetablePdfForm) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: values });
    } else {
      createMutation.mutate({ data: values });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Timetable PDF" : "Add Timetable PDF"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="2026 Full Year Timetable" data-testid="input-pdf-title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monthLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month/Period Label</FormLabel>
                  <FormControl>
                    <Input placeholder="January - December 2026" data-testid="input-pdf-month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File URL</FormLabel>
                  <FormControl>
                    <Input placeholder="/uploads/timetable-2026.pdf" data-testid="input-pdf-url" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input type="number" data-testid="input-pdf-sort" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border border-border p-3">
                  <FormLabel className="mb-0">Active (visible on site)</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-pdf-active" />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending} data-testid="button-save-pdf">
                {isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function TimetablePdfsTab() {
  const { data, isLoading } = useAdminListTimetablePdfs();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TimetablePdf | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteMutation = useAdminDeleteTimetablePdf({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListTimetablePdfsQueryKey() });
        toast({ title: "Timetable deleted" });
        setDeleteId(null);
      },
    },
  });

  const sorted = [...(data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          data-testid="button-add-pdf"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add PDF
        </Button>
      </div>
      <Card className="border-card-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No timetable PDFs yet.
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((row) => (
                  <TableRow key={row.id} data-testid={`row-pdf-${row.id}`}>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell>{row.monthLabel}</TableCell>
                    <TableCell>{row.active ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditing(row);
                          setDialogOpen(true);
                        }}
                        data-testid={`button-edit-pdf-${row.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteId(row.id)}
                        data-testid={`button-delete-pdf-${row.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      <TimetablePdfDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete timetable PDF?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminPrayerTimesPage() {
  return (
    <AdminLayout>
      <h1 className="font-serif text-3xl mb-2">Prayer Times</h1>
      <p className="text-muted-foreground mb-6">Manage daily prayer times and full-year timetable PDFs.</p>
      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily" data-testid="tab-daily">Daily Times</TabsTrigger>
          <TabsTrigger value="pdfs" data-testid="tab-pdfs">Timetable PDFs</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="mt-6">
          <PrayerTimesTab />
        </TabsContent>
        <TabsContent value="pdfs" className="mt-6">
          <TimetablePdfsTab />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
