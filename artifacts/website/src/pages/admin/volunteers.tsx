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
  useAdminListVolunteerOpportunities,
  useAdminCreateVolunteerOpportunity,
  useAdminUpdateVolunteerOpportunity,
  useAdminDeleteVolunteerOpportunity,
  getAdminListVolunteerOpportunitiesQueryKey,
  useAdminListVolunteerApplications,
  useAdminUpdateVolunteerApplication,
  getAdminListVolunteerApplicationsQueryKey,
  type VolunteerOpportunity,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Download } from "lucide-react";

const opportunitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().optional(),
  active: z.boolean(),
});
type OpportunityForm = z.infer<typeof opportunitySchema>;

function OpportunityDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: VolunteerOpportunity | null;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<OpportunityForm>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: editing
      ? {
          title: editing.title,
          description: editing.description,
          imageUrl: editing.imageUrl ?? "",
          active: editing.active,
        }
      : { title: "", description: "", imageUrl: "", active: true },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getAdminListVolunteerOpportunitiesQueryKey() });

  const createMutation = useAdminCreateVolunteerOpportunity({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Opportunity created" });
        onOpenChange(false);
      },
      onError: (error: unknown) =>
        toast({ title: "Failed to save", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
    },
  });
  const updateMutation = useAdminUpdateVolunteerOpportunity({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Opportunity updated" });
        onOpenChange(false);
      },
      onError: (error: unknown) =>
        toast({ title: "Failed to save", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
    },
  });

  function onSubmit(values: OpportunityForm) {
    const payload = { ...values, imageUrl: values.imageUrl || undefined };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Opportunity" : "New Opportunity"}</DialogTitle>
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
                    <Input data-testid="input-opportunity-title" {...field} />
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
                    <Textarea rows={4} data-testid="input-opportunity-description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="/uploads/opportunity.jpg" data-testid="input-opportunity-image" {...field} />
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
                  <FormLabel className="mb-0">Active</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-opportunity-active" />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending} data-testid="button-save-opportunity">
                {isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function OpportunitiesTab() {
  const { data, isLoading } = useAdminListVolunteerOpportunities();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<VolunteerOpportunity | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteMutation = useAdminDeleteVolunteerOpportunity({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListVolunteerOpportunitiesQueryKey() });
        toast({ title: "Opportunity deleted" });
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
          data-testid="button-add-opportunity"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Opportunity
        </Button>
      </div>
      <Card className="border-card-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    No opportunities yet.
                  </TableCell>
                </TableRow>
              ) : (
                (data ?? []).map((row) => (
                  <TableRow key={row.id} data-testid={`row-opportunity-${row.id}`}>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell>
                      <Badge variant={row.active ? "default" : "secondary"}>
                        {row.active ? "Active" : "Inactive"}
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
                        data-testid={`button-edit-opportunity-${row.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteId(row.id)}
                        data-testid={`button-delete-opportunity-${row.id}`}
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

      <OpportunityDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete opportunity?</AlertDialogTitle>
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

const APPLICATION_STATUS_OPTIONS = ["pending", "accepted", "declined"] as const;

function applicationStatusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  if (status === "accepted") return "default";
  if (status === "pending") return "secondary";
  return "destructive";
}

function ApplicationsTab() {
  const { data: opportunities } = useAdminListVolunteerOpportunities();
  const { data, isLoading } = useAdminListVolunteerApplications();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateMutation = useAdminUpdateVolunteerApplication({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListVolunteerApplicationsQueryKey() });
        toast({ title: "Application updated" });
      },
    },
  });

  const opportunityTitle = (id: string) => opportunities?.find((o) => o.id === id)?.title ?? "Unknown opportunity";

  const sorted = [...(data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div>
    <div className="flex items-center justify-end mb-4">
      <a href="/api/admin/volunteer-applications/export" download data-testid="link-export-applications">
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </a>
    </div>
    <Card className="border-card-border">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Opportunity</TableHead>
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
                  No applications yet.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((row) => (
                <TableRow key={row.id} data-testid={`row-application-${row.id}`}>
                  <TableCell className="font-medium">
                    {row.name}
                    {row.message && <p className="text-xs text-muted-foreground max-w-xs truncate">{row.message}</p>}
                  </TableCell>
                  <TableCell>{opportunityTitle(row.opportunityId)}</TableCell>
                  <TableCell>
                    <p className="text-sm">{row.email}</p>
                    {row.phone && <p className="text-xs text-muted-foreground">{row.phone}</p>}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={row.status}
                      onValueChange={(status) => updateMutation.mutate({ id: row.id, data: { status } })}
                    >
                      <SelectTrigger className="w-32" data-testid={`select-application-status-${row.id}`}>
                        <SelectValue>
                          <Badge variant={applicationStatusVariant(row.status)}>{row.status}</Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {APPLICATION_STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
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
        </div>
      </CardContent>
    </Card>
    </div>
  );
}

export default function AdminVolunteersPage() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-3xl mb-2">Volunteers</h1>
        <p className="text-muted-foreground">Manage volunteer opportunities and review applications.</p>
      </div>

      <Tabs defaultValue="opportunities">
        <TabsList className="mb-4">
          <TabsTrigger value="opportunities" data-testid="tab-opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="applications" data-testid="tab-applications">Applications</TabsTrigger>
        </TabsList>
        <TabsContent value="opportunities">
          <OpportunitiesTab />
        </TabsContent>
        <TabsContent value="applications">
          <ApplicationsTab />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
