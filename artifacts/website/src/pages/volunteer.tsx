import { useState } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useListVolunteerOpportunitiesPublic,
  useCreateVolunteerApplicationPublic,
  type VolunteerOpportunity,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { HandHeart } from "lucide-react";

const applicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  message: z.string().optional(),
});
type ApplicationForm = z.infer<typeof applicationSchema>;

function ApplyDialog({
  opportunity,
  open,
  onOpenChange,
}: {
  opportunity: VolunteerOpportunity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const form = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  const mutation = useCreateVolunteerApplicationPublic({
    mutation: {
      onSuccess: () => {
        toast({ title: "Application submitted", description: "Thank you, we'll be in touch soon." });
        form.reset();
        onOpenChange(false);
      },
      onError: (error: unknown) =>
        toast({
          title: "Something went wrong",
          description: error instanceof Error ? error.message : "Please try again later.",
          variant: "destructive",
        }),
    },
  });

  function onSubmit(values: ApplicationForm) {
    if (!opportunity) return;
    mutation.mutate({
      data: {
        opportunityId: opportunity.id,
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        message: values.message || undefined,
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply: {opportunity?.title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input data-testid="input-volunteer-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" data-testid="input-volunteer-email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input data-testid="input-volunteer-phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} data-testid="input-volunteer-message" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending} data-testid="button-submit-volunteer-application">
                {mutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function VolunteerPage() {
  const { data, isLoading } = useListVolunteerOpportunitiesPublic();
  const [selected, setSelected] = useState<VolunteerOpportunity | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="font-serif text-3xl md:text-4xl">Volunteer With Us</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Give your time and skills to support the masjid and serve the community.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : (data ?? []).length === 0 ? (
            <p className="text-center text-muted-foreground">
              No volunteer opportunities are open at this time.
            </p>
          ) : (
            <div className="space-y-5">
              {(data ?? []).map((opportunity) => (
                <Card key={opportunity.id} className="border-card-border" data-testid={`card-volunteer-${opportunity.id}`}>
                  <CardContent className="py-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <HandHeart className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-serif text-lg mb-1">{opportunity.title}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {opportunity.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shrink-0"
                      onClick={() => {
                        setSelected(opportunity);
                        setDialogOpen(true);
                      }}
                      data-testid={`button-apply-volunteer-${opportunity.id}`}
                    >
                      Apply
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />

      <ApplyDialog opportunity={selected} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
