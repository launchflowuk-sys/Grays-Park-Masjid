import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useAdminListCourses,
  useAdminCreateCourse,
  useAdminUpdateCourse,
  useAdminDeleteCourse,
  getAdminListCoursesQueryKey,
  useAdminListCourseRegistrations,
  useAdminUpdateCourseRegistration,
  getAdminListCourseRegistrationsQueryKey,
  type Course,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  ageGroup: z.string().optional(),
  schedule: z.string().optional(),
  fee: z.string().optional(),
  capacity: z.coerce.number().int().optional().or(z.literal("")),
  imageUrl: z.string().optional(),
  published: z.boolean(),
});
type CourseForm = z.infer<typeof courseSchema>;

function CourseDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Course | null;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: editing
      ? {
          title: editing.title,
          description: editing.description,
          ageGroup: editing.ageGroup ?? "",
          schedule: editing.schedule ?? "",
          fee: editing.fee ?? "",
          capacity: editing.capacity ?? "",
          imageUrl: editing.imageUrl ?? "",
          published: editing.published,
        }
      : {
          title: "",
          description: "",
          ageGroup: "",
          schedule: "",
          fee: "",
          capacity: "",
          imageUrl: "",
          published: true,
        },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getAdminListCoursesQueryKey() });

  const createMutation = useAdminCreateCourse({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Course created" });
        onOpenChange(false);
      },
      onError: (error: unknown) =>
        toast({ title: "Failed to save", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
    },
  });
  const updateMutation = useAdminUpdateCourse({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Course updated" });
        onOpenChange(false);
      },
      onError: (error: unknown) =>
        toast({ title: "Failed to save", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
    },
  });

  function onSubmit(values: CourseForm) {
    const payload = {
      title: values.title,
      description: values.description,
      ageGroup: values.ageGroup || undefined,
      schedule: values.schedule || undefined,
      fee: values.fee || undefined,
      capacity: values.capacity === "" ? undefined : Number(values.capacity),
      imageUrl: values.imageUrl || undefined,
      published: values.published,
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
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Course" : "New Course"}</DialogTitle>
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
                    <Input data-testid="input-course-title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} data-testid="input-course-description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ageGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age Group (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ages 7-12" data-testid="input-course-age-group" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="schedule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Saturdays 10am-12pm" data-testid="input-course-schedule" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee in £ (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="20.00" data-testid="input-course-fee" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity (optional)</FormLabel>
                    <FormControl>
                      <Input type="number" data-testid="input-course-capacity" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input data-testid="input-course-image" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border border-border p-3">
                  <FormLabel className="mb-0">Published</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-course-published" />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending} data-testid="button-save-course">
                {isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function CoursesTab() {
  const { data, isLoading } = useAdminListCourses();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteMutation = useAdminDeleteCourse({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListCoursesQueryKey() });
        toast({ title: "Course deleted" });
        setDeleteId(null);
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          data-testid="button-add-course"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Course
        </Button>
      </div>
      <Card className="border-card-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Age Group</TableHead>
                <TableHead>Published</TableHead>
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
              ) : (data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No courses yet.
                  </TableCell>
                </TableRow>
              ) : (
                (data ?? []).map((row) => (
                  <TableRow key={row.id} data-testid={`row-course-${row.id}`}>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell>{row.ageGroup ?? "-"}</TableCell>
                    <TableCell>
                      <Badge variant={row.published ? "default" : "secondary"}>
                        {row.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditing(row);
                          setDialogOpen(true);
                        }}
                        data-testid={`button-edit-course-${row.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteId(row.id)}
                        data-testid={`button-delete-course-${row.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CourseDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete course?</AlertDialogTitle>
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

const REGISTRATION_STATUS_OPTIONS = ["pending", "confirmed", "waitlisted", "cancelled"] as const;

function registrationStatusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  if (status === "confirmed") return "default";
  if (status === "pending") return "secondary";
  if (status === "cancelled") return "destructive";
  return "outline";
}

function RegistrationsTab() {
  const { data: courses } = useAdminListCourses();
  const { data, isLoading } = useAdminListCourseRegistrations();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateMutation = useAdminUpdateCourseRegistration({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListCourseRegistrationsQueryKey() });
        toast({ title: "Registration updated" });
      },
    },
  });

  const courseTitle = (id: string) => courses?.find((c) => c.id === id)?.title ?? "Unknown course";

  const sorted = [...(data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <Card className="border-card-border">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
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
                  No registrations yet.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((row) => (
                <TableRow key={row.id} data-testid={`row-registration-${row.id}`}>
                  <TableCell className="font-medium">
                    {row.studentName}
                    {row.guardianName && (
                      <p className="text-xs text-muted-foreground">Guardian: {row.guardianName}</p>
                    )}
                  </TableCell>
                  <TableCell>{courseTitle(row.courseId)}</TableCell>
                  <TableCell>
                    <p className="text-sm">{row.email}</p>
                    {row.phone && <p className="text-xs text-muted-foreground">{row.phone}</p>}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={row.status}
                      onValueChange={(status) => updateMutation.mutate({ id: row.id, data: { status } })}
                    >
                      <SelectTrigger className="w-36" data-testid={`select-registration-status-${row.id}`}>
                        <SelectValue>
                          <Badge variant={registrationStatusVariant(row.status)}>
                            {row.status.replace(/_/g, " ")}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {REGISTRATION_STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function AdminCoursesPage() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-3xl mb-2">Courses</h1>
        <p className="text-muted-foreground">Manage education courses and review registrations.</p>
      </div>

      <Tabs defaultValue="courses">
        <TabsList className="mb-4">
          <TabsTrigger value="courses" data-testid="tab-courses">Courses</TabsTrigger>
          <TabsTrigger value="registrations" data-testid="tab-registrations">Registrations</TabsTrigger>
        </TabsList>
        <TabsContent value="courses">
          <CoursesTab />
        </TabsContent>
        <TabsContent value="registrations">
          <RegistrationsTab />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
