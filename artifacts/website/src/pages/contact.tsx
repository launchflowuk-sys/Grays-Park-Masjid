import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useCreateEnquiryPublic } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { IslamicPattern, IslamicStar } from "@/components/site/islamic-pattern";

const contactSchema = z.object({
  name: z.string().min(1, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Please enter a subject"),
  message: z.string().min(10, "Please enter at least 10 characters"),
});
type ContactForm = z.infer<typeof contactSchema>;

const CONTACT_INFO = [
  { icon: MapPin, label: "Address", value: "Grays, Essex, United Kingdom" },
  { icon: Mail, label: "Enquiries", value: "Use the form and our team will respond promptly." },
  { icon: Phone, label: "Urgent (Janazah)", value: "Call us directly for funeral assistance." },
];

export default function ContactPage() {
  const { toast } = useToast();
  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  const mutation = useCreateEnquiryPublic({
    mutation: {
      onSuccess: () => {
        toast({ title: "Message sent", description: "Thank you for reaching out. We'll be in touch soon." });
        form.reset();
      },
      onError: (error: unknown) => {
        toast({ title: "Something went wrong", description: error instanceof Error ? error.message : "Please try again later.", variant: "destructive" });
      },
    },
  });

  function onSubmit(values: ContactForm) {
    mutation.mutate({ data: { ...values, phone: values.phone || undefined } });
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
            <h1 className="font-serif text-4xl md:text-5xl">Contact Us</h1>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg leading-relaxed">
              Have a question or need to reach us? Send a message and we'll respond as soon as possible.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto max-w-5xl px-6 py-14 md:py-16">
          <div className="grid md:grid-cols-5 gap-10">

            {/* Info column */}
            <div className="md:col-span-2 space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
                <h2 className="font-serif text-2xl">Get in Touch</h2>
              </div>
              {CONTACT_INFO.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4 p-4 rounded-xl border border-card-border bg-card relative overflow-hidden">
                  <IslamicPattern className="pointer-events-none absolute -right-3 -top-3 h-16 w-16 text-primary/[0.05]" />
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Form column */}
            <div className="md:col-span-3 bg-card rounded-2xl border border-card-border p-6 md:p-8 relative overflow-hidden">
              <IslamicPattern className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 text-primary/[0.05]" />
              <p className="font-serif text-xl mb-6">Send a Message</p>
              <div className="w-8 h-[2px] bg-secondary mb-6" />
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl><Input placeholder="Your name" data-testid="input-contact-name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="you@example.com" data-testid="input-contact-email" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (optional)</FormLabel>
                      <FormControl><Input placeholder="Your phone number" data-testid="input-contact-phone" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="subject" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl><Input placeholder="What is this about?" data-testid="input-contact-subject" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl><Textarea rows={5} placeholder="Your message" data-testid="input-contact-message" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={mutation.isPending} data-testid="button-contact-submit">
                    {mutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </section>

        {/* Google Maps */}
        <section className="mx-auto max-w-5xl px-6 pb-14">
          <div className="rounded-2xl overflow-hidden border border-card-border shadow-sm">
            <div className="bg-card px-6 py-4 flex items-center justify-between border-b border-card-border">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Find Us</p>
                  <p className="text-xs text-muted-foreground">Grays Park Masjid, Grays, Essex</p>
                </div>
              </div>
              <a
                href="https://maps.google.com/?q=Grays+Park+Masjid+Grays+Essex"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
              >
                Open in Google Maps
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <iframe
              src="/api/google/maps-embed?q=Grays+Park+Masjid%2C+Grays%2C+Essex%2C+UK"
              width="100%"
              height="420"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Grays Park Masjid location"
            />
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
