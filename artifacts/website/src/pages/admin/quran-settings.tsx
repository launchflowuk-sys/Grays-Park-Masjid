import { useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  FormDescription,
} from "@/components/ui/form";
import {
  useGetQuranSettingsPublic,
  useAdminUpdateQuranSettings,
  useListQuranReciters,
  useListQuranTranslations,
  getGetQuranSettingsPublicQueryKey,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Save, BookOpen } from "lucide-react";
import { CONTENT_WRITE, useCanWrite } from "@/lib/permissions";

const settingsSchema = z.object({
  isQuranPageEnabled: z.boolean(),
  showInNavigation: z.boolean(),
  showOnHomepage: z.boolean(),
  defaultTranslation: z.string().min(1),
  defaultReciter: z.string().min(1),
  attributionText: z.string().min(1),
  homepageTitle: z.string().min(1),
  homepageIntro: z.string().min(1),
  homepageButtonText: z.string().min(1),
  homepageButtonLink: z.string().min(1),
});
type SettingsForm = z.infer<typeof settingsSchema>;

export default function AdminQuranSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canWrite = useCanWrite(CONTENT_WRITE);
  const { data: settings, isLoading } = useGetQuranSettingsPublic();
  const { data: reciters } = useListQuranReciters();
  const { data: translations } = useListQuranTranslations();

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      isQuranPageEnabled: true,
      showInNavigation: true,
      showOnHomepage: true,
      defaultTranslation: "en.sahih",
      defaultReciter: "ar.alafasy",
      attributionText: "",
      homepageTitle: "",
      homepageIntro: "",
      homepageButtonText: "",
      homepageButtonLink: "/quran",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        isQuranPageEnabled: settings.isQuranPageEnabled,
        showInNavigation: settings.showInNavigation,
        showOnHomepage: settings.showOnHomepage,
        defaultTranslation: settings.defaultTranslation,
        defaultReciter: settings.defaultReciter,
        attributionText: settings.attributionText,
        homepageTitle: settings.homepageTitle,
        homepageIntro: settings.homepageIntro,
        homepageButtonText: settings.homepageButtonText,
        homepageButtonLink: settings.homepageButtonLink,
      });
    }
  }, [settings, form]);

  const updateMutation = useAdminUpdateQuranSettings({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetQuranSettingsPublicQueryKey() });
        toast({ title: "Qur'an settings saved" });
      },
      onError: (error: unknown) =>
        toast({
          title: "Failed to save",
          description: error instanceof Error ? error.message : undefined,
          variant: "destructive",
        }),
    },
  });

  function onSubmit(values: SettingsForm) {
    updateMutation.mutate({ data: values });
  }

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-serif text-3xl">Qur&apos;an Reader Settings</h1>
          <p className="text-muted-foreground">Configure the public Qur&apos;an reader experience.</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="border-card-border">
              <CardHeader>
                <CardTitle>Visibility</CardTitle>
                <CardDescription>Control where the Qur&apos;an reader appears on the site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <FormField
                  control={form.control}
                  name="isQuranPageEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-md border border-border p-3">
                      <div>
                        <FormLabel className="mb-0">Qur&apos;an Reader Enabled</FormLabel>
                        <FormDescription>Turn the entire feature on or off for visitors.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!canWrite}
                          data-testid="switch-quran-enabled"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="showInNavigation"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-md border border-border p-3">
                      <FormLabel className="mb-0">Show in Main Navigation</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!canWrite}
                          data-testid="switch-quran-show-nav"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="showOnHomepage"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-md border border-border p-3">
                      <FormLabel className="mb-0">Show Ayah of the Day on Homepage</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!canWrite}
                          data-testid="switch-quran-show-homepage"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-card-border">
              <CardHeader>
                <CardTitle>Defaults</CardTitle>
                <CardDescription>Default translation and reciter for new visitors.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="defaultTranslation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Translation</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={!canWrite}>
                        <FormControl>
                          <SelectTrigger data-testid="select-default-translation">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {translations?.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
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
                  name="defaultReciter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Reciter</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={!canWrite}>
                        <FormControl>
                          <SelectTrigger data-testid="select-default-reciter">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {reciters?.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-card-border">
              <CardHeader>
                <CardTitle>Homepage Block</CardTitle>
                <CardDescription>Text shown in the &ldquo;Ayah of the Day&rdquo; section on the homepage.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="homepageTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!canWrite} data-testid="input-homepage-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="homepageButtonText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button Text</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!canWrite} data-testid="input-homepage-button-text" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="homepageIntro"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Intro Text</FormLabel>
                      <FormControl>
                        <Textarea rows={2} {...field} disabled={!canWrite} data-testid="input-homepage-intro" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="homepageButtonLink"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Button Link</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!canWrite} data-testid="input-homepage-button-link" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-card-border">
              <CardHeader>
                <CardTitle>Attribution</CardTitle>
                <CardDescription>Shown in the footer of the reader, crediting the data provider.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="attributionText"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea rows={2} {...field} disabled={!canWrite} data-testid="input-attribution-text" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {canWrite && (
              <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-quran-settings">
                <Save className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            )}
          </form>
        </Form>
      )}
    </AdminLayout>
  );
}
