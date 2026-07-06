import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import {
  useAdminListPrayerTimes,
  useAdminListDonationCampaigns,
  useAdminListServices,
  useAdminListEnquiries,
  useAdminListCourses,
  useAdminListCourseRegistrations,
  useAdminListVolunteerApplications,
  useAdminListAnnouncements,
  useAdminListNews,
  useAdminListEvents,
} from "@workspace/api-client-react";
import { Clock, HandHeart, Wrench, Inbox, GraduationCap, ClipboardList, HeartHandshake, Megaphone } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { AdminRole } from "@workspace/api-client-react";

const MASJID_ROLES: AdminRole[] = ["super_admin", "masjid_admin", "read_only"];
const DONATION_ROLES: AdminRole[] = ["super_admin", "donation_admin", "read_only"];
const EDUCATION_ROLES: AdminRole[] = ["super_admin", "education_admin", "read_only"];
const CONTENT_ROLES: AdminRole[] = ["super_admin", "masjid_admin", "content_editor", "read_only"];

export default function AdminDashboardPage() {
  const { admin } = useAuth();
  const role = admin?.role;

  const { data: prayerTimes } = useAdminListPrayerTimes();
  const { data: campaigns } = useAdminListDonationCampaigns();
  const { data: services } = useAdminListServices();
  const { data: enquiries } = useAdminListEnquiries();
  const { data: courses } = useAdminListCourses();
  const { data: registrations } = useAdminListCourseRegistrations();
  const { data: volunteerApplications } = useAdminListVolunteerApplications();
  const { data: announcements } = useAdminListAnnouncements();
  const { data: news } = useAdminListNews();
  const { data: events } = useAdminListEvents();

  const newEnquiries = (enquiries ?? []).filter((e) => e.status === "new").length;
  const pendingRegistrations = (registrations ?? []).filter((r) => r.status === "pending").length;
  const pendingApplications = (volunteerApplications ?? []).filter((a) => a.status === "pending").length;
  const publishedContentCount =
    (announcements ?? []).filter((a) => a.published).length +
    (news ?? []).filter((n) => n.published).length +
    (events ?? []).filter((e) => e.published).length;

  const allCards = [
    {
      label: "Prayer Time Entries",
      value: prayerTimes?.length ?? 0,
      icon: Clock,
      href: "/admin/prayer-times",
      roles: MASJID_ROLES,
    },
    {
      label: "Donation Campaigns",
      value: campaigns?.length ?? 0,
      icon: HandHeart,
      href: "/admin/donations",
      roles: DONATION_ROLES,
    },
    {
      label: "Published Services",
      value: services?.filter((s) => s.published).length ?? 0,
      icon: Wrench,
      href: "/admin/services",
      roles: CONTENT_ROLES,
    },
    {
      label: "New Enquiries",
      value: newEnquiries,
      icon: Inbox,
      href: "/admin/enquiries",
      roles: MASJID_ROLES,
    },
    {
      label: "Active Courses",
      value: courses?.length ?? 0,
      icon: GraduationCap,
      href: "/admin/courses",
      roles: EDUCATION_ROLES,
    },
    {
      label: "Pending Registrations",
      value: pendingRegistrations,
      icon: ClipboardList,
      href: "/admin/courses",
      roles: EDUCATION_ROLES,
    },
    {
      label: "Pending Volunteer Applications",
      value: pendingApplications,
      icon: HeartHandshake,
      href: "/admin/volunteers",
      roles: MASJID_ROLES,
    },
    {
      label: "Published Content",
      value: publishedContentCount,
      icon: Megaphone,
      href: "/admin/announcements",
      roles: CONTENT_ROLES,
    },
  ];

  const cards = role ? allCards.filter((card) => card.roles.includes(role)) : allCards;

  return (
    <AdminLayout>
      <h1 className="font-serif text-3xl mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Overview of your masjid's content.</p>
      {cards.length === 0 ? (
        <p className="text-muted-foreground">No widgets are available for your role.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.label} href={card.href}>
                <Card
                  className="border-card-border hover:border-primary/40 transition-colors cursor-pointer"
                  data-testid={`card-stat-${card.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
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
      )}
    </AdminLayout>
  );
}
