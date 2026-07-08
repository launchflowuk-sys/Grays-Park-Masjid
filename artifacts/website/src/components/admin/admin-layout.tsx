import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth-context";
import { useLogout } from "@workspace/api-client-react";
import {
  LayoutDashboard,
  Clock,
  HandHeart,
  Wrench,
  Inbox,
  Settings,
  Users,
  LogOut,
  Megaphone,
  CalendarDays,
  GraduationCap,
  Menu,
  Images,
  Newspaper,
  Bell,
  BookOpen,
  Sparkles,
  NotebookText,
  HelpCircle,
  Smartphone,
  Mail,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/prayer-times", label: "Prayer Times", icon: Clock },
  { href: "/admin/donations", label: "Donations", icon: HandHeart },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/courses", label: "Courses", icon: GraduationCap },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/volunteers", label: "Volunteers", icon: HandHeart },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/staff", label: "Staff & Committee", icon: Users },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/admin/blog", label: "Blog & Content", icon: Newspaper },
  { href: "/admin/quran-settings", label: "Qur'an Settings", icon: BookOpen },
  { href: "/admin/quran-featured-ayah", label: "Featured Ayah", icon: Sparkles },
  { href: "/admin/quran-reflections", label: "Qur'an Reflections", icon: NotebookText },
  { href: "/admin/email-campaigns", label: "Email Campaigns", icon: Mail },
  { href: "/admin/settings", label: "Site Settings", icon: Settings },
  { href: "/admin/help", label: "Help & Docs", icon: HelpCircle },
];

const SUPER_ADMIN_NAV_ITEMS = [
  { href: "/admin/users", label: "Admin Users", icon: Users },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/push-notifications", label: "Push Notifications", icon: Smartphone },
];

function SidebarNav({
  admin,
  location,
  onNavigate,
}: {
  admin: ReturnType<typeof useAuth>["admin"];
  location: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = location === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              active
                ? "bg-primary-foreground/15 text-primary-foreground"
                : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            }`}
            data-testid={`link-admin-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
      {admin?.role === "super_admin" &&
        SUPER_ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-foreground/15 text-primary-foreground"
                  : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              }`}
              data-testid={`link-admin-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
    </nav>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const { admin, isLoading, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/admin/login");
      },
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const sidebarFooter = (
    <div className="px-3 py-4 border-t border-primary-foreground/10 shrink-0" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
      <div className="px-3 mb-3">
        <p className="text-sm font-medium truncate">{admin?.name}</p>
        <p className="text-xs text-primary-foreground/60 truncate">{admin?.role.replace(/_/g, " ")}</p>
      </div>
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
        data-testid="button-admin-logout"
      >
        <LogOut className="h-4 w-4" />
        Log Out
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-muted/20">
      <aside className="hidden md:flex w-64 shrink-0 bg-primary text-primary-foreground flex-col overflow-hidden">
        <div className="px-6 py-6 border-b border-primary-foreground/10">
          <p className="font-serif text-lg">Grays Park Masjid</p>
          <p className="text-xs text-primary-foreground/60">Admin Panel</p>
        </div>
        <SidebarNav admin={admin} location={location} />
        {sidebarFooter}
      </aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          className="w-64 p-0 bg-primary text-primary-foreground flex flex-col border-primary-foreground/10 overflow-hidden"
        >
          <div className="px-6 py-6 border-b border-primary-foreground/10">
            <p className="font-serif text-lg">Grays Park Masjid</p>
            <p className="text-xs text-primary-foreground/60">Admin Panel</p>
          </div>
          <SidebarNav admin={admin} location={location} onNavigate={() => setMobileNavOpen(false)} />
          {sidebarFooter}
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileNavOpen(true)}
            data-testid="button-admin-nav-toggle"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <p className="font-serif text-base">Grays Park Masjid Admin</p>
        </div>
        <main className="flex-1 overflow-x-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
