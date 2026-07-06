import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
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
import { Mail, MapPin } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(1, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Please enter a subject"),
  message: z.string().min(10, "Please enter at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

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
        toast({
          title: "Something went wrong",
          description: error instanceof Error ? error.message : "Please try again later.",
          variant: "destructive",
        });
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
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="font-serif text-3xl md:text-4xl">Contact Us</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Have a question or need to reach us? Send a message and we'll respond as soon
              as possible.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16 grid md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-card-border">
              <CardContent className="py-6 flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">Grays, Essex, United Kingdom</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-card-border">
              <CardContent className="py-6 flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div>
                  <p className="font-medium">Enquiries</p>
                  <p className="text-sm text-muted-foreground">
                    Use the form and our team will get back to you.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-card-border md:col-span-3">
            <CardContent className="py-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" data-testid="input-contact-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" data-testid="input-contact-email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number" data-testid="input-contact-phone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="What is this about?" data-testid="input-contact-subject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea rows={5} placeholder="Your message" data-testid="input-contact-message" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={mutation.isPending}
                    data-testid="button-contact-submit"
                  >
                    {mutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
