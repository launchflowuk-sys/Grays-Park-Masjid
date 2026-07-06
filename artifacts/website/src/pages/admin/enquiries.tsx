import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminListEnquiries,
  useAdminUpdateEnquiry,
  useAdminDeleteEnquiry,
  getAdminListEnquiriesQueryKey,
  type Enquiry,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Eye, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";

const STATUS_OPTIONS = ["new", "in_progress", "resolved"] as const;

function statusVariant(status: string): "default" | "secondary" | "outline" {
  if (status === "new") return "default";
  if (status === "in_progress") return "secondary";
  return "outline";
}

function EnquiryDialog({
  enquiry,
  onOpenChange,
}: {
  enquiry: Enquiry | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useAdminUpdateEnquiry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListEnquiriesQueryKey() });
        toast({ title: "Status updated" });
      },
    },
  });

  return (
    <Dialog open={!!enquiry} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {enquiry && (
          <>
            <DialogHeader>
              <DialogTitle>{enquiry.subject}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">From</p>
                <p className="font-medium">
                  {enquiry.name} &lt;{enquiry.email}&gt;
                </p>
                {enquiry.phone && <p className="text-muted-foreground">{enquiry.phone}</p>}
              </div>
              <div>
                <p className="text-muted-foreground">Received</p>
                <p>{format(parseISO(enquiry.createdAt), "d MMM yyyy, HH:mm")}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Message</p>
                <p className="whitespace-pre-wrap border border-border rounded-md p-3 bg-muted/30">
                  {enquiry.message}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Status</p>
                <Select
                  value={enquiry.status}
                  onValueChange={(status) => updateMutation.mutate({ id: enquiry.id, data: { status } })}
                >
                  <SelectTrigger data-testid="select-enquiry-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <a href={`mailto:${enquiry.email}`}>
                <Button variant="outline">Reply via Email</Button>
              </a>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminEnquiriesPage() {
  const { data, isLoading } = useAdminListEnquiries();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [viewing, setViewing] = useState<Enquiry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteMutation = useAdminDeleteEnquiry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListEnquiriesQueryKey() });
        toast({ title: "Enquiry deleted" });
        setDeleteId(null);
      },
    },
  });

  const sorted = [...(data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <AdminLayout>
      <h1 className="font-serif text-3xl mb-2">Enquiries</h1>
      <p className="text-muted-foreground mb-6">Messages submitted through the contact form.</p>

      <Card className="border-card-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
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
                    No enquiries yet.
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((row) => (
                  <TableRow key={row.id} data-testid={`row-enquiry-${row.id}`}>
                    <TableCell>{format(parseISO(row.createdAt), "d MMM yyyy")}</TableCell>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{row.subject}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(row.status)}>{row.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setViewing(row)}
                        data-testid={`button-view-enquiry-${row.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteId(row.id)}
                        data-testid={`button-delete-enquiry-${row.id}`}
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

      <EnquiryDialog enquiry={viewing} onOpenChange={(open) => !open && setViewing(null)} />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete enquiry?</AlertDialogTitle>
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
