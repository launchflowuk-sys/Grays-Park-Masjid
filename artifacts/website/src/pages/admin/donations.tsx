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
  useAdminListDonationCampaigns,
  useAdminCreateDonationCampaign,
  useAdminUpdateDonationCampaign,
  useAdminDeleteDonationCampaign,
  getAdminListDonationCampaignsQueryKey,
  useAdminListDonationTransactions,
  type DonationCampaign,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DONATION_WRITE, useCanWrite } from "@/lib/permissions";

const campaignSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().optional(),
  targetAmount: z.string().optional(),
  raisedAmount: z.string().min(1, "Required"),
  externalDonationUrl: z.string().optional(),
  active: z.boolean(),
  featured: z.boolean(),
});
type CampaignForm = z.infer<typeof campaignSchema>;

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
    defaultValues: editing
      ? {
          title: editing.title,
          description: editing.description,
          imageUrl: editing.imageUrl ?? "",
          targetAmount: editing.targetAmount ?? "",
          raisedAmount: editing.raisedAmount,
          externalDonationUrl: editing.externalDonationUrl ?? "",
          active: editing.active,
          featured: editing.featured,
        }
      : {
          title: "",
          description: "",
          imageUrl: "",
          targetAmount: "",
          raisedAmount: "0",
          externalDonationUrl: "",
          active: true,
          featured: false,
        },
  });

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
        toast({ title: "Failed to save", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
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
        toast({ title: "Failed to save", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
    },
  });

  function onSubmit(values: CampaignForm) {
    const payload = {
      ...values,
      imageUrl: values.imageUrl || undefined,
      targetAmount: values.targetAmount || undefined,
      externalDonationUrl: values.externalDonationUrl || undefined,
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
          <DialogTitle>{editing ? "Edit Campaign" : "New Campaign"}</DialogTitle>
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
                    <Input placeholder="Masjid Extension Fund" data-testid="input-campaign-title" {...field} />
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
                    <Textarea rows={4} data-testid="input-campaign-description" {...field} />
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
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="/uploads/campaign.jpg" data-testid="input-campaign-image" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="externalDonationUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External Donation URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." data-testid="input-campaign-url" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                {isPending ? "Saving..." : "Save"}
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
                <TableHead>Raised / Target</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Featured</TableHead>
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
              ) : (data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No campaigns yet.
                  </TableCell>
                </TableRow>
              ) : (
                (data ?? []).map((row) => (
                  <TableRow key={row.id} data-testid={`row-campaign-${row.id}`}>
                    <TableCell className="font-medium">{row.title}</TableCell>
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
