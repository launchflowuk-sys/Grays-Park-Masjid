import { useEffect } from "react";
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
import AdminLoginPage from "@/pages/admin/login";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminPrayerTimesPage from "@/pages/admin/prayer-times";
import AdminDonationsPage from "@/pages/admin/donations";
import AdminServicesPage from "@/pages/admin/services";
import AdminEnquiriesPage from "@/pages/admin/enquiries";
import AdminSettingsPage from "@/pages/admin/settings";
import AdminUsersPage from "@/pages/admin/users";
import AdminNotificationsPage from "@/pages/admin/notifications";
import AdminAnnouncementsPage from "@/pages/admin/announcements";
import AdminEventsPage from "@/pages/admin/events";
import AdminCoursesPage from "@/pages/admin/courses";
import AdminVolunteersPage from "@/pages/admin/volunteers";
import AdminMembersPage from "@/pages/admin/members";
import AdminGalleryPage from "@/pages/admin/gallery";
import AdminNewsPage from "@/pages/admin/news";
import AdminStaffPage from "@/pages/admin/staff";
import QuranPage from "@/pages/quran";
import QuranSurahPage from "@/pages/quran-surah";
import AdminQuranSettingsPage from "@/pages/admin/quran-settings";
import AdminQuranFeaturedAyahPage from "@/pages/admin/quran-featured-ayah";
import AdminQuranReflectionsPage from "@/pages/admin/quran-reflections";
import { QuranAudioProvider } from "@/lib/quran-audio-player";
import { MiniAudioPlayer } from "@/components/quran/mini-audio-player";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/prayer-times" component={PrayerTimesPage} />
      <Route path="/prayer-times/display" component={PrayerTimesDisplayPage} />
      <Route path="/timetable" component={TimetablePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/donate" component={DonatePage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/announcements" component={AnnouncementsPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/education" component={EducationPage} />
      <Route path="/volunteer" component={VolunteerPage} />
      <Route path="/join" component={JoinPage} />
      <Route path="/membership-status/:token" component={MembershipStatusPage} />
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
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/prayer-times" component={AdminPrayerTimesPage} />
      <Route path="/admin/donations" component={AdminDonationsPage} />
      <Route path="/admin/services" component={AdminServicesPage} />
      <Route path="/admin/enquiries" component={AdminEnquiriesPage} />
      <Route path="/admin/settings" component={AdminSettingsPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/notifications" component={AdminNotificationsPage} />
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
      <Route path="/admin" component={AdminDashboardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
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
