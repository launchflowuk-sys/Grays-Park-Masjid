import { useState, useEffect, useCallback } from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useAdminListDonationCampaigns,
  useAdminCreateDonationCampaign,
  useAdminUpdateDonationCampaign,
  useAdminDeleteDonationCampaign,
  getAdminListDonationCampaignsQueryKey,
  useAdminListDonationTransactions,
  type DonationCampaign,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { DONATION_WRITE, useCanWrite } from "@/lib/permissions";
import { ImageUpload } from "@/components/admin/image-upload";

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const campaignSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Short description is required"),
  longDescription: z.string().optional(),
  imageUrl: z.string().optional(),
  galleryImages: z.array(z.string()).optional(),
  targetAmount: z.string().optional(),
  raisedAmount: z.string().min(1, "Required"),
  presetAmounts: z.array(z.number()).optional(),
  externalDonationUrl: z.string().optional(),
  allowOneTime: z.boolean(),
  allowMonthly: z.boolean(),
  active: z.boolean(),
  featured: z.boolean(),
});
type CampaignForm = z.infer<typeof campaignSchema>;

function buildDefaultValues(editing: DonationCampaign | null): CampaignForm {
  if (editing) {
    return {
      slug: editing.slug ?? "",
      title: editing.title,
      description: editing.description,
      longDescription: editing.longDescription ?? "",
      imageUrl: editing.imageUrl ?? "",
      galleryImages: editing.galleryImages ?? [],
      targetAmount: editing.targetAmount ?? "",
      raisedAmount: editing.raisedAmount,
      presetAmounts: editing.presetAmounts ?? [10, 25, 50, 100],
      externalDonationUrl: editing.externalDonationUrl ?? "",
      allowOneTime: editing.allowOneTime ?? true,
      allowMonthly: editing.allowMonthly ?? false,
      active: editing.active,
      featured: editing.featured,
    };
  }
  return {
    slug: "",
    title: "",
    description: "",
    longDescription: "",
    imageUrl: "",
    galleryImages: [],
    targetAmount: "",
    raisedAmount: "0",
    presetAmounts: [10, 25, 50, 100],
    externalDonationUrl: "",
    allowOneTime: true,
    allowMonthly: false,
    active: true,
    featured: false,
  };
}

function PresetAmountsEditor({
  value,
  onChange,
}: {
  value: number[];
  onChange: (amounts: number[]) => void;
}) {
  const [input, setInput] = useState("");

  function addAmount() {
    const num = parseFloat(input.trim());
    if (!Number.isFinite(num) || num <= 0) return;
    if (!value.includes(num)) {
      onChange([...value, num].sort((a, b) => a - b));
    }
    setInput("");
  }

  function removeAmount(amt: number) {
    onChange(value.filter((a) => a !== amt));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((amt) => (
          <span
            key={amt}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-medium"
          >
            £{amt}
            <button
              type="button"
              onClick={() => removeAmount(amt)}
              className="ml-1 rounded-full hover:bg-primary/20 transition-colors p-0.5"
              aria-label={`Remove £${amt}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {value.length === 0 && (
          <p className="text-xs text-muted-foreground">No presets — add amounts below</p>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          type="number"
          min="1"
          step="1"
          placeholder="e.g. 50"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAmount())}
          className="max-w-[140px]"
        />
        <Button type="button" variant="outline" size="sm" onClick={addAmount}>
          Add
        </Button>
      </div>
    </div>
  );
}

function GalleryUploadSlot({
  index,
  url,
  onChange,
}: {
  index: number;
  url: string;
  onChange: (url: string) => void;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1.5">Photo {index + 1}</p>
      <ImageUpload
        value={url || undefined}
        onChange={onChange}
        aspectHint="Landscape recommended"
      />
    </div>
  );
}

function CampaignDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: DonationCampaign | null;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<CampaignForm>({
    resolver: zodResolver(campaignSchema),
    defaultValues: buildDefaultValues(editing),
  });

  useEffect(() => {
    if (open) {
      form.reset(buildDefaultValues(editing));
    }
  }, [open, editing]);

  const titleValue = form.watch("title");
  const isCreating = !editing;

  useEffect(() => {
    if (isCreating && open) {
      form.setValue("slug", toSlug(titleValue ?? ""), { shouldDirty: false });
    }
  }, [titleValue, isCreating, open]);

  const galleryImages = form.watch("galleryImages") ?? [];

  const setGallerySlot = useCallback(
    (index: number, url: string) => {
      const next = [...(form.getValues("galleryImages") ?? [])];
      while (next.length <= index) next.push("");
      next[index] = url;
      form.setValue("galleryImages", next, { shouldDirty: true });
    },
    [form],
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getAdminListDonationCampaignsQueryKey() });

  const createMutation = useAdminCreateDonationCampaign({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Campaign created" });
        onOpenChange(false);
      },
      onError: (error: unknown) =>
        toast({
          title: "Failed to save",
          description: error instanceof Error ? error.message : undefined,
          variant: "destructive",
        }),
    },
  });
  const updateMutation = useAdminUpdateDonationCampaign({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Campaign updated" });
        onOpenChange(false);
      },
      onError: (error: unknown) =>
        toast({
          title: "Failed to save",
          description: error instanceof Error ? error.message : undefined,
          variant: "destructive",
        }),
    },
  });

  function onSubmit(values: CampaignForm) {
    const payload = {
      ...values,
      slug: values.slug?.trim() || undefined,
      imageUrl: values.imageUrl || undefined,
      longDescription: values.longDescription?.trim() || undefined,
      targetAmount: values.targetAmount || undefined,
      externalDonationUrl: values.externalDonationUrl || undefined,
      galleryImages: (values.galleryImages ?? []).filter(Boolean),
      presetAmounts: values.presetAmounts ?? [10, 25, 50, 100],
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Campaign" : "New Campaign"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* Title + Slug */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Masjid Extension Fund" data-testid="input-campaign-title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="masjid-extension-fund" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Used in the public URL: /donate/<strong>{form.watch("slug") || "slug"}</strong>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Short description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="One or two sentences shown on the campaign card." data-testid="input-campaign-description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Long description */}
            <FormField
              control={form.control}
              name="longDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Story / Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={6}
                      placeholder="Tell the full story — the history, the need, what this project will achieve, and how donations will make a difference. Use blank lines between paragraphs."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">Shown on the campaign page. Use blank lines to separate paragraphs.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Feature image */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feature Photo</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value || undefined}
                      onChange={field.onChange}
                      aspectHint="Landscape (16:9) recommended — shown as hero and card image"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gallery */}
            <div>
              <p className="text-sm font-medium mb-3">Gallery Photos (up to 4)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <GalleryUploadSlot
                    key={i}
                    index={i}
                    url={galleryImages[i] ?? ""}
                    onChange={(url) => setGallerySlot(i, url)}
                  />
                ))}
              </div>
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount (£)</FormLabel>
                    <FormControl>
                      <Input placeholder="50000" data-testid="input-campaign-target" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="raisedAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raised Amount (£)</FormLabel>
                    <FormControl>
                      <Input placeholder="0" data-testid="input-campaign-raised" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Preset amounts */}
            <FormField
              control={form.control}
              name="presetAmounts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Donation Presets (£)</FormLabel>
                  <FormControl>
                    <PresetAmountsEditor
                      value={field.value ?? [10, 25, 50, 100]}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">These preset buttons appear in the donation widget on the campaign page.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* External URL */}
            <FormField
              control={form.control}
              name="externalDonationUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Giving URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://launchgood.com/..." data-testid="input-campaign-url" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">Link to LaunchGood, JustGiving, or similar. Required if "Allow monthly" is enabled.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Toggles row */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="allowOneTime"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border border-border p-3">
                    <div>
                      <FormLabel className="mb-0 leading-none">Allow one-time</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allowMonthly"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border border-border p-3">
                    <div>
                      <FormLabel className="mb-0 leading-none">Allow monthly</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
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
                      <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-campaign-active" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border border-border p-3">
                    <FormLabel className="mb-0">Featured</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-campaign-featured" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isPending} data-testid="button-save-campaign">
                {isPending ? "Saving..." : "Save Campaign"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function CampaignsTab() {
  const { data, isLoading } = useAdminListDonationCampaigns();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const canWrite = useCanWrite(DONATION_WRITE);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DonationCampaign | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteMutation = useAdminDeleteDonationCampaign({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListDonationCampaignsQueryKey() });
        toast({ title: "Campaign deleted" });
        setDeleteId(null);
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        {canWrite && (
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            data-testid="button-add-campaign"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
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
                  <TableHead>Slug</TableHead>
                  <TableHead>Raised / Target</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Featured</TableHead>
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
                ) : (data ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No campaigns yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  (data ?? []).map((row) => (
                    <TableRow key={row.id} data-testid={`row-campaign-${row.id}`}>
                      <TableCell className="font-medium">{row.title}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {row.slug ? (
                          <span className="font-mono">{row.slug}</span>
                        ) : (
                          <span className="italic text-destructive/70">No slug</span>
                        )}
                      </TableCell>
                      <TableCell>
                        £{row.raisedAmount} {row.targetAmount ? `/ £${row.targetAmount}` : ""}
                      </TableCell>
                      <TableCell>{row.active ? "Yes" : "No"}</TableCell>
                      <TableCell>{row.featured ? "Yes" : "No"}</TableCell>
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
                              data-testid={`button-edit-campaign-${row.id}`}
                              aria-label={`Edit ${row.title}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteId(row.id)}
                              data-testid={`button-delete-campaign-${row.id}`}
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

      <CampaignDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete campaign?</AlertDialogTitle>
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

function TransactionsTab() {
  const { data: campaigns } = useAdminListDonationCampaigns();
  const { data, isLoading } = useAdminListDonationTransactions();

  const campaignTitle = (id: string) => campaigns?.find((c) => c.id === id)?.title ?? "Unknown campaign";

  const sorted = [...(data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <Card className="border-card-border">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Square Payment ID</TableHead>
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
                    No donations yet.
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((row) => (
                  <TableRow key={row.id} data-testid={`row-transaction-${row.id}`}>
                    <TableCell>{new Date(row.createdAt).toLocaleString("en-GB")}</TableCell>
                    <TableCell>{campaignTitle(row.campaignId)}</TableCell>
                    <TableCell>
                      {row.donorName ? (
                        <>
                          <p className="text-sm">{row.donorName}</p>
                          {row.donorEmail && <p className="text-xs text-muted-foreground">{row.donorEmail}</p>}
                        </>
                      ) : (
                        <span className="text-muted-foreground">Anonymous</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">£{row.amount}</TableCell>
                    <TableCell>
                      <Badge variant={row.status === "succeeded" ? "default" : "destructive"}>{row.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.squarePaymentId}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDonationsPage() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-3xl mb-2">Donations</h1>
        <p className="text-muted-foreground">Manage fundraising campaigns and review donation transactions.</p>
      </div>

      <Tabs defaultValue="campaigns">
        <TabsList className="mb-4">
          <TabsTrigger value="campaigns" data-testid="tab-campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="transactions" data-testid="tab-transactions">Transactions</TabsTrigger>
        </TabsList>
        <TabsContent value="campaigns">
          <CampaignsTab />
        </TabsContent>
        <TabsContent value="transactions">
          <TransactionsTab />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
