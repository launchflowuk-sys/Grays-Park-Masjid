import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAdminListMembers, type Member } from "@workspace/api-client-react";
import { ImageUpload } from "@/components/admin/image-upload";
import { Plus, Pencil, Trash2, Send, Eye, Users, Mail } from "lucide-react";
import { format, parseISO } from "date-fns";
import { MASJID_WRITE, useCanWrite } from "@/lib/permissions";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type RecipientType = "all_members" | "specific";

interface EmailCampaign {
  id: string;
  subject: string;
  bannerImageUrl: string | null;
  bodyText: string;
  ctaLabel: string | null;
  ctaUrl: string | null;
  recipientType: RecipientType;
  recipientEmails: string[];
  status: "draft" | "sent";
  sentAt: string | null;
  sentCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CampaignFormValues {
  subject: string;
  bannerImageUrl: string;
  bodyText: string;
  ctaLabel: string;
  ctaUrl: string;
  recipientType: RecipientType;
  recipientEmails: string[];
}

const EMPTY_FORM: CampaignFormValues = {
  subject: "",
  bannerImageUrl: "",
  bodyText: "",
  ctaLabel: "",
  ctaUrl: "",
  recipientType: "all_members",
  recipientEmails: [],
};

function useCampaigns() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/admin/email-campaigns`, { credentials: "include" });
      if (res.ok) setCampaigns(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { campaigns, loading, refetch };
}

function CampaignEditorDialog({
  open,
  onOpenChange,
  campaign,
  members,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  campaign: EmailCampaign | null;
  members: Member[];
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<CampaignFormValues>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (campaign) {
      setForm({
        subject: campaign.subject,
        bannerImageUrl: campaign.bannerImageUrl ?? "",
        bodyText: campaign.bodyText,
        ctaLabel: campaign.ctaLabel ?? "",
        ctaUrl: campaign.ctaUrl ?? "",
        recipientType: campaign.recipientType,
        recipientEmails: campaign.recipientEmails ?? [],
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setMemberSearch("");
  }, [open, campaign]);

  function setField<K extends keyof CampaignFormValues>(key: K, val: CampaignFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function toggleRecipientEmail(email: string) {
    setForm((prev) => ({
      ...prev,
      recipientEmails: prev.recipientEmails.includes(email)
        ? prev.recipientEmails.filter((e) => e !== email)
        : [...prev.recipientEmails, email],
    }));
  }

  async function handleSave() {
    if (!form.subject.trim()) {
      toast({ title: "Subject is required", variant: "destructive" });
      return;
    }
    if (!form.bodyText.trim()) {
      toast({ title: "Body text is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        subject: form.subject,
        bannerImageUrl: form.bannerImageUrl || null,
        bodyText: form.bodyText,
        ctaLabel: form.ctaLabel || null,
        ctaUrl: form.ctaUrl || null,
        recipientType: form.recipientType,
        recipientEmails: form.recipientType === "specific" ? form.recipientEmails : [],
      };

      const url = campaign
        ? `${BASE}/api/admin/email-campaigns/${campaign.id}`
        : `${BASE}/api/admin/email-campaigns`;
      const method = campaign ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to save");
      }

      toast({ title: campaign ? "Campaign updated" : "Campaign saved as draft" });
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast({ title: String(err instanceof Error ? err.message : "Error"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handlePreview() {
    setLoadingPreview(true);
    try {
      const res = await fetch(`${BASE}/api/admin/email-campaigns/preview`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: form.subject || "Preview",
          bannerImageUrl: form.bannerImageUrl || null,
          bodyText: form.bodyText || "Your email body will appear here.",
          ctaLabel: form.ctaLabel || null,
          ctaUrl: form.ctaUrl || null,
        }),
      });
      if (!res.ok) {
        toast({ title: "Could not load preview", variant: "destructive" });
        return;
      }
      const data = await res.json();
      setPreviewHtml(data.html);
      setPreviewOpen(true);
    } catch {
      toast({ title: "Could not load preview", variant: "destructive" });
    } finally {
      setLoadingPreview(false);
    }
  }

  const filteredMembers = members.filter((m) =>
    m.email?.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.fullName.toLowerCase().includes(memberSearch.toLowerCase()),
  );

  const isSent = campaign?.status === "sent";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{campaign ? "Edit Campaign" : "New Campaign"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="ec-subject">Subject line *</Label>
              <Input
                id="ec-subject"
                placeholder="e.g. Ramadan Appeal 2025"
                value={form.subject}
                onChange={(e) => setField("subject", e.target.value)}
                disabled={isSent}
              />
            </div>

            <div className="space-y-2">
              <Label>Banner image</Label>
              <p className="text-xs text-muted-foreground">
                Recommended: 600 × 300 px, JPG or PNG, max 5 MB. Displayed between header and body.
              </p>
              <ImageUpload
                value={form.bannerImageUrl}
                onChange={(url) => setField("bannerImageUrl", url)}
                aspectHint="600 × 300 px"
                disabled={isSent}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ec-body">Body text *</Label>
              <Textarea
                id="ec-body"
                placeholder="Write your message here. Each paragraph on a new line."
                value={form.bodyText}
                onChange={(e) => setField("bodyText", e.target.value)}
                rows={8}
                disabled={isSent}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ec-cta-label">CTA button label</Label>
                <Input
                  id="ec-cta-label"
                  placeholder="e.g. Donate Now"
                  value={form.ctaLabel}
                  onChange={(e) => setField("ctaLabel", e.target.value)}
                  disabled={isSent}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ec-cta-url">CTA button URL</Label>
                <Input
                  id="ec-cta-url"
                  placeholder="https://..."
                  value={form.ctaUrl}
                  onChange={(e) => setField("ctaUrl", e.target.value)}
                  disabled={isSent}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Recipients</Label>
              <RadioGroup
                value={form.recipientType}
                onValueChange={(v) => setField("recipientType", v as RecipientType)}
                disabled={isSent}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="all_members" id="rt-all" />
                  <Label htmlFor="rt-all" className="font-normal cursor-pointer">
                    All members with an email address
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="specific" id="rt-specific" />
                  <Label htmlFor="rt-specific" className="font-normal cursor-pointer">
                    Specific members
                  </Label>
                </div>
              </RadioGroup>

              {form.recipientType === "specific" && (
                <div className="border rounded-md p-3 space-y-2">
                  <Input
                    placeholder="Search by name or email..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    disabled={isSent}
                  />
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredMembers.length === 0 && (
                      <p className="text-sm text-muted-foreground py-2 text-center">No members found</p>
                    )}
                    {filteredMembers.map((m) => {
                      const checked = form.recipientEmails.includes(m.email ?? "");
                      return (
                        <label
                          key={m.id}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-muted/50 ${
                            isSent ? "opacity-60 pointer-events-none" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => m.email && toggleRecipientEmail(m.email)}
                            className="rounded"
                          />
                          <span className="text-sm flex-1 min-w-0">
                            <span className="font-medium">{m.fullName}</span>
                            {m.email && (
                              <span className="text-muted-foreground ml-1 text-xs">{m.email}</span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {form.recipientEmails.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {form.recipientEmails.length} recipient{form.recipientEmails.length !== 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={loadingPreview}
              className="min-h-[44px] gap-2"
            >
              <Eye className="h-4 w-4" />
              {loadingPreview ? "Loading…" : "Preview email"}
            </Button>
            <div className="flex gap-2 flex-1 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="min-h-[44px]"
              >
                Cancel
              </Button>
              {!isSent && (
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="min-h-[44px]"
                >
                  {saving ? "Saving…" : campaign ? "Save changes" : "Save draft"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Email preview</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto">
            <iframe
              srcDoc={previewHtml}
              title="Email preview"
              className="w-full border-0"
              style={{ height: "600px" }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SendConfirmDialog({
  campaign,
  open,
  onOpenChange,
  onSent,
}: {
  campaign: EmailCampaign | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSent: () => void;
}) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!campaign) return;
    setSending(true);
    try {
      const res = await fetch(`${BASE}/api/admin/email-campaigns/${campaign.id}/send`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      toast({
        title: `Campaign sent to ${data.sent} recipient${data.sent !== 1 ? "s" : ""}`,
        description: data.failed > 0 ? `${data.failed} failed to deliver` : undefined,
      });
      onSent();
      onOpenChange(false);
    } catch (err) {
      toast({ title: String(err instanceof Error ? err.message : "Error"), variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Send campaign?</AlertDialogTitle>
          <AlertDialogDescription>
            This will send <strong>"{campaign?.subject}"</strong> to{" "}
            {campaign?.recipientType === "all_members"
              ? "all members with an email address"
              : `${campaign?.recipientEmails?.length ?? 0} specific member${
                  (campaign?.recipientEmails?.length ?? 0) !== 1 ? "s" : ""
                }`}
            . This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={sending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSend} disabled={sending}>
            {sending ? "Sending…" : "Send now"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function AdminEmailCampaignsPage() {
  const { toast } = useToast();
  const canWrite = useCanWrite(MASJID_WRITE);
  const { campaigns, loading, refetch } = useCampaigns();
  const { data: membersData } = useAdminListMembers();
  const members = (membersData as Member[] | undefined) ?? [];

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmailCampaign | null>(null);
  const [sendTarget, setSendTarget] = useState<EmailCampaign | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openNew() {
    setEditingCampaign(null);
    setEditorOpen(true);
  }

  function openEdit(c: EmailCampaign) {
    setEditingCampaign(c);
    setEditorOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${BASE}/api/admin/email-campaigns/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast({ title: "Campaign deleted" });
      refetch();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Email Campaigns</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Send branded emails to members for events, appeals, and announcements.
            </p>
          </div>
          {canWrite && (
            <Button onClick={openNew} className="shrink-0 min-h-[44px] gap-2">
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading campaigns…</div>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No campaigns yet</p>
              {canWrite && (
                <Button onClick={openNew} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create your first campaign
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c) => (
              <Card key={c.id} className="overflow-hidden">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{c.subject}</p>
                      <Badge variant={c.status === "sent" ? "default" : "outline"}>
                        {c.status === "sent" ? "Sent" : "Draft"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {c.recipientType === "all_members"
                          ? "All members"
                          : `${c.recipientEmails?.length ?? 0} specific`}
                      </span>
                      {c.status === "sent" && c.sentAt && (
                        <span>
                          Sent {format(parseISO(c.sentAt), "d MMM yyyy HH:mm")} · {c.sentCount} delivered
                        </span>
                      )}
                      {c.status === "draft" && (
                        <span>Created {format(parseISO(c.createdAt), "d MMM yyyy")}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-[44px] gap-1.5"
                      onClick={() => openEdit(c)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {c.status === "sent" ? "View" : "Edit"}
                    </Button>
                    {canWrite && c.status === "draft" && (
                      <Button
                        variant="default"
                        size="sm"
                        className="min-h-[44px] gap-1.5"
                        onClick={() => setSendTarget(c)}
                      >
                        <Send className="h-3.5 w-3.5" />
                        Send
                      </Button>
                    )}
                    {canWrite && c.status === "draft" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[44px] text-destructive hover:text-destructive gap-1.5"
                        onClick={() => setDeleteTarget(c)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CampaignEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        campaign={editingCampaign}
        members={members}
        onSaved={refetch}
      />

      <SendConfirmDialog
        campaign={sendTarget}
        open={!!sendTarget}
        onOpenChange={(v) => !v && setSendTarget(null)}
        onSent={refetch}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>"{deleteTarget?.subject}"</strong>. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
