import { useState } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
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
import { IslamicPattern, IslamicStar, ArchIconBadge } from "@/components/site/islamic-pattern";

const applicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  message: z.string().optional(),
});
type ApplicationForm = z.infer<typeof applicationSchema>;

function ApplyDialog({ opportunity, open, onOpenChange }: { opportunity: VolunteerOpportunity | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const form = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });
  const mutation = useCreateVolunteerApplicationPublic({
    mutation: {
      onSuccess: () => { toast({ title: "Application submitted", description: "Thank you, we'll be in touch soon." }); form.reset(); onOpenChange(false); },
      onError: (error: unknown) => toast({ title: "Something went wrong", description: error instanceof Error ? error.message : "Please try again later.", variant: "destructive" }),
    },
  });
  function onSubmit(values: ApplicationForm) {
    if (!opportunity) return;
    mutation.mutate({ data: { opportunityId: opportunity.id, name: values.name, email: values.email, phone: values.phone || undefined, message: values.message || undefined } });
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Apply: {opportunity?.title}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input data-testid="input-volunteer-name" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" data-testid="input-volunteer-email" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone (optional)</FormLabel><FormControl><Input data-testid="input-volunteer-phone" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="message" render={({ field }) => (<FormItem><FormLabel>Message (optional)</FormLabel><FormControl><Textarea rows={3} data-testid="input-volunteer-message" {...field} /></FormControl><FormMessage /></FormItem>)} />
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

        {/* Hero */}
        <section className="relative bg-primary text-primary-foreground overflow-hidden">
          <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
          <IslamicStar className="absolute -top-10 -right-10 w-56 h-56 text-white/5" />
          <IslamicStar className="absolute -bottom-10 -left-10 w-48 h-48 text-white/5" />
          <div className="relative mx-auto max-w-4xl px-6 py-16 md:py-20 text-center">
            <h1 className="font-serif text-4xl md:text-5xl">Volunteer With Us</h1>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg leading-relaxed">
              Give your time and skills to support the masjid and serve the community for the sake of Allah.
            </p>
          </div>
        </section>

        {/* Opportunities */}
        <section className="mx-auto max-w-4xl px-6 py-14 md:py-16">
          <div className="flex items-center gap-3 mb-8">
            <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
            <h2 className="font-serif text-3xl">Open Opportunities</h2>
          </div>
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (data ?? []).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center">
              <p className="text-muted-foreground">No volunteer opportunities are open at this time. Please check back soon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(data ?? []).map((opportunity) => (
                <div
                  key={opportunity.id}
                  data-testid={`card-volunteer-${opportunity.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-card-border bg-card hover:border-primary/30 transition-colors p-6 flex flex-col sm:flex-row sm:items-center gap-5 justify-between"
                >
                  <IslamicPattern className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 text-primary/[0.05] group-hover:text-primary/[0.08] transition-colors duration-300" />
                  <div className="flex items-start gap-4">
                    {opportunity.imageUrl ? (
                      <img src={opportunity.imageUrl} alt={opportunity.title} className="h-12 w-12 rounded-xl object-cover shrink-0" data-testid={`img-volunteer-${opportunity.id}`} />
                    ) : (
                      <ArchIconBadge icon={HandHeart} size="sm" className="shrink-0" />
                    )}
                    <div>
                      <p className="font-serif text-lg mb-1 leading-snug">{opportunity.title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{opportunity.description}</p>
                    </div>
                  </div>
                  <Button
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shrink-0"
                    onClick={() => { setSelected(opportunity); setDialogOpen(true); }}
                    data-testid={`button-apply-volunteer-${opportunity.id}`}
                  >
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="relative bg-primary text-primary-foreground overflow-hidden">
          <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
          <IslamicStar className="absolute -top-6 -right-6 w-36 h-36 text-white/5" />
          <div className="relative mx-auto max-w-3xl px-6 py-12 text-center">
            <h2 className="font-serif text-2xl md:text-3xl mb-3">More Ways to Help</h2>
            <p className="text-primary-foreground/70 mb-6 max-w-lg mx-auto">
              Even if no specific role is listed, we always welcome help. Get in touch and let us know how you'd like to contribute.
            </p>
            <a href="/contact">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">Contact Us</Button>
            </a>
          </div>
        </section>

      </main>
      <SiteFooter />
      <ApplyDialog opportunity={selected} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
