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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/form";
import {
  useAdminListQuranReflections,
  useAdminCreateQuranReflection,
  useAdminUpdateQuranReflection,
  useAdminDeleteQuranReflection,
  getAdminListQuranReflectionsQueryKey,
  type QuranReflection,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { CONTENT_WRITE, useCanWrite } from "@/lib/permissions";

const reflectionSchema = z.object({
  surahNumber: z.coerce.number().int().min(1).max(114),
  ayahNumber: z.coerce.number().int().min(1),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  author: z.string().optional(),
  status: z.enum(["draft", "published"]),
  showPublicly: z.boolean(),
});
type ReflectionForm = z.infer<typeof reflectionSchema>;

function ReflectionDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: QuranReflection | null;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<ReflectionForm>({
    resolver: zodResolver(reflectionSchema),
    defaultValues: editing
      ? {
          surahNumber: editing.surahNumber,
          ayahNumber: editing.ayahNumber,
          title: editing.title,
          content: editing.content,
          author: editing.author ?? "",
          status: (editing.status as "draft" | "published") ?? "draft",
          showPublicly: editing.showPublicly,
        }
      : {
          surahNumber: 1,
          ayahNumber: 1,
          title: "",
          content: "",
          author: "",
          status: "draft",
          showPublicly: true,
        },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getAdminListQuranReflectionsQueryKey() });

  const createMutation = useAdminCreateQuranReflection({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Reflection created" });
        onOpenChange(false);
      },
      onError: (error: unknown) =>
        toast({ title: "Failed to save", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
    },
  });
  const updateMutation = useAdminUpdateQuranReflection({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Reflection updated" });
        onOpenChange(false);
      },
      onError: (error: unknown) =>
        toast({ title: "Failed to save", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
    },
  });

  function onSubmit(values: ReflectionForm) {
    const payload = { ...values, author: values.author || undefined };
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
          <DialogTitle>{editing ? "Edit Reflection" : "New Reflection"}</DialogTitle>
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
                      <Input type="number" min={1} max={114} data-testid="input-reflection-surah" {...field} />
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
                      <Input type="number" min={1} data-testid="input-reflection-ayah" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input data-testid="input-reflection-title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea rows={6} data-testid="input-reflection-content" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author (optional)</FormLabel>
                  <FormControl>
                    <Input data-testid="input-reflection-author" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger data-testid="select-reflection-status">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="showPublicly"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border border-border p-3">
                  <FormLabel className="mb-0">Show Publicly</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-reflection-public" />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending} data-testid="button-save-reflection">
                {isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminQuranReflectionsPage() {
  const { data, isLoading } = useAdminListQuranReflections();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const canWrite = useCanWrite(CONTENT_WRITE);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<QuranReflection | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteMutation = useAdminDeleteQuranReflection({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListQuranReflectionsQueryKey() });
        toast({ title: "Reflection deleted" });
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
          <h1 className="font-serif text-3xl mb-2">Qur&apos;an Reflections</h1>
          <p className="text-muted-foreground">Manage scholarly reflections attached to specific ayahs.</p>
        </div>
        {canWrite && (
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            data-testid="button-add-reflection"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Reflection
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
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
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
                      No reflections yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  sorted.map((row) => (
                    <TableRow key={row.id} data-testid={`row-reflection-${row.id}`}>
                      <TableCell className="font-medium">
                        {row.surahNumber}:{row.ayahNumber}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{row.title}</TableCell>
                      <TableCell>{row.author || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={row.status === "published" ? "default" : "secondary"}>
                          {row.status === "published" ? "Published" : "Draft"}
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
                              data-testid={`button-edit-reflection-${row.id}`}
                              aria-label={`Edit ${row.title}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteId(row.id)}
                              data-testid={`button-delete-reflection-${row.id}`}
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

      <ReflectionDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete reflection?</AlertDialogTitle>
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
