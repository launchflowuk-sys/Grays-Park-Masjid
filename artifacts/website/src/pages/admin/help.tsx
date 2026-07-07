import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupportRequestModal } from "@/components/admin/support-request-modal";
import { Button } from "@/components/ui/button";
import {
  Clock,
  HandHeart,
  Wrench,
  Inbox,
  Settings,
  Users,
  Megaphone,
  CalendarDays,
  GraduationCap,
  Images,
  Newspaper,
  Bell,
  BookOpen,
  Sparkles,
  NotebookText,
  HeartHandshake,
  LifeBuoy,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";

const MODULES = [
  {
    id: "prayer-times",
    icon: Clock,
    title: "Prayer Times",
    href: "/admin/prayer-times",
    colour: "text-emerald-600",
    bg: "bg-emerald-50",
    summary: "Manage daily Adhan & Iqamah times displayed across the public website.",
    setup: [
      "Navigate to Prayer Times in the sidebar.",
      "Each row represents one calendar date. Click Add Row to insert a new date.",
      "Enter the Adhan time (call to prayer) and Iqamah time (when congregation begins) for each of the five prayers: Fajr, Dhuhr, Asr, Maghrib, Isha.",
      "The Sunrise field is also available for display on the public Timetable page.",
      "Rows are sorted by date automatically. You can bulk-upload by adding multiple rows.",
      "Times saved here appear live on the public Prayer Times page and the scrolling header bar.",
    ],
    tips: [
      "Upload the entire month at the start of each month to keep times accurate.",
      "Iqamah times can be left empty if they follow Adhan immediately.",
    ],
  },
  {
    id: "donations",
    icon: HandHeart,
    title: "Donations",
    href: "/admin/donations",
    colour: "text-amber-600",
    bg: "bg-amber-50",
    summary: "Create and manage fundraising campaigns. View donation transactions and track progress.",
    setup: [
      "Go to Donations in the sidebar.",
      "Click New Campaign to create a fundraising drive. Give it a title, description, target amount, and toggle it Active.",
      "Share the public Donate page link with your congregation — donors select a campaign and pay via Square.",
      "All completed payments appear in the Transactions tab with donor name, amount, and date.",
      "Mark campaigns Inactive once the target is reached or the campaign closes.",
    ],
    tips: [
      "Set a clear target amount so the progress bar on the public page is meaningful.",
      "Use the description field to explain exactly what the funds will be used for.",
    ],
  },
  {
    id: "services",
    icon: Wrench,
    title: "Services",
    href: "/admin/services",
    colour: "text-sky-600",
    bg: "bg-sky-50",
    summary: "Manage the list of masjid services shown on the public Services page.",
    setup: [
      "Go to Services in the sidebar.",
      "Click New Service to add an entry (e.g., Nikah, Janazah, Madrassah).",
      "Give each service a title, description, and optionally an icon name from the Lucide icon set.",
      "Toggle Published to make the service visible on the public page.",
      "Drag rows to reorder them — the Sort Order is saved automatically.",
    ],
    tips: [
      "Keep titles short (1–4 words) for best display on mobile.",
      "Unpublished services are hidden from visitors but saved for later.",
    ],
  },
  {
    id: "announcements",
    icon: Megaphone,
    title: "Announcements",
    href: "/admin/announcements",
    colour: "text-violet-600",
    bg: "bg-violet-50",
    summary: "Post short notices and important updates for the congregation.",
    setup: [
      "Go to Announcements in the sidebar.",
      "Click New Announcement and fill in the title and body text.",
      "Toggle Published to make it visible on the public Announcements page.",
      "Announcements appear in reverse-chronological order (newest first).",
      "Unpublish or delete old announcements to keep the page tidy.",
    ],
    tips: [
      "Use announcements for short notices (e.g., 'Masjid closed for maintenance Friday').",
      "For longer articles, use the News module instead.",
    ],
  },
  {
    id: "news",
    icon: Newspaper,
    title: "News",
    href: "/admin/news",
    colour: "text-indigo-600",
    bg: "bg-indigo-50",
    summary: "Write and publish longer-form news articles and community stories.",
    setup: [
      "Go to News in the sidebar.",
      "Click New Article, give it a title, content body, and optionally upload a cover image.",
      "Toggle Published to make the article visible on the public News page.",
      "Articles support rich text — use the formatting toolbar for headings, bold, lists, and links.",
    ],
    tips: [
      "Always add a cover image — articles with images get significantly more engagement.",
      "Use a clear, specific headline so visitors know what the article is about at a glance.",
    ],
  },
  {
    id: "events",
    icon: CalendarDays,
    title: "Events",
    href: "/admin/events",
    colour: "text-pink-600",
    bg: "bg-pink-50",
    summary: "Create and manage community events displayed in the public Events calendar.",
    setup: [
      "Go to Events in the sidebar.",
      "Click New Event. Fill in the title, start date/time, optional end date/time, and location.",
      "Add a description explaining what the event is, who can attend, and any requirements.",
      "Toggle Published to list the event publicly.",
      "Events are displayed chronologically on the public Events page.",
    ],
    tips: [
      "Add a location so attendees can navigate directly from the event page.",
      "Past events remain in the system for records but appear below upcoming ones.",
    ],
  },
  {
    id: "courses",
    icon: GraduationCap,
    title: "Courses",
    href: "/admin/courses",
    colour: "text-teal-600",
    bg: "bg-teal-50",
    summary: "Manage Islamic education courses. Accept, review, and track student registrations.",
    setup: [
      "Go to Courses in the sidebar.",
      "Click New Course. Enter the course name, description, schedule, and any prerequisites.",
      "Toggle Published to open the course for registration on the public Education page.",
      "Visitors register through the public form. Registrations appear in the Registrations tab.",
      "Change a registration's status to Approved, Waitlisted, or Rejected from the detail view.",
    ],
    tips: [
      "Set a clear schedule (e.g., 'Every Saturday 10am–12pm') in the description.",
      "Use the Waitlist status to manage oversubscribed courses.",
    ],
  },
  {
    id: "gallery",
    icon: Images,
    title: "Gallery",
    href: "/admin/gallery",
    colour: "text-orange-600",
    bg: "bg-orange-50",
    summary: "Upload and manage photos displayed in the public Gallery section.",
    setup: [
      "Go to Gallery in the sidebar.",
      "Click Upload Images to select one or more photos from your device.",
      "Each image can be given a caption and an album/category label.",
      "Toggle Published to make images visible in the public gallery.",
      "Reorder images by dragging them within the grid.",
    ],
    tips: [
      "Compress large images before uploading (aim for under 2 MB per image) for fast load times.",
      "Group related photos under the same album label for easier browsing.",
    ],
  },
  {
    id: "volunteers",
    icon: HeartHandshake,
    title: "Volunteers",
    href: "/admin/volunteers",
    colour: "text-rose-600",
    bg: "bg-rose-50",
    summary: "Review and manage volunteer applications submitted through the public website.",
    setup: [
      "Go to Volunteers in the sidebar.",
      "Applications arrive automatically when visitors submit the public Volunteer form.",
      "Open an application to read the applicant's details, availability, and areas of interest.",
      "Update the status to Approved, Under Review, or Rejected as you process each application.",
      "Use the notes field to record internal comments about the applicant.",
    ],
    tips: [
      "Respond to applicants promptly — a timely reply improves trust and commitment.",
      "Use the Approved status to build your active volunteer list.",
    ],
  },
  {
    id: "members",
    icon: Users,
    title: "Members",
    href: "/admin/members",
    colour: "text-cyan-600",
    bg: "bg-cyan-50",
    summary: "View and manage masjid membership registrations.",
    setup: [
      "Go to Members in the sidebar.",
      "Members are added when visitors complete the public Membership form.",
      "Open a record to view contact details, membership type, and join date.",
      "Update the membership status as needed (Active, Lapsed, etc.).",
      "Export the member list for records or communication.",
    ],
    tips: [
      "Keep member records up to date to maintain accurate congregation numbers.",
      "Use membership data to plan capacity for major events like Eid prayers.",
    ],
  },
  {
    id: "staff",
    icon: Users,
    title: "Staff & Committee",
    href: "/admin/staff",
    colour: "text-slate-600",
    bg: "bg-slate-50",
    summary: "Manage the staff and committee members displayed on the public About page.",
    setup: [
      "Go to Staff & Committee in the sidebar.",
      "Click New Member to add a person. Fill in their name, title/role, and optionally a photo.",
      "Toggle Published to display them on the public page.",
      "Reorder members by adjusting the Sort Order field — lower numbers appear first.",
    ],
    tips: [
      "Use consistent photo dimensions (square, at least 400×400px) for a professional look.",
      "Keep job titles short and descriptive (e.g., 'Imam', 'Treasurer', 'Education Coordinator').",
    ],
  },
  {
    id: "enquiries",
    icon: Inbox,
    title: "Enquiries",
    href: "/admin/enquiries",
    colour: "text-fuchsia-600",
    bg: "bg-fuchsia-50",
    summary: "View and respond to contact form submissions from the public website.",
    setup: [
      "Go to Enquiries in the sidebar.",
      "Enquiries arrive automatically from the public Contact Us form.",
      "Click an enquiry to read the full message, sender name, and email.",
      "Change the status to In Progress or Resolved once you have actioned it.",
      "Use your email client to reply directly to the sender's address shown in the record.",
    ],
    tips: [
      "Filter by 'New' status each morning to catch fresh enquiries quickly.",
      "Mark enquiries Resolved after responding so nothing falls through the cracks.",
    ],
  },
  {
    id: "quran-settings",
    icon: BookOpen,
    title: "Qur'an Settings",
    href: "/admin/quran-settings",
    colour: "text-emerald-700",
    bg: "bg-emerald-50",
    summary: "Configure which translation and reciter are used for Qur'an features across the site.",
    setup: [
      "Go to Qur'an Settings in the sidebar.",
      "Select your preferred translation language and edition from the dropdown.",
      "Choose a reciter for audio playback on the Qur'an pages.",
      "Save changes — they apply immediately across all Qur'an features on the public site.",
    ],
    tips: [
      "The default translation (Saheeh International) is suitable for most congregations.",
      "Test audio playback after changing reciters to ensure it works correctly.",
    ],
  },
  {
    id: "quran-featured-ayah",
    icon: Sparkles,
    title: "Featured Ayah",
    href: "/admin/quran-featured-ayah",
    colour: "text-yellow-600",
    bg: "bg-yellow-50",
    summary: "Select a Qur'anic verse to feature prominently on the website homepage.",
    setup: [
      "Go to Featured Ayah in the sidebar.",
      "Choose a Surah and Ayah number using the search or browse interface.",
      "The Arabic text, transliteration, and translation are fetched automatically.",
      "Save — the verse appears in the featured section on the homepage immediately.",
    ],
    tips: [
      "Change the featured ayah weekly or monthly to keep the homepage fresh.",
      "Choose verses that are universally meaningful and appropriate for all visitors.",
    ],
  },
  {
    id: "quran-reflections",
    icon: NotebookText,
    title: "Qur'an Reflections",
    href: "/admin/quran-reflections",
    colour: "text-lime-700",
    bg: "bg-lime-50",
    summary: "Publish short scholarly reflections on Qur'anic verses for the community.",
    setup: [
      "Go to Qur'an Reflections in the sidebar.",
      "Click New Reflection. Link it to a specific Surah and Ayah.",
      "Write the reflection text — this appears alongside the Arabic verse on the public page.",
      "Attribute the reflection to an author (e.g., the Imam's name).",
      "Toggle Published to make it visible.",
    ],
    tips: [
      "Keep reflections concise (200–400 words) for best engagement on mobile.",
      "Regular weekly reflections build a valuable archive for the community.",
    ],
  },
  {
    id: "settings",
    icon: Settings,
    title: "Site Settings",
    href: "/admin/settings",
    colour: "text-gray-600",
    bg: "bg-gray-50",
    summary: "Configure global site information: masjid name, address, contact details, social media links.",
    setup: [
      "Go to Site Settings in the sidebar.",
      "Update the Masjid Name, Address, Phone, and Email — these appear in the footer and contact pages.",
      "Add your Facebook, Instagram, YouTube, and WhatsApp URLs for social media links in the footer.",
      "Upload a site logo if desired.",
      "All changes take effect immediately on the public website.",
    ],
    tips: [
      "Keep contact details up to date — they are the primary way visitors reach the masjid.",
      "Social media links in the footer improve community engagement and reach.",
    ],
  },
  {
    id: "notifications",
    icon: Bell,
    title: "Notifications",
    href: "/admin/notifications",
    colour: "text-blue-600",
    bg: "bg-blue-50",
    summary: "Manage notification recipients for system alerts (new enquiries, registrations, etc.).",
    setup: [
      "Go to Notifications in the sidebar (super admin only).",
      "Add email addresses that should receive system notifications.",
      "Each recipient can be configured for specific event types (e.g., only enquiries, or all events).",
      "Remove a recipient to stop notifications being sent to that address.",
    ],
    tips: [
      "Add the main masjid admin email and any committee members who need to stay informed.",
      "Limit recipients to those who genuinely need each alert type to avoid notification fatigue.",
    ],
  },
  {
    id: "users",
    icon: Users,
    title: "Admin Users",
    href: "/admin/users",
    colour: "text-red-600",
    bg: "bg-red-50",
    summary: "Create, manage, and assign roles to admin panel users (super admin only).",
    setup: [
      "Go to Admin Users in the sidebar (super admin only).",
      "Click New User. Enter their name, email address, and assign a role.",
      "Available roles: Super Admin (full access), Masjid Admin, Donation Admin, Education Admin, Content Editor, Read Only.",
      "The new user receives a welcome email with a link to set their password.",
      "To remove access, delete the user or change their role to Read Only.",
    ],
    tips: [
      "Follow the principle of least privilege — give users only the role they need.",
      "Super Admin should be limited to 1–2 trusted individuals.",
      "Use Read Only for committee members who need visibility but not editing rights.",
    ],
  },
];

const ROLE_GUIDE = [
  { role: "Super Admin", access: "Full access to all modules including Admin Users and Notifications." },
  { role: "Masjid Admin", access: "Prayer times, services, announcements, events, enquiries, volunteers, members, staff, gallery, news, Qur'an, site settings." },
  { role: "Donation Admin", access: "Donations module only (campaigns and transactions)." },
  { role: "Education Admin", access: "Courses and registrations only." },
  { role: "Content Editor", access: "Announcements, news, events, services, gallery." },
  { role: "Read Only", access: "View all data but cannot create, edit, or delete anything." },
];

function ModuleCard({ mod }: { mod: (typeof MODULES)[number] }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = mod.icon;
  return (
    <Card className="border-card-border overflow-hidden" id={`module-${mod.id}`}>
      <CardHeader
        className="cursor-pointer select-none pb-3"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${mod.bg}`}>
              <Icon className={`h-5 w-5 ${mod.colour}`} />
            </div>
            <div>
              <CardTitle className="text-base">{mod.title}</CardTitle>
              <p className="text-muted-foreground text-sm mt-0.5 leading-snug">{mod.summary}</p>
            </div>
          </div>
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
          )}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 border-t border-border">
          <div className="grid md:grid-cols-2 gap-6 pt-4">
            <div>
              <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                How to use
              </p>
              <ol className="space-y-1.5 text-sm text-muted-foreground">
                {mod.setup.map((step, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-semibold text-primary shrink-0">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            {mod.tips.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary" />
                  Tips
                </p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {mod.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-secondary shrink-0">→</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function AdminHelpPage() {
  const [supportOpen, setSupportOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = MODULES.filter(
    (m) =>
      !search ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.summary.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout>
      <SupportRequestModal open={supportOpen} onOpenChange={setSupportOpen} />

      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl mb-2">Help & Documentation</h1>
          <p className="text-muted-foreground">
            Everything you need to manage the Grays Park Masjid website. Click any module to expand full instructions.
          </p>
        </div>
        <Button onClick={() => setSupportOpen(true)} className="shrink-0 gap-2">
          <LifeBuoy className="h-4 w-4" />
          Request Support
        </Button>
      </div>

      <Card className="border-card-border mb-6 bg-primary/5 border-primary/20">
        <CardContent className="p-5">
          <p className="font-semibold mb-1 text-primary">Getting started</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The admin panel is organised into modules — each one manages a specific part of the public website.
            Start by setting up <strong>Prayer Times</strong> and <strong>Site Settings</strong>, then move on to
            <strong> Services</strong> and <strong>Events</strong>. Use the modules below in any order
            depending on what your masjid needs first.
          </p>
        </CardContent>
      </Card>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search modules…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-3 mb-10">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm py-6 text-center">No modules match your search.</p>
        ) : (
          filtered.map((mod) => <ModuleCard key={mod.id} mod={mod} />)
        )}
      </div>

      <Card className="border-card-border mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Admin Roles & Permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-semibold text-foreground w-40">Role</th>
                  <th className="text-left py-2 font-semibold text-foreground">Access</th>
                </tr>
              </thead>
              <tbody>
                {ROLE_GUIDE.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-2 pr-4 font-medium text-primary whitespace-nowrap">{r.role}</td>
                    <td className="py-2 text-muted-foreground">{r.access}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-card-border bg-primary/5 border-primary/20">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-semibold text-primary mb-1">Still need help?</p>
            <p className="text-sm text-muted-foreground">
              Contact the LaunchFlow support team directly and we'll get back to you as soon as possible.
            </p>
          </div>
          <Button onClick={() => setSupportOpen(true)} className="gap-2 shrink-0">
            <LifeBuoy className="h-4 w-4" />
            Request Support
          </Button>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
