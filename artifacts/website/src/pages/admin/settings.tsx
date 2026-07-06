import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminListSettings,
  useAdminUpsertSetting,
  getAdminListSettingsQueryKey,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const KNOWN_SETTINGS: { key: string; label: string; description: string; multiline?: boolean }[] = [
  { key: "site_phone", label: "Phone Number", description: "Displayed on the contact page." },
  { key: "site_email", label: "Contact Email", description: "Displayed on the contact page." },
  { key: "site_address", label: "Address", description: "Full postal address of the masjid." },
  {
    key: "site_announcement",
    label: "Site-wide Announcement",
    description: "Optional banner message shown to visitors. Leave blank to hide.",
    multiline: true,
  },
  {
    key: "donation_bank_details",
    label: "Bank Transfer Details",
    description: "Shown to donors who prefer bank transfer.",
    multiline: true,
  },
  {
    key: "madrassah_content",
    label: "Madrassah Page Content",
    description: "Shown on the public Madrassah page.",
    multiline: true,
  },
  {
    key: "sisters_facilities_content",
    label: "Sisters' Facilities Page Content",
    description: "Shown on the public Sisters' Facilities page.",
    multiline: true,
  },
  {
    key: "youth_programmes_content",
    label: "Youth Programmes Page Content",
    description: "Shown on the public Youth Programmes page.",
    multiline: true,
  },
  {
    key: "jumuah_content",
    label: "Jumu'ah Page Content",
    description: "Shown on the public Jumu'ah page.",
    multiline: true,
  },
  {
    key: "funeral_content",
    label: "Funeral / Janazah Page Content",
    description: "Shown on the public Funeral & Janazah page.",
    multiline: true,
  },
  {
    key: "nikah_content",
    label: "Nikah Page Content",
    description: "Shown on the public Nikah page.",
    multiline: true,
  },
  {
    key: "ramadan_content",
    label: "Ramadan Page Content",
    description: "Shown on the public Ramadan page.",
    multiline: true,
  },
  {
    key: "eid_content",
    label: "Eid Page Content",
    description: "Shown on the public Eid page.",
    multiline: true,
  },
  {
    key: "zakat_content",
    label: "Zakat / Sadaqah / Lillah Page Content",
    description: "Shown on the public Zakat page.",
    multiline: true,
  },
  {
    key: "safeguarding_content",
    label: "Safeguarding Page Content",
    description: "Shown on the public Safeguarding page.",
    multiline: true,
  },
  {
    key: "policies_content",
    label: "Policies Page Content",
    description: "Shown on the public Policies page.",
    multiline: true,
  },
  {
    key: "faqs_content",
    label: "FAQs (JSON)",
    description:
      'Advanced: JSON array of {"question","answer"} objects shown on the public FAQs page. Leave blank to use the default FAQs.',
    multiline: true,
  },
];

function SettingField({
  settingKey,
  label,
  description,
  multiline,
}: {
  settingKey: string;
  label: string;
  description: string;
  multiline?: boolean;
}) {
  const { data } = useAdminListSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const current = data?.find((s) => s.key === settingKey);
  const [value, setValue] = useState(current?.value ?? "");
  const [initialized, setInitialized] = useState(false);

  if (!initialized && current) {
    setValue(current.value);
    setInitialized(true);
  }

  const mutation = useAdminUpsertSetting({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListSettingsQueryKey() });
        toast({ title: `${label} saved` });
      },
      onError: (error: unknown) =>
        toast({ title: "Failed to save", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
    },
  });

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-3 items-start">
        {multiline ? (
          <Textarea
            rows={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-testid={`input-setting-${settingKey}`}
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-testid={`input-setting-${settingKey}`}
          />
        )}
        <Button
          size="icon"
          onClick={() => mutation.mutate({ key: settingKey, data: { value } })}
          disabled={mutation.isPending}
          data-testid={`button-save-setting-${settingKey}`}
        >
          <Save className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <h1 className="font-serif text-3xl mb-2">Site Settings</h1>
      <p className="text-muted-foreground mb-6">Manage key content values shown across the public site.</p>
      <div className="space-y-4 max-w-2xl">
        {KNOWN_SETTINGS.map((setting) => (
          <SettingField
            key={setting.key}
            settingKey={setting.key}
            label={setting.label}
            description={setting.description}
            multiline={setting.multiline}
          />
        ))}
      </div>
    </AdminLayout>
  );
}
