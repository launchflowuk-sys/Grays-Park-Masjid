import { useState } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  useListCoursesPublic,
  useCreateCourseRegistrationPublic,
  type Course,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Users, CalendarClock, PoundSterling } from "lucide-react";
import { IslamicPattern, IslamicStar, ArchIconBadge } from "@/components/site/islamic-pattern";

const registrationSchema = z.object({
  studentName: z.string().min(1, "Student name is required"),
  guardianName: z.string().optional(),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  notes: z.string().optional(),
});
type RegistrationForm = z.infer<typeof registrationSchema>;

function RegisterDialog({ course, open, onOpenChange }: { course: Course | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { studentName: "", guardianName: "", email: "", phone: "", notes: "" },
  });
  const mutation = useCreateCourseRegistrationPublic({
    mutation: {
      onSuccess: () => { toast({ title: "Registration submitted", description: "We'll be in touch shortly." }); form.reset(); onOpenChange(false); },
      onError: (error: unknown) => toast({ title: "Something went wrong", description: error instanceof Error ? error.message : "Please try again later.", variant: "destructive" }),
    },
  });
  function onSubmit(values: RegistrationForm) {
    if (!course) return;
    mutation.mutate({ data: { courseId: course.id, studentName: values.studentName, guardianName: values.guardianName || undefined, email: values.email, phone: values.phone || undefined, notes: values.notes || undefined } });
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Register for {course?.title}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="studentName" render={({ field }) => (<FormItem><FormLabel>Student Name</FormLabel><FormControl><Input data-testid="input-registration-student-name" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="guardianName" render={({ field }) => (<FormItem><FormLabel>Parent / Guardian Name (optional)</FormLabel><FormControl><Input data-testid="input-registration-guardian-name" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" data-testid="input-registration-email" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone (optional)</FormLabel><FormControl><Input data-testid="input-registration-phone" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes (optional)</FormLabel><FormControl><Input data-testid="input-registration-notes" {...field} /></FormControl><FormMessage /></FormItem>)} />
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

        {/* Hero */}
        <section className="relative bg-primary text-primary-foreground overflow-hidden">
          <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
          <IslamicStar className="absolute -top-10 -right-10 w-56 h-56 text-white/5" />
          <IslamicStar className="absolute -bottom-10 -left-10 w-48 h-48 text-white/5" />
          <div className="relative mx-auto max-w-4xl px-6 py-16 md:py-20 text-center">
            <p className="font-serif text-secondary text-2xl md:text-3xl mb-4 tracking-wider">اقْرَأْ</p>
            <h1 className="font-serif text-4xl md:text-5xl">Education</h1>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg leading-relaxed">
              Islamic education for children and adults — from Qur'an memorisation to Arabic language and Islamic studies.
            </p>
          </div>
        </section>

        {/* Courses */}
        <section className="mx-auto max-w-6xl px-6 py-14 md:py-16">
          <div className="flex items-center gap-3 mb-8">
            <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
            <h2 className="font-serif text-3xl">Available Classes</h2>
          </div>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-16">Loading courses…</p>
          ) : (data ?? []).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center">
              <GraduationCap className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No courses published yet — please check back soon.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(data ?? []).map((course) => (
                <div
                  key={course.id}
                  data-testid={`card-course-${course.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-card-border bg-card hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col"
                >
                  <IslamicPattern className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 text-primary/[0.05] group-hover:text-primary/[0.09] transition-colors duration-300" />
                  {course.imageUrl && (
                    <div className="h-40 overflow-hidden">
                      <img src={course.imageUrl} alt={course.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1 relative">
                    {!course.imageUrl && <ArchIconBadge icon={GraduationCap} size="sm" className="mb-4" />}
                    {!course.imageUrl && <div className="w-8 h-[2px] bg-secondary mb-4" />}
                    <p className="font-serif text-lg mb-2 leading-snug">{course.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{course.description}</p>
                    <div className="space-y-1.5 text-xs text-muted-foreground mb-5">
                      {course.ageGroup && (
                        <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-primary/60" /><span>{course.ageGroup}</span></div>
                      )}
                      {course.schedule && (
                        <div className="flex items-center gap-2"><CalendarClock className="h-3.5 w-3.5 text-primary/60" /><span>{course.schedule}</span></div>
                      )}
                      {course.fee && (
                        <div className="flex items-center gap-2"><PoundSterling className="h-3.5 w-3.5 text-primary/60" /><span>£{course.fee}</span></div>
                      )}
                    </div>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => { setSelectedCourse(course); setDialogOpen(true); }}
                      data-testid={`button-register-course-${course.id}`}
                    >
                      Register
                    </Button>
                  </div>
                </div>
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
