import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  FormDescription,
} from "@/components/ui/form";
import {
  useAdminListFeaturedAyah,
  useAdminCreateFeaturedAyah,
  useAdminUpdateFeaturedAyah,
  useAdminDeleteFeaturedAyah,
  getAdminListFeaturedAyahQueryKey,
  getGetFeaturedAyahPublicQueryKey,
  type FeaturedAyah,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { CONTENT_WRITE, useCanWrite } from "@/lib/permissions";

const featuredAyahSchema = z.object({
  surahNumber: z.coerce.number().int().min(1).max(114),
  ayahNumber: z.coerce.number().int().min(1),
  reflectionTitle: z.string().optional(),
  reflectionText: z.string().optional(),
  isPublished: z.boolean(),
  showOnHomepage: z.boolean(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
type FeaturedAyahForm = z.infer<typeof featuredAyahSchema>;

function toDateInput(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function FeaturedAyahDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: FeaturedAyah | null;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<FeaturedAyahForm>({
    resolver: zodResolver(featuredAyahSchema),
    defaultValues: editing
      ? {
          surahNumber: editing.surahNumber,
          ayahNumber: editing.ayahNumber,
          reflectionTitle: editing.reflectionTitle ?? "",
          reflectionText: editing.reflectionText ?? "",
          isPublished: editing.isPublished,
          showOnHomepage: editing.showOnHomepage,
          startDate: toDateInput(editing.startDate),
          endDate: toDateInput(editing.endDate),
        }
      : {
          surahNumber: 1,
          ayahNumber: 1,
          reflectionTitle: "",
          reflectionText: "",
          isPublished: true,
          showOnHomepage: true,
          startDate: "",
          endDate: "",
        },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getAdminListFeaturedAyahQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetFeaturedAyahPublicQueryKey() });
  };

  const createMutation = useAdminCreateFeaturedAyah({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Featured ayah created" });
        onOpenChange(false);
      },
      onError: (error: unknown) =>
        toast({ title: "Failed to save", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
    },
  });
  const updateMutation = useAdminUpdateFeaturedAyah({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Featured ayah updated" });
        onOpenChange(false);
      },
      onError: (error: unknown) =>
        toast({ title: "Failed to save", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
    },
  });

  function onSubmit(values: FeaturedAyahForm) {
    const payload = {
      ...values,
      reflectionTitle: values.reflectionTitle || undefined,
      reflectionText: values.reflectionText || undefined,
      startDate: values.startDate ? new Date(values.startDate).toISOString() : undefined,
      endDate: values.endDate ? new Date(values.endDate).toISOString() : undefined,
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
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Featured Ayah" : "New Featured Ayah"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="surahNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surah Number</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={114} data-testid="input-featured-surah" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ayahNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ayah Number</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} data-testid="input-featured-ayah" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="reflectionTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reflection Title (optional)</FormLabel>
                  <FormControl>
                    <Input data-testid="input-featured-reflection-title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reflectionText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reflection Text (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={4} data-testid="input-featured-reflection-text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date (optional)</FormLabel>
                    <FormControl>
                      <Input type="date" data-testid="input-featured-start-date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (optional)</FormLabel>
                    <FormControl>
                      <Input type="date" data-testid="input-featured-end-date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border border-border p-3">
                  <FormLabel className="mb-0">Published</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-featured-published" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="showOnHomepage"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <FormLabel className="mb-0">Show on Homepage</FormLabel>
                    <FormDescription>Only one active ayah is shown at a time.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-featured-homepage" />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending} data-testid="button-save-featured-ayah">
                {isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminQuranFeaturedAyahPage() {
  const { data, isLoading } = useAdminListFeaturedAyah();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const canWrite = useCanWrite(CONTENT_WRITE);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FeaturedAyah | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteMutation = useAdminDeleteFeaturedAyah({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListFeaturedAyahQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetFeaturedAyahPublicQueryKey() });
        toast({ title: "Featured ayah deleted" });
        setDeleteId(null);
      },
    },
  });

  const sorted = [...(data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl mb-2">Featured Ayah</h1>
          <p className="text-muted-foreground">Manage the &ldquo;Ayah of the Day&rdquo; shown on the homepage and Qur&apos;an reader.</p>
        </div>
        {canWrite && (
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            data-testid="button-add-featured-ayah"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Featured Ayah
          </Button>
        )}
      </div>

      <Card className="border-card-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ayah</TableHead>
                  <TableHead>Reflection</TableHead>
                  <TableHead>Homepage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No featured ayahs yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  sorted.map((row) => (
                    <TableRow key={row.id} data-testid={`row-featured-ayah-${row.id}`}>
                      <TableCell className="font-medium">
                        {row.surahNumber}:{row.ayahNumber}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{row.reflectionTitle || "-"}</TableCell>
                      <TableCell>{row.showOnHomepage ? <Badge>Yes</Badge> : "-"}</TableCell>
                      <TableCell>
                        <Badge variant={row.isPublished ? "default" : "secondary"}>
                          {row.isPublished ? "Published" : "Draft"}
                        </Badge>
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
                              data-testid={`button-edit-featured-ayah-${row.id}`}
                              aria-label={`Edit ${row.surahNumber}:${row.ayahNumber}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteId(row.id)}
                              data-testid={`button-delete-featured-ayah-${row.id}`}
                              aria-label={`Delete ${row.surahNumber}:${row.ayahNumber}`}
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

      <FeaturedAyahDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete featured ayah?</AlertDialogTitle>
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
    </AdminLayout>
  );
}
