import { useState } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  useListCoursesPublic,
  useCreateCourseRegistrationPublic,
  type Course,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Users, CalendarClock, PoundSterling } from "lucide-react";

const registrationSchema = z.object({
  studentName: z.string().min(1, "Student name is required"),
  guardianName: z.string().optional(),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  notes: z.string().optional(),
});
type RegistrationForm = z.infer<typeof registrationSchema>;

function RegisterDialog({
  course,
  open,
  onOpenChange,
}: {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { studentName: "", guardianName: "", email: "", phone: "", notes: "" },
  });

  const mutation = useCreateCourseRegistrationPublic({
    mutation: {
      onSuccess: () => {
        toast({ title: "Registration submitted", description: "We'll be in touch shortly." });
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

  function onSubmit(values: RegistrationForm) {
    if (!course) return;
    mutation.mutate({
      data: {
        courseId: course.id,
        studentName: values.studentName,
        guardianName: values.guardianName || undefined,
        email: values.email,
        phone: values.phone || undefined,
        notes: values.notes || undefined,
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Register for {course?.title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="studentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Name</FormLabel>
                  <FormControl>
                    <Input data-testid="input-registration-student-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="guardianName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent / Guardian Name (optional)</FormLabel>
                  <FormControl>
                    <Input data-testid="input-registration-guardian-name" {...field} />
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
                      <Input type="email" data-testid="input-registration-email" {...field} />
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
                      <Input data-testid="input-registration-phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Input data-testid="input-registration-notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending} data-testid="button-submit-registration">
                {mutation.isPending ? "Submitting..." : "Submit Registration"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function EducationPage() {
  const { data, isLoading } = useListCoursesPublic();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="font-serif text-3xl md:text-4xl">Education</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Islamic education classes for children and adults, from Qur'an memorisation to
              Arabic language and Islamic studies.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : (data ?? []).length === 0 ? (
            <p className="text-center text-muted-foreground">No courses published yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(data ?? []).map((course) => (
                <Card key={course.id} className="border-card-border overflow-hidden flex flex-col" data-testid={`card-course-${course.id}`}>
                  {course.imageUrl && (
                    <img src={course.imageUrl} alt={course.title} className="h-40 w-full object-cover" />
                  )}
                  <CardContent className="py-6 flex flex-col flex-1">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-serif text-lg mb-2">{course.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                      {course.description}
                    </p>
                    <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                      {course.ageGroup && (
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5" />
                          <span>{course.ageGroup}</span>
                        </div>
                      )}
                      {course.schedule && (
                        <div className="flex items-center gap-2">
                          <CalendarClock className="h-3.5 w-3.5" />
                          <span>{course.schedule}</span>
                        </div>
                      )}
                      {course.fee && (
                        <div className="flex items-center gap-2">
                          <PoundSterling className="h-3.5 w-3.5" />
                          <span>£{course.fee}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => {
                        setSelectedCourse(course);
                        setDialogOpen(true);
                      }}
                      data-testid={`button-register-course-${course.id}`}
                    >
                      Register
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />

      <RegisterDialog course={selectedCourse} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
