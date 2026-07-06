import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useCreateMemberPublic } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Users, CheckCircle2 } from "lucide-react";
import { useState } from "react";

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
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      membershipType: "individual",
      message: "",
    },
  });

  const mutation = useCreateMemberPublic({
    mutation: {
      onSuccess: () => {
        setSubmitted(true);
        form.reset();
      },
      onError: (error: unknown) =>
        toast({
          title: "Something went wrong",
          description: error instanceof Error ? error.message : "Please try again later.",
          variant: "destructive",
        }),
    },
  });

  function onSubmit(values: MemberForm) {
    mutation.mutate({
      data: {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone || undefined,
        address: values.address || undefined,
        membershipType: values.membershipType,
        message: values.message || undefined,
      },
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <Users className="h-10 w-10 mx-auto mb-4 text-primary-foreground/90" />
            <h1 className="font-serif text-3xl md:text-4xl">Join the Masjid Community</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Become a member of Grays Park Masjid and take part in the life of our community.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-6 py-16">
          <Card className="border-card-border">
            <CardContent className="p-6 md:p-8">
              {submitted ? (
                <div className="text-center py-8" data-testid="text-join-success">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h2 className="font-serif text-2xl mb-2">Application Received</h2>
                  <p className="text-muted-foreground">
                    JazakAllah Khair for applying to join our community. We have emailed you a confirmation and
                    will be in touch with an update soon.
                  </p>
                  <Button className="mt-6" variant="outline" onClick={() => setSubmitted(false)}>
                    Submit another application
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input data-testid="input-join-name" {...field} />
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
                              <Input type="email" data-testid="input-join-email" {...field} />
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
                              <Input data-testid="input-join-phone" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address (optional)</FormLabel>
                          <FormControl>
                            <Input data-testid="input-join-address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="membershipType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Membership Type</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger data-testid="select-join-membership-type">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MEMBERSHIP_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anything else you'd like us to know? (optional)</FormLabel>
                          <FormControl>
                            <Textarea rows={4} data-testid="input-join-message" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      disabled={mutation.isPending}
                      data-testid="button-submit-join"
                    >
                      {mutation.isPending ? "Submitting..." : "Submit Application"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
