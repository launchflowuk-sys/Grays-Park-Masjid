import { lazy, Suspense, useLayoutEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import PrayerTimesPage from "@/pages/prayer-times";
import PrayerTimesDisplayPage from "@/pages/prayer-times-display";
import TimetablePage from "@/pages/timetable";
import AboutPage from "@/pages/about";
import ServicesPage from "@/pages/services";
import DonatePage from "@/pages/donate";
import DonateCampaignPage from "@/pages/donate-campaign";
import ContactPage from "@/pages/contact";
import AnnouncementsPage from "@/pages/announcements";
import EventsPage from "@/pages/events";
import EducationPage from "@/pages/education";
import VolunteerPage from "@/pages/volunteer";
import JoinPage from "@/pages/join";
import MembershipStatusPage from "@/pages/membership-status";
import GalleryPage from "@/pages/gallery";
import MadrassahPage from "@/pages/madrassah";
import SistersFacilitiesPage from "@/pages/sisters-facilities";
import YouthProgrammesPage from "@/pages/youth-programmes";
import JumuahPage from "@/pages/jumuah";
import FuneralPage from "@/pages/funeral";
import NikahPage from "@/pages/nikah";
import RamadanPage from "@/pages/ramadan";
import EidPage from "@/pages/eid";
import ZakatPage from "@/pages/zakat";
import SafeguardingPage from "@/pages/safeguarding";
import PoliciesPage from "@/pages/policies";
import FaqsPage from "@/pages/faqs";
import { AuthProvider } from "@/lib/auth-context";
import QuranPage from "@/pages/quran";
import QuranSurahPage from "@/pages/quran-surah";
import BlogPage from "@/pages/blog";
import BlogPostPage from "@/pages/blog-post";
import ProphetPage from "@/pages/prophet";
import StoriesPage from "@/pages/stories";
import UnsubscribePage from "@/pages/unsubscribe";
import { QuranAudioProvider } from "@/lib/quran-audio-player";
import { MiniAudioPlayer } from "@/components/quran/mini-audio-player";

// Admin pages are lazy-loaded so the public site bundle doesn't carry the
// entire admin dashboard. Each route becomes its own Vite chunk.
const AdminLoginPage = lazy(() => import("@/pages/admin/login"));
const AdminDashboardPage = lazy(() => import("@/pages/admin/dashboard"));
const AdminPrayerTimesPage = lazy(() => import("@/pages/admin/prayer-times"));
const AdminDonationsPage = lazy(() => import("@/pages/admin/donations"));
const AdminServicesPage = lazy(() => import("@/pages/admin/services"));
const AdminEnquiriesPage = lazy(() => import("@/pages/admin/enquiries"));
const AdminSettingsPage = lazy(() => import("@/pages/admin/settings"));
const AdminUsersPage = lazy(() => import("@/pages/admin/users"));
const AdminNotificationsPage = lazy(() => import("@/pages/admin/notifications"));
const AdminAnnouncementsPage = lazy(() => import("@/pages/admin/announcements"));
const AdminEventsPage = lazy(() => import("@/pages/admin/events"));
const AdminCoursesPage = lazy(() => import("@/pages/admin/courses"));
const AdminVolunteersPage = lazy(() => import("@/pages/admin/volunteers"));
const AdminMembersPage = lazy(() => import("@/pages/admin/members"));
const AdminGalleryPage = lazy(() => import("@/pages/admin/gallery"));
const AdminNewsPage = lazy(() => import("@/pages/admin/news"));
const AdminStaffPage = lazy(() => import("@/pages/admin/staff"));
const AdminQuranSettingsPage = lazy(() => import("@/pages/admin/quran-settings"));
const AdminQuranFeaturedAyahPage = lazy(() => import("@/pages/admin/quran-featured-ayah"));
const AdminQuranReflectionsPage = lazy(() => import("@/pages/admin/quran-reflections"));
const AdminHelpPage = lazy(() => import("@/pages/admin/help"));
const AdminPushNotificationsPage = lazy(() => import("@/pages/admin/push-notifications"));
const AdminBlogPage = lazy(() => import("@/pages/admin/blog"));
const AdminBlogEditorPage = lazy(() => import("@/pages/admin/blog-editor"));
const AdminEmailCampaignsPage = lazy(() => import("@/pages/admin/email-campaigns"));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Never retry on 4xx — a 404/403 is a definitive answer, not a transient failure.
      // Only retry on 5xx (server errors) up to 1 time.
      retry: (failureCount, error) => {
        const status =
          (error as { status?: number })?.status ??
          (error as { response?: { status?: number } })?.response?.status;
        if (typeof status === "number" && status >= 400 && status < 500) return false;
        return failureCount < 1;
      },
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Suspense fallback={<RouteFallback />}>
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/prayer-times" component={PrayerTimesPage} />
      <Route path="/prayer-times/display" component={PrayerTimesDisplayPage} />
      <Route path="/timetable" component={TimetablePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/donate/:slug" component={DonateCampaignPage} />
      <Route path="/donate" component={DonatePage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/announcements" component={AnnouncementsPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/education" component={EducationPage} />
      <Route path="/volunteer" component={VolunteerPage} />
      <Route path="/join" component={JoinPage} />
      <Route path="/membership-status/:token" component={MembershipStatusPage} />
      <Route path="/unsubscribe" component={UnsubscribePage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/madrassah" component={MadrassahPage} />
      <Route path="/sisters-facilities" component={SistersFacilitiesPage} />
      <Route path="/youth-programmes" component={YouthProgrammesPage} />
      <Route path="/jumuah" component={JumuahPage} />
      <Route path="/funeral" component={FuneralPage} />
      <Route path="/nikah" component={NikahPage} />
      <Route path="/ramadan" component={RamadanPage} />
      <Route path="/eid" component={EidPage} />
      <Route path="/zakat" component={ZakatPage} />
      <Route path="/safeguarding" component={SafeguardingPage} />
      <Route path="/policies" component={PoliciesPage} />
      <Route path="/faqs" component={FaqsPage} />
      <Route path="/quran" component={QuranPage} />
      <Route path="/quran/:number" component={QuranSurahPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/prophet" component={ProphetPage} />
      <Route path="/stories" component={StoriesPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/prayer-times" component={AdminPrayerTimesPage} />
      <Route path="/admin/donations" component={AdminDonationsPage} />
      <Route path="/admin/services" component={AdminServicesPage} />
      <Route path="/admin/enquiries" component={AdminEnquiriesPage} />
      <Route path="/admin/settings" component={AdminSettingsPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/notifications" component={AdminNotificationsPage} />
      <Route path="/admin/push-notifications" component={AdminPushNotificationsPage} />
      <Route path="/admin/announcements" component={AdminAnnouncementsPage} />
      <Route path="/admin/events" component={AdminEventsPage} />
      <Route path="/admin/courses" component={AdminCoursesPage} />
      <Route path="/admin/volunteers" component={AdminVolunteersPage} />
      <Route path="/admin/members" component={AdminMembersPage} />
      <Route path="/admin/gallery" component={AdminGalleryPage} />
      <Route path="/admin/news" component={AdminNewsPage} />
      <Route path="/admin/staff" component={AdminStaffPage} />
      <Route path="/admin/quran-settings" component={AdminQuranSettingsPage} />
      <Route path="/admin/quran-featured-ayah" component={AdminQuranFeaturedAyahPage} />
      <Route path="/admin/quran-reflections" component={AdminQuranReflectionsPage} />
      <Route path="/admin/help" component={AdminHelpPage} />
      <Route path="/admin/blog/new" component={AdminBlogEditorPage} />
      <Route path="/admin/blog/:id/edit" component={AdminBlogEditorPage} />
      <Route path="/admin/blog" component={AdminBlogPage} />
      <Route path="/admin/email-campaigns" component={AdminEmailCampaignsPage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [location]);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <QuranAudioProvider>
              <ScrollToTop />
              <Router />
              <MiniAudioPlayer />
            </QuranAudioProvider>
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
