import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import {
  useAdminListPrayerTimes,
  useAdminListDonationCampaigns,
  useAdminListServices,
  useAdminListEnquiries,
} from "@workspace/api-client-react";
import { Clock, HandHeart, Wrench, Inbox } from "lucide-react";

export default function AdminDashboardPage() {
  const { data: prayerTimes } = useAdminListPrayerTimes();
  const { data: campaigns } = useAdminListDonationCampaigns();
  const { data: services } = useAdminListServices();
  const { data: enquiries } = useAdminListEnquiries();

  const newEnquiries = (enquiries ?? []).filter((e) => e.status === "new").length;

  const cards = [
    { label: "Prayer Time Entries", value: prayerTimes?.length ?? 0, icon: Clock, href: "/admin/prayer-times" },
    { label: "Donation Campaigns", value: campaigns?.length ?? 0, icon: HandHeart, href: "/admin/donations" },
    { label: "Published Services", value: services?.filter((s) => s.published).length ?? 0, icon: Wrench, href: "/admin/services" },
    { label: "New Enquiries", value: newEnquiries, icon: Inbox, href: "/admin/enquiries" },
  ];

  return (
    <AdminLayout>
      <h1 className="font-serif text-3xl mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Overview of your masjid's content.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card className="border-card-border hover:border-primary/40 transition-colors cursor-pointer" data-testid={`card-stat-${card.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                  <Icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-serif text-primary">{card.value}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </AdminLayout>
  );
}
