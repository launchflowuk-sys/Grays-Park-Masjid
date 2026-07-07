import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SupportRequestModal } from "@/components/admin/support-request-modal";
import { Link } from "wouter";
import {
  useAdminListPrayerTimes,
  useAdminListDonationCampaigns,
  useAdminListDonationTransactions,
  useAdminListServices,
  useAdminListEnquiries,
  useAdminListCourses,
  useAdminListCourseRegistrations,
  useAdminListVolunteerApplications,
  useAdminListAnnouncements,
  useAdminListNews,
  useAdminListEvents,
} from "@workspace/api-client-react";
import {
  Clock,
  HandHeart,
  Wrench,
  Inbox,
  GraduationCap,
  ClipboardList,
  HeartHandshake,
  Megaphone,
  CalendarDays,
  MapPin,
  Sunrise,
  TrendingUp,
  Users,
  LifeBuoy,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { AdminRole } from "@workspace/api-client-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const MASJID_ROLES: AdminRole[] = ["super_admin", "masjid_admin", "read_only"];
const DONATION_ROLES: AdminRole[] = ["super_admin", "donation_admin", "read_only"];
const EDUCATION_ROLES: AdminRole[] = ["super_admin", "education_admin", "read_only"];
const CONTENT_ROLES: AdminRole[] = ["super_admin", "masjid_admin", "content_editor", "read_only"];

const PRAYER_SEQUENCE = [
  { key: "fajr", label: "Fajr", adhanKey: "fajrAdhan" as const, iqamahKey: "fajrIqamah" as const },
  { key: "dhuhr", label: "Dhuhr", adhanKey: "dhuhrAdhan" as const, iqamahKey: "dhuhrIqamah" as const },
  { key: "asr", label: "Asr", adhanKey: "asrAdhan" as const, iqamahKey: "asrIqamah" as const },
  { key: "maghrib", label: "Maghrib", adhanKey: "maghribAdhan" as const, iqamahKey: "maghribIqamah" as const },
  { key: "isha", label: "Isha", adhanKey: "ishaAdhan" as const, iqamahKey: "ishaIqamah" as const },
];

function timeStringToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToLabel(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${String(m).padStart(2, "0")} ${period}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(
    value,
  );
}

const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function AdminDashboardPage() {
  const { admin } = useAuth();
  const role = admin?.role;
  const [supportOpen, setSupportOpen] = useState(false);

  const { data: prayerTimes } = useAdminListPrayerTimes();
  const { data: campaigns } = useAdminListDonationCampaigns();
  const { data: transactions } = useAdminListDonationTransactions();
  const { data: services } = useAdminListServices();
  const { data: enquiries } = useAdminListEnquiries();
  const { data: courses } = useAdminListCourses();
  const { data: registrations } = useAdminListCourseRegistrations();
  const { data: volunteerApplications } = useAdminListVolunteerApplications();
  const { data: announcements } = useAdminListAnnouncements();
  const { data: news } = useAdminListNews();
  const { data: events } = useAdminListEvents();

  const canSeeMasjid = !role || MASJID_ROLES.includes(role);
  const canSeeDonations = !role || DONATION_ROLES.includes(role);
  const canSeeEducation = !role || EDUCATION_ROLES.includes(role);

  const todayIso = new Date().toISOString().slice(0, 10);

  const nextPrayer = useMemo(() => {
    const todayEntry = (prayerTimes ?? []).find((p) => p.date === todayIso);
    if (!todayEntry) return null;

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    for (const prayer of PRAYER_SEQUENCE) {
      const adhanTime = todayEntry[prayer.adhanKey];
      const adhanMinutes = timeStringToMinutes(adhanTime);
      if (adhanMinutes >= nowMinutes) {
        return {
          label: prayer.label,
          adhan: adhanTime,
          iqamah: todayEntry[prayer.iqamahKey],
          minutesUntil: adhanMinutes - nowMinutes,
        };
      }
    }

    return {
      label: "Fajr (tomorrow)",
      adhan: todayEntry.fajrAdhan,
      iqamah: todayEntry.fajrIqamah,
      minutesUntil: 24 * 60 - nowMinutes + timeStringToMinutes(todayEntry.fajrAdhan),
    };
  }, [prayerTimes, todayIso]);

  const nextEvent = useMemo(() => {
    const now = Date.now();
    const upcoming = (events ?? [])
      .filter((e) => e.published && new Date(e.startsAt).getTime() >= now)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
    return upcoming[0] ?? null;
  }, [events]);

  const totalRaised = (campaigns ?? []).reduce((sum, c) => sum + Number(c.raisedAmount || 0), 0);
  const totalTarget = (campaigns ?? []).reduce((sum, c) => sum + Number(c.targetAmount || 0), 0);
  const activeCampaigns = (campaigns ?? []).filter((c) => c.active).length;

  const donationTrend = useMemo(() => {
    const succeeded = (transactions ?? []).filter((t) => t.status === "succeeded");
    const byMonth = new Map<string, number>();
    for (const t of succeeded) {
      const d = new Date(t.createdAt);
      const key = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
      byMonth.set(key, (byMonth.get(key) ?? 0) + Number(t.amount));
    }
    return Array.from(byMonth.entries())
      .slice(-6)
      .map(([month, amount]) => ({ month, amount }));
  }, [transactions]);

  const totalDonationAmount = (transactions ?? [])
    .filter((t) => t.status === "succeeded")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const newEnquiries = (enquiries ?? []).filter((e) => e.status === "new").length;
  const pendingRegistrations = (registrations ?? []).filter((r) => r.status === "pending").length;
  const pendingApplications = (volunteerApplications ?? []).filter((a) => a.status === "pending").length;
  const publishedContentCount =
    (announcements ?? []).filter((a) => a.published).length +
    (news ?? []).filter((n) => n.published).length +
    (events ?? []).filter((e) => e.published).length;

  const submissionsBreakdown = useMemo(() => {
    const data = [
      { name: "Enquiries", value: (enquiries ?? []).length },
      { name: "Course Registrations", value: (registrations ?? []).length },
      { name: "Volunteer Applications", value: (volunteerApplications ?? []).length },
    ].filter((d) => d.value > 0);
    return data;
  }, [enquiries, registrations, volunteerApplications]);

  const allCards = [
    {
      label: "Total Raised",
      value: formatCurrency(totalRaised),
      icon: HandHeart,
      href: "/admin/donations",
      roles: DONATION_ROLES,
      accent: "from-emerald-500/15 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Active Campaigns",
      value: String(activeCampaigns),
      icon: TrendingUp,
      href: "/admin/donations",
      roles: DONATION_ROLES,
      accent: "from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400",
    },
    {
      label: "New Enquiries",
      value: String(newEnquiries),
      icon: Inbox,
      href: "/admin/enquiries",
      roles: MASJID_ROLES,
      accent: "from-sky-500/15 to-sky-500/5 text-sky-600 dark:text-sky-400",
    },
    {
      label: "Active Courses",
      value: String((courses ?? []).length),
      icon: GraduationCap,
      href: "/admin/courses",
      roles: EDUCATION_ROLES,
      accent: "from-violet-500/15 to-violet-500/5 text-violet-600 dark:text-violet-400",
    },
    {
      label: "Pending Registrations",
      value: String(pendingRegistrations),
      icon: ClipboardList,
      href: "/admin/courses",
      roles: EDUCATION_ROLES,
      accent: "from-fuchsia-500/15 to-fuchsia-500/5 text-fuchsia-600 dark:text-fuchsia-400",
    },
    {
      label: "Pending Volunteer Applications",
      value: String(pendingApplications),
      icon: HeartHandshake,
      href: "/admin/volunteers",
      roles: MASJID_ROLES,
      accent: "from-rose-500/15 to-rose-500/5 text-rose-600 dark:text-rose-400",
    },
    {
      label: "Published Content",
      value: String(publishedContentCount),
      icon: Megaphone,
      href: "/admin/announcements",
      roles: CONTENT_ROLES,
      accent: "from-indigo-500/15 to-indigo-500/5 text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Published Services",
      value: String((services ?? []).filter((s) => s.published).length),
      icon: Wrench,
      href: "/admin/services",
      roles: CONTENT_ROLES,
      accent: "from-teal-500/15 to-teal-500/5 text-teal-600 dark:text-teal-400",
    },
  ];

  const cards = role ? allCards.filter((card) => card.roles.includes(role)) : allCards;

  return (
    <AdminLayout>
      <SupportRequestModal open={supportOpen} onOpenChange={setSupportOpen} />

      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl mb-2">
            Assalamu Alaikum{admin?.name ? `, ${admin.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            {" — "}Here's the full snapshot of Grays Park Masjid.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setSupportOpen(true)}
          className="gap-2 shrink-0"
          data-testid="button-open-support-modal"
        >
          <LifeBuoy className="h-4 w-4" />
          Request Support
        </Button>
      </div>

      {canSeeMasjid && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-card-border overflow-hidden relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <Sunrise className="h-4 w-4" /> Next Prayer
                  </p>
                  {nextPrayer ? (
                    <>
                      <p className="font-serif text-4xl text-primary mb-1">{nextPrayer.label}</p>
                      <p className="text-muted-foreground">
                        Adhan {nextPrayer.adhan} &middot; Iqamah {nextPrayer.iqamah}
                      </p>
                      <p className="text-sm text-primary/80 mt-2">
                        {nextPrayer.minutesUntil <= 0
                          ? "Starting now"
                          : `In ${Math.floor(nextPrayer.minutesUntil / 60) > 0 ? `${Math.floor(nextPrayer.minutesUntil / 60)}h ` : ""}${nextPrayer.minutesUntil % 60}m`}
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground mt-2">No prayer times set for today.</p>
                  )}
                </div>
                <Clock className="h-10 w-10 text-primary/40" />
              </div>
              <Link href="/admin/prayer-times">
                <span className="text-sm text-primary hover:underline mt-4 inline-block">Manage prayer times &rarr;</span>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-card-border overflow-hidden relative bg-gradient-to-br from-secondary/20 via-secondary/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" /> Next Event
                  </p>
                  {nextEvent ? (
                    <>
                      <p className="font-serif text-2xl mb-1">{nextEvent.title}</p>
                      <p className="text-muted-foreground">
                        {new Date(nextEvent.startsAt).toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        at{" "}
                        {new Date(nextEvent.startsAt).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {nextEvent.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3.5 w-3.5" /> {nextEvent.location}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground mt-2">No upcoming events scheduled.</p>
                  )}
                </div>
                <CalendarDays className="h-10 w-10 text-primary/30" />
              </div>
              <Link href="/admin/events">
                <span className="text-sm text-primary hover:underline mt-4 inline-block">Manage events &rarr;</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {cards.length === 0 ? (
        <p className="text-muted-foreground">No widgets are available for your role.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.label} href={card.href}>
                <Card
                  className={`border-card-border hover:border-primary/40 transition-colors cursor-pointer bg-gradient-to-br ${card.accent}`}
                  data-testid={`card-stat-${card.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                    <Icon className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-serif">{card.value}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {canSeeDonations && (
          <Card className="border-card-border lg:col-span-2" data-testid="card-donation-trend">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Donation Trend
              </CardTitle>
              <CardDescription>
                {formatCurrency(totalDonationAmount)} raised across all successful transactions
                {totalTarget > 0 && ` — ${formatCurrency(totalTarget)} combined campaign target`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {donationTrend.length === 0 ? (
                <p className="text-muted-foreground text-sm py-12 text-center">No donation history yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={donationTrend}>
                    <defs>
                      <linearGradient id="donationGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} tickFormatter={(v) => `£${v}`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      fill="url(#donationGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}

        {(canSeeMasjid || canSeeEducation) && (
          <Card className="border-card-border" data-testid="card-submissions-breakdown">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Submissions Overview
              </CardTitle>
              <CardDescription>All-time enquiries, registrations & applications</CardDescription>
            </CardHeader>
            <CardContent>
              {submissionsBreakdown.length === 0 ? (
                <p className="text-muted-foreground text-sm py-12 text-center">No submissions yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={submissionsBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {submissionsBreakdown.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
