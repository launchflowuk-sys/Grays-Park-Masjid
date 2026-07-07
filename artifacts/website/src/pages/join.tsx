import { useState } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateMemberPublic } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Users } from "lucide-react";
import { IslamicPattern, IslamicStar } from "@/components/site/islamic-pattern";

const MEMBERSHIP_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "family", label: "Family" },
  { value: "student", label: "Student" },
  { value: "senior", label: "Senior" },
];

const memberSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  address: z.string().optional(),
  membershipType: z.string().min(1, "Please select a membership type"),
  message: z.string().optional(),
});
type MemberForm = z.infer<typeof memberSchema>;

export default function JoinPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<MemberForm>({
    resolver: zodResolver(memberSchema),
    defaultValues: { fullName: "", email: "", phone: "", address: "", membershipType: "individual", message: "" },
  });

  const mutation = useCreateMemberPublic({
    mutation: {
      onSuccess: () => { setSubmitted(true); form.reset(); },
      onError: (error: unknown) => toast({ title: "Something went wrong", description: error instanceof Error ? error.message : "Please try again later.", variant: "destructive" }),
    },
  });

  function onSubmit(values: MemberForm) {
    mutation.mutate({ data: { fullName: values.fullName, email: values.email, phone: values.phone || undefined, address: values.address || undefined, membershipType: values.membershipType, message: values.message || undefined } });
  }

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
            <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-5">
              <Users className="h-6 w-6 text-secondary" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl">Join the Community</h1>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg leading-relaxed">
              Become a member of Grays Park Masjid and take part in the life of our community.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="mx-auto max-w-2xl px-6 py-14 md:py-16">
          <div className="rounded-2xl border border-card-border bg-card p-6 md:p-8 relative overflow-hidden">
            <IslamicPattern className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 text-primary/[0.05]" />
            <IslamicPattern className="pointer-events-none absolute -left-8 -bottom-8 h-32 w-32 text-primary/[0.05]" />

            {submitted ? (
              <div className="text-center py-10" data-testid="text-join-success">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-serif text-2xl mb-2">Application Received</h2>
                <div className="w-8 h-[2px] bg-secondary mx-auto my-4" />
                <p className="text-muted-foreground leading-relaxed">
                  JazakAllah Khair for applying to join our community. We have emailed you a
                  confirmation and will be in touch with an update soon.
                </p>
                <Button className="mt-6 bg-primary hover:bg-primary/90" variant="default" onClick={() => setSubmitted(false)}>
                  Submit another application
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
                  <p className="font-serif text-xl">Membership Application</p>
                </div>
                <div className="w-8 h-[2px] bg-secondary mb-6" />
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input data-testid="input-join-name" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" data-testid="input-join-email" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>Phone (optional)</FormLabel><FormControl><Input data-testid="input-join-phone" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem><FormLabel>Address (optional)</FormLabel><FormControl><Input data-testid="input-join-address" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="membershipType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Membership Type</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl><SelectTrigger data-testid="select-join-membership-type"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            {MEMBERSHIP_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="message" render={({ field }) => (
                      <FormItem><FormLabel>Anything else you'd like us to know? (optional)</FormLabel><FormControl><Textarea rows={4} data-testid="input-join-message" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold" disabled={mutation.isPending} data-testid="button-submit-join">
                      {mutation.isPending ? "Submitting..." : "Submit Application"}
                    </Button>
                  </form>
                </Form>
              </>
            )}
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
