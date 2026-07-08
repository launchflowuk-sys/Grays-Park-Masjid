import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminListMembers,
  useAdminUpdateMember,
  useAdminDeleteMember,
  getAdminListMembersQueryKey,
  type Member,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Eye, Trash2, Download, CheckCircle2, XCircle, HelpCircle, MailX, MailCheck } from "lucide-react";
import { format, parseISO } from "date-fns";
import { MASJID_WRITE, useCanWrite } from "@/lib/permissions";

function statusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  if (status === "approved") return "default";
  if (status === "denied") return "destructive";
  if (status === "info_requested") return "secondary";
  return "outline";
}

function MemberDialog({
  member,
  onOpenChange,
}: {
  member: Member | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canWrite = useCanWrite(MASJID_WRITE);
  const [adminNotes, setAdminNotes] = useState("");
  const [optOutPending, setOptOutPending] = useState(false);

  useEffect(() => {
    if (!member) setAdminNotes("");
  }, [member]);

  const updateMutation = useAdminUpdateMember({
    mutation: {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: getAdminListMembersQueryKey() });
        if (variables.data.status === "approved") {
          toast({ title: "Member approved", description: "An approval email has been sent." });
        } else if (variables.data.status === "denied") {
          toast({ title: "Application denied", description: "The applicant has been notified by email." });
        } else if (variables.data.status === "info_requested") {
          toast({ title: "Information requested", description: "The applicant has been notified by email." });
        } else {
          toast({ title: "Updated" });
        }
        onOpenChange(false);
      },
    },
  });

  function handleDecision(status: "approved" | "denied" | "info_requested") {
    if (!member) return;
    updateMutation.mutate({
      id: member.id,
      data: { status, adminNotes: adminNotes.trim() ? adminNotes.trim() : undefined },
    });
  }

  async function handleResubscribe() {
    if (!member) return;
    setOptOutPending(true);
    try {
      const baseUrl = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${baseUrl}/api/admin/members/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOptOut: false }),
        credentials: "include",
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: getAdminListMembersQueryKey() });
        toast({ title: "Re-subscribed", description: `${member.fullName} will now receive campaign emails.` });
        onOpenChange(false);
      } else {
        toast({ title: "Error", description: "Could not update preference.", variant: "destructive" });
      }
    } finally {
      setOptOutPending(false);
    }
  }

  const emailOptOut = (member as (Member & { emailOptOut?: boolean }))?.emailOptOut;

  return (
    <Dialog
      open={!!member}
      onOpenChange={(open) => {
        if (!open) setAdminNotes("");
        onOpenChange(open);
      }}
    >
      <DialogContent className="max-w-lg">
        {member && (
          <>
            <DialogHeader>
              <DialogTitle>{member.fullName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <p className="text-muted-foreground">Contact</p>
                <p className="font-medium">
                  {member.fullName} &lt;{member.email}&gt;
                </p>
                {member.phone && <p className="text-muted-foreground">{member.phone}</p>}
                {member.address && <p className="text-muted-foreground">{member.address}</p>}
              </div>
              <div>
                <p className="text-muted-foreground">Membership Type</p>
                <p className="capitalize">{member.membershipType}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Submitted</p>
                <p>{format(parseISO(member.createdAt), "d MMM yyyy, HH:mm")}</p>
              </div>
              {member.message && (
                <div>
                  <p className="text-muted-foreground mb-1">Message</p>
                  <p className="whitespace-pre-wrap border border-border rounded-md p-3 bg-muted/30">
                    {member.message}
                  </p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground mb-1">Current Status</p>
                <Badge variant={statusVariant(member.status)}>{member.status.replace("_", " ")}</Badge>
              </div>

              {/* Email opt-out status */}
              <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  {emailOptOut ? (
                    <MailX className="h-4 w-4 text-destructive shrink-0" />
                  ) : (
                    <MailCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  )}
                  <div>
                    <p className="font-medium leading-none mb-0.5">
                      {emailOptOut ? "Unsubscribed from campaigns" : "Subscribed to campaigns"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {emailOptOut
                        ? "This member will not receive campaign emails."
                        : "This member receives campaign emails."}
                    </p>
                  </div>
                </div>
                {canWrite && emailOptOut && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResubscribe}
                    disabled={optOutPending}
                    className="shrink-0 text-xs"
                  >
                    Re-subscribe
                  </Button>
                )}
              </div>

              {member.adminNotes && (
                <div>
                  <p className="text-muted-foreground mb-1">Previous Admin Notes</p>
                  <p className="whitespace-pre-wrap border border-border rounded-md p-3 bg-muted/30">
                    {member.adminNotes}
                  </p>
                </div>
              )}
              {canWrite && (
                <div>
                  <Label htmlFor="admin-notes">Notes (included in email if denying or requesting info)</Label>
                  <Textarea
                    id="admin-notes"
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    data-testid="input-member-admin-notes"
                    className="mt-1"
                  />
                </div>
              )}
            </div>
            {canWrite && (
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="border-amber-500 text-amber-600 hover:bg-amber-50"
                  onClick={() => handleDecision("info_requested")}
                  disabled={updateMutation.isPending}
                  data-testid="button-member-request-info"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Request Info
                </Button>
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => handleDecision("denied")}
                  disabled={updateMutation.isPending}
                  data-testid="button-member-deny"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Deny
                </Button>
                <Button
                  onClick={() => handleDecision("approved")}
                  disabled={updateMutation.isPending}
                  data-testid="button-member-approve"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminMembersPage() {
  const { data, isLoading } = useAdminListMembers();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const canWrite = useCanWrite(MASJID_WRITE);
  const [viewing, setViewing] = useState<Member | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteMutation = useAdminDeleteMember({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListMembersQueryKey() });
        toast({ title: "Application deleted" });
        setDeleteId(null);
      },
    },
  });

  const sorted = [...(data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <AdminLayout>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl mb-2">Membership Applications</h1>
          <p className="text-muted-foreground">Review and manage applications to join the masjid community.</p>
        </div>
        <a href="/api/admin/members/export" download data-testid="link-export-members">
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
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No membership applications yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  sorted.map((row) => {
                    const optOut = (row as Member & { emailOptOut?: boolean }).emailOptOut;
                    return (
                      <TableRow key={row.id} data-testid={`row-member-${row.id}`}>
                        <TableCell>{format(parseISO(row.createdAt), "d MMM yyyy")}</TableCell>
                        <TableCell className="font-medium">{row.fullName}</TableCell>
                        <TableCell className="capitalize">{row.membershipType}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(row.status)}>{row.status.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell>
                          {optOut ? (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <MailX className="h-3 w-3 text-destructive" />
                              Unsubscribed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                              <MailCheck className="h-3 w-3" />
                              Subscribed
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setViewing(row)}
                            data-testid={`button-view-member-${row.id}`}
                            aria-label={`View application from ${row.fullName}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canWrite && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteId(row.id)}
                              data-testid={`button-delete-member-${row.id}`}
                              aria-label={`Delete application from ${row.fullName}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <MemberDialog member={viewing} onOpenChange={(open) => !open && setViewing(null)} />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete application?</AlertDialogTitle>
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
