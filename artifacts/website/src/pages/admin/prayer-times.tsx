import { useRef, useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  useAdminGetPrayerCalculationSettings,
  useAdminUpdatePrayerCalculationSettings,
  useAdminGeneratePrayerTimes,
  getAdminListPrayerTimesQueryKey,
  getAdminListTimetablePdfsQueryKey,
  getAdminGetPrayerCalculationSettingsQueryKey,
  getListPrayerTimesPublicQueryKey,
  useAdminListSettings,
  useAdminUpsertSetting,
  getAdminListSettingsQueryKey,
  PrayerCalculationSettingsCalculationMethod,
  PrayerCalculationSettingsMadhab,
  PrayerCalculationSettingsHighLatitudeRule,
  type PrayerTime,
  type TimetablePdf,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload, FileText, Sparkles, Settings2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ObjectUploader } from "@workspace/object-storage-web";
import type { UppyFile, UploadResult } from "@uppy/core";
import { MASJID_WRITE, useCanWrite } from "@/lib/permissions";

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
  const canWrite = useCanWrite(MASJID_WRITE);
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
        {canWrite && (
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
        )}
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
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
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
                    <TableCell>
                      {row.isManualOverride ? (
                        <span
                          className="inline-flex items-center rounded-full bg-secondary/20 px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                          data-testid={`badge-override-${row.id}`}
                        >
                          Manual
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Calculated</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {canWrite && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditing(row);
                              setDialogOpen(true);
                            }}
                            data-testid={`button-edit-${row.id}`}
                            aria-label={`Edit prayer time for ${row.date}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteId(row.id)}
                            data-testid={`button-delete-${row.id}`}
                            aria-label={`Delete prayer time for ${row.date}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
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
  fileUrl: z.string().min(1, "Please upload a PDF file"),
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
  const uploadedObjectPathsRef = useRef<Map<string, string>>(new Map());
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
                  <FormLabel>PDF File</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <ObjectUploader
                        maxNumberOfFiles={1}
                        maxFileSize={26214400}
                        buttonClassName="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                        onGetUploadParameters={async (file: UppyFile<Record<string, unknown>, Record<string, unknown>>) => {
                          const res = await fetch("/api/storage/uploads/request-url", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({
                              name: file.name,
                              size: file.size,
                              contentType: file.type || "application/pdf",
                            }),
                          });
                          if (!res.ok) {
                            throw new Error("Failed to get upload URL");
                          }
                          const data = await res.json();
                          // The object path is known as soon as we get the upload URL —
                          // the PUT response body itself is not reliable (some storage
                          // backends return an empty body on a successful upload), so we
                          // stash it here keyed by file id and read it back in onComplete.
                          uploadedObjectPathsRef.current.set(file.id, data.objectPath as string);
                          return {
                            method: "PUT" as const,
                            url: data.uploadURL,
                            headers: { "Content-Type": file.type || "application/pdf" },
                          };
                        }}
                        onComplete={(result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
                          const uploaded = result.successful?.[0];
                          const objectPath = uploaded?.id ? uploadedObjectPathsRef.current.get(uploaded.id) : undefined;
                          if (objectPath && uploaded?.id) {
                            field.onChange(`/api/storage${objectPath}`);
                            uploadedObjectPathsRef.current.delete(uploaded.id);
                          }
                        }}
                      >
                        <Upload className="h-4 w-4" />
                        {field.value ? "Replace PDF" : "Upload PDF"}
                      </ObjectUploader>
                      {field.value && (
                        <span
                          className="flex items-center gap-1 text-sm text-muted-foreground truncate max-w-[240px]"
                          data-testid="text-pdf-uploaded"
                        >
                          <FileText className="h-4 w-4 shrink-0" />
                          File uploaded
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <input type="hidden" data-testid="input-pdf-url" {...field} />
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
  const canWrite = useCanWrite(MASJID_WRITE);
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
        {canWrite && (
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
        )}
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
                      {canWrite && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditing(row);
                              setDialogOpen(true);
                            }}
                            data-testid={`button-edit-pdf-${row.id}`}
                            aria-label={`Edit ${row.title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteId(row.id)}
                            data-testid={`button-delete-pdf-${row.id}`}
                            aria-label={`Delete ${row.title}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
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

const calculationSettingsSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  timezone: z.string().min(1, "Timezone is required"),
  calculationMethod: z.nativeEnum(PrayerCalculationSettingsCalculationMethod),
  madhab: z.nativeEnum(PrayerCalculationSettingsMadhab),
  highLatitudeRule: z.nativeEnum(PrayerCalculationSettingsHighLatitudeRule),
  fajrAdjustment: z.coerce.number(),
  sunriseAdjustment: z.coerce.number(),
  dhuhrAdjustment: z.coerce.number(),
  asrAdjustment: z.coerce.number(),
  maghribAdjustment: z.coerce.number(),
  ishaAdjustment: z.coerce.number(),
  fajrIqamahOffset: z.coerce.number(),
  dhuhrIqamahOffset: z.coerce.number(),
  asrIqamahOffset: z.coerce.number(),
  maghribIqamahOffset: z.coerce.number(),
  ishaIqamahOffset: z.coerce.number(),
  iqamahRoundingMinutes: z.coerce.number().min(0),
});
type CalculationSettingsForm = z.infer<typeof calculationSettingsSchema>;

const METHOD_OPTIONS = Object.values(PrayerCalculationSettingsCalculationMethod);
const MADHAB_OPTIONS = Object.values(PrayerCalculationSettingsMadhab);
const HIGH_LAT_OPTIONS = Object.values(PrayerCalculationSettingsHighLatitudeRule);

function CalculationSettingsTab() {
  const { data: settings, isLoading } = useAdminGetPrayerCalculationSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canWrite = useCanWrite(MASJID_WRITE);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const form = useForm<CalculationSettingsForm>({
    resolver: zodResolver(calculationSettingsSchema),
    values: settings
      ? {
          latitude: settings.latitude,
          longitude: settings.longitude,
          timezone: settings.timezone,
          calculationMethod: settings.calculationMethod,
          madhab: settings.madhab,
          highLatitudeRule: settings.highLatitudeRule,
          fajrAdjustment: settings.fajrAdjustment,
          sunriseAdjustment: settings.sunriseAdjustment,
          dhuhrAdjustment: settings.dhuhrAdjustment,
          asrAdjustment: settings.asrAdjustment,
          maghribAdjustment: settings.maghribAdjustment,
          ishaAdjustment: settings.ishaAdjustment,
          fajrIqamahOffset: settings.fajrIqamahOffset,
          dhuhrIqamahOffset: settings.dhuhrIqamahOffset,
          asrIqamahOffset: settings.asrIqamahOffset,
          maghribIqamahOffset: settings.maghribIqamahOffset,
          ishaIqamahOffset: settings.ishaIqamahOffset,
          iqamahRoundingMinutes: settings.iqamahRoundingMinutes,
        }
      : undefined,
  });

  const updateMutation = useAdminUpdatePrayerCalculationSettings({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminGetPrayerCalculationSettingsQueryKey() });
        toast({ title: "Calculation settings saved" });
      },
      onError: (error: unknown) =>
        toast({ title: "Failed to save", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
    },
  });

  const generateMutation = useAdminGeneratePrayerTimes({
    mutation: {
      onSuccess: (result) => {
        queryClient.invalidateQueries({ queryKey: getAdminListPrayerTimesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListPrayerTimesPublicQueryKey() });
        toast({
          title: "Prayer times generated",
          description: `${result.generated} generated, ${result.skipped} skipped (manual overrides), ${result.total} total.`,
        });
        setGenerateOpen(false);
      },
      onError: (error: unknown) =>
        toast({ title: "Failed to generate", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
    },
  });

  function onSubmit(values: CalculationSettingsForm) {
    updateMutation.mutate({ data: values });
  }

  if (isLoading) {
    return <p className="text-muted-foreground">Loading settings...</p>;
  }

  return (
    <div className="space-y-8">
      <Card className="border-card-border">
        <CardContent className="pt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Generate Prayer Times
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Automatically calculate Adhan/Iqamah times for a date range using the settings below.
              Dates with manual overrides are left untouched.
            </p>
          </div>
          {canWrite && (
            <Button onClick={() => setGenerateOpen(true)} data-testid="button-generate-prayer-times">
              Generate / Regenerate
            </Button>
          )}
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-card-border">
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                Location &amp; Method
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" data-testid="input-latitude" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" data-testid="input-longitude" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone (IANA)</FormLabel>
                      <FormControl>
                        <Input placeholder="Europe/London" data-testid="input-timezone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="calculationMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calculation Method</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-calculation-method">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {METHOD_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="madhab"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Madhab (Asr calculation)</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-madhab">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MADHAB_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="highLatitudeRule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>High Latitude Rule</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-high-latitude-rule">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {HIGH_LAT_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-card-border">
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium">Adhan Time Adjustments (minutes)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {(
                  [
                    ["fajrAdjustment", "Fajr"],
                    ["sunriseAdjustment", "Sunrise"],
                    ["dhuhrAdjustment", "Dhuhr"],
                    ["asrAdjustment", "Asr"],
                    ["maghribAdjustment", "Maghrib"],
                    ["ishaAdjustment", "Isha"],
                  ] as const
                ).map(([name, label]) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">{label}</FormLabel>
                        <FormControl>
                          <Input type="number" data-testid={`input-${name}`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-card-border">
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium">Iqamah Offsets (minutes after Adhan)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {(
                  [
                    ["fajrIqamahOffset", "Fajr"],
                    ["dhuhrIqamahOffset", "Dhuhr"],
                    ["asrIqamahOffset", "Asr"],
                    ["maghribIqamahOffset", "Maghrib"],
                    ["ishaIqamahOffset", "Isha"],
                    ["iqamahRoundingMinutes", "Round to nearest"],
                  ] as const
                ).map(([name, label]) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">{label}</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} data-testid={`input-${name}`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {canWrite && (
            <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-calculation-settings">
              {updateMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          )}
        </form>
      </Form>

      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Prayer Times</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose a date range (max 400 days). Existing manual overrides will not be changed.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  data-testid="input-generate-start-date"
                />
              </div>
              <div>
                <label className="text-sm font-medium">End date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  data-testid="input-generate-end-date"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => generateMutation.mutate({ data: { startDate, endDate } })}
              disabled={!startDate || !endDate || generateMutation.isPending}
              data-testid="button-confirm-generate"
            >
              {generateMutation.isPending ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const SLOT_LABELS = ["1st Jamah", "2nd Jamah", "3rd Jamah", "4th Jamah"];

function JumuahEidTab() {
  const { data: settings, isLoading } = useAdminListSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const canWrite = useCanWrite(MASJID_WRITE);

  const [jummahSlots, setJummahSlots] = useState<string[]>(["", "", "", ""]);
  const [eidFitrDate, setEidFitrDate] = useState("");
  const [eidFitrSlots, setEidFitrSlots] = useState<string[]>(["", "", "", ""]);
  const [eidAdhaDate, setEidAdhaDate] = useState("");
  const [eidAdhaSlots, setEidAdhaSlots] = useState<string[]>(["", "", "", ""]);
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (!settings || init) return;
    const get = (key: string) => settings.find((s) => s.key === key)?.value ?? "";
    const parseTimes = (key: string): string[] => {
      try {
        const v = get(key);
        if (!v) return ["", "", "", ""];
        const arr = JSON.parse(v) as string[];
        return [...arr, "", "", "", ""].slice(0, 4);
      } catch { return ["", "", "", ""]; }
    };
    setJummahSlots(parseTimes("jummah_times"));
    setEidFitrDate(get("eid_al_fitr_date"));
    setEidFitrSlots(parseTimes("eid_al_fitr_times"));
    setEidAdhaDate(get("eid_al_adha_date"));
    setEidAdhaSlots(parseTimes("eid_al_adha_times"));
    setInit(true);
  }, [settings, init]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getAdminListSettingsQueryKey() });

  const onErr = (error: unknown) =>
    toast({ title: "Failed to save", description: error instanceof Error ? error.message : undefined, variant: "destructive" });

  const jummahMut = useAdminUpsertSetting({ mutation: { onSuccess: () => { invalidate(); toast({ title: "Jumu'ah times saved" }); }, onError: onErr } });
  const eidFitrDateMut = useAdminUpsertSetting({ mutation: { onSuccess: () => { invalidate(); toast({ title: "Eid ul-Fitr saved" }); }, onError: onErr } });
  const eidFitrTimesMut = useAdminUpsertSetting({ mutation: { onSuccess: () => {}, onError: onErr } });
  const eidAdhaDateMut = useAdminUpsertSetting({ mutation: { onSuccess: () => { invalidate(); toast({ title: "Eid ul-Adha saved" }); }, onError: onErr } });
  const eidAdhaTimesMut = useAdminUpsertSetting({ mutation: { onSuccess: () => {}, onError: onErr } });

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-8">

      {/* ── Jumu'ah Times ──────────────────────────────────────── */}
      <Card className="border-secondary/30 bg-primary/3">
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <span className="text-secondary font-normal">الجمعة</span>
            Jumu'ah Jamah Times
          </CardTitle>
          <CardDescription>
            Set up to 4 weekly Friday Jamu'ah times. These display on the app and website every Friday.
            Leave slots blank to omit them.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SLOT_LABELS.map((label, i) => (
              <div key={i}>
                <label className="text-sm font-medium mb-1 block">{label}</label>
                <Input
                  type="time"
                  value={jummahSlots[i] ?? ""}
                  onChange={(e) => { const n = [...jummahSlots]; n[i] = e.target.value; setJummahSlots(n); }}
                  data-testid={`input-jummah-slot-${i}`}
                  disabled={!canWrite}
                />
              </div>
            ))}
          </div>
          {canWrite && (
            <Button
              onClick={() => jummahMut.mutate({ key: "jummah_times", data: { value: JSON.stringify(jummahSlots.filter((t) => t.trim())) } })}
              disabled={jummahMut.isPending}
              data-testid="button-save-jummah-times"
            >
              {jummahMut.isPending ? "Saving…" : "Save Jumu'ah Times"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* ── Eid ul-Fitr ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <span className="text-secondary font-normal">عيد الفطر</span>
            Eid ul-Fitr Prayer Times
          </CardTitle>
          <CardDescription>
            Set the date and up to 4 Jamah times. The Eid card appears on the app and website on that date only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Eid ul-Fitr Date</label>
            <Input
              type="date"
              value={eidFitrDate}
              onChange={(e) => setEidFitrDate(e.target.value)}
              className="max-w-xs"
              data-testid="input-eid-fitr-date"
              disabled={!canWrite}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SLOT_LABELS.map((label, i) => (
              <div key={i}>
                <label className="text-sm font-medium mb-1 block">{label}</label>
                <Input
                  type="time"
                  value={eidFitrSlots[i] ?? ""}
                  onChange={(e) => { const n = [...eidFitrSlots]; n[i] = e.target.value; setEidFitrSlots(n); }}
                  data-testid={`input-eid-fitr-slot-${i}`}
                  disabled={!canWrite}
                />
              </div>
            ))}
          </div>
          {canWrite && (
            <Button
              onClick={() => {
                eidFitrDateMut.mutate({ key: "eid_al_fitr_date", data: { value: eidFitrDate } });
                eidFitrTimesMut.mutate({ key: "eid_al_fitr_times", data: { value: JSON.stringify(eidFitrSlots.filter((t) => t.trim())) } });
              }}
              disabled={eidFitrDateMut.isPending || eidFitrTimesMut.isPending}
              data-testid="button-save-eid-fitr"
            >
              {(eidFitrDateMut.isPending || eidFitrTimesMut.isPending) ? "Saving…" : "Save Eid ul-Fitr"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* ── Eid ul-Adha ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <span className="text-secondary font-normal">عيد الأضحى</span>
            Eid ul-Adha Prayer Times
          </CardTitle>
          <CardDescription>
            Set the date and up to 4 Jamah times. The Eid card appears on the app and website on that date only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Eid ul-Adha Date</label>
            <Input
              type="date"
              value={eidAdhaDate}
              onChange={(e) => setEidAdhaDate(e.target.value)}
              className="max-w-xs"
              data-testid="input-eid-adha-date"
              disabled={!canWrite}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SLOT_LABELS.map((label, i) => (
              <div key={i}>
                <label className="text-sm font-medium mb-1 block">{label}</label>
                <Input
                  type="time"
                  value={eidAdhaSlots[i] ?? ""}
                  onChange={(e) => { const n = [...eidAdhaSlots]; n[i] = e.target.value; setEidAdhaSlots(n); }}
                  data-testid={`input-eid-adha-slot-${i}`}
                  disabled={!canWrite}
                />
              </div>
            ))}
          </div>
          {canWrite && (
            <Button
              onClick={() => {
                eidAdhaDateMut.mutate({ key: "eid_al_adha_date", data: { value: eidAdhaDate } });
                eidAdhaTimesMut.mutate({ key: "eid_al_adha_times", data: { value: JSON.stringify(eidAdhaSlots.filter((t) => t.trim())) } });
              }}
              disabled={eidAdhaDateMut.isPending || eidAdhaTimesMut.isPending}
              data-testid="button-save-eid-adha"
            >
              {(eidAdhaDateMut.isPending || eidAdhaTimesMut.isPending) ? "Saving…" : "Save Eid ul-Adha"}
            </Button>
          )}
        </CardContent>
      </Card>
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
          <TabsTrigger value="settings" data-testid="tab-settings">Calculation Settings</TabsTrigger>
          <TabsTrigger value="pdfs" data-testid="tab-pdfs">Timetable PDFs</TabsTrigger>
          <TabsTrigger value="jumuah" data-testid="tab-jumuah">Jumu'ah &amp; Eid</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="mt-6">
          <PrayerTimesTab />
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <CalculationSettingsTab />
        </TabsContent>
        <TabsContent value="pdfs" className="mt-6">
          <TimetablePdfsTab />
        </TabsContent>
        <TabsContent value="jumuah" className="mt-6">
          <JumuahEidTab />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
