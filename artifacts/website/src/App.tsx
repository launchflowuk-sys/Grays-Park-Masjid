import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import PrayerTimesPage from "@/pages/prayer-times";
import TimetablePage from "@/pages/timetable";
import AboutPage from "@/pages/about";
import ServicesPage from "@/pages/services";
import DonatePage from "@/pages/donate";
import ContactPage from "@/pages/contact";
import { AuthProvider } from "@/lib/auth-context";
import AdminLoginPage from "@/pages/admin/login";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminPrayerTimesPage from "@/pages/admin/prayer-times";
import AdminDonationsPage from "@/pages/admin/donations";
import AdminServicesPage from "@/pages/admin/services";
import AdminEnquiriesPage from "@/pages/admin/enquiries";
import AdminSettingsPage from "@/pages/admin/settings";
import AdminUsersPage from "@/pages/admin/users";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/prayer-times" component={PrayerTimesPage} />
      <Route path="/timetable" component={TimetablePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/donate" component={DonatePage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/prayer-times" component={AdminPrayerTimesPage} />
      <Route path="/admin/donations" component={AdminDonationsPage} />
      <Route path="/admin/services" component={AdminServicesPage} />
      <Route path="/admin/enquiries" component={AdminEnquiriesPage} />
      <Route path="/admin/settings" component={AdminSettingsPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
