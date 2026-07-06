import { useParams } from "wouter";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetMemberStatusByToken, getGetMemberStatusByTokenQueryKey } from "@workspace/api-client-react";
import { ClipboardCheck, CheckCircle2, XCircle, HelpCircle, Clock, AlertTriangle } from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: typeof Clock; className: string; description: string }
> = {
  pending: {
    label: "Pending review",
    icon: Clock,
    className: "bg-amber-100 text-amber-800 border-amber-200",
    description: "Your application has been received and is waiting to be reviewed by our team.",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-800 border-green-200",
    description: "Alhamdulillah, your membership has been approved. Welcome to the community!",
  },
  denied: {
    label: "Not approved",
    icon: XCircle,
    className: "bg-red-100 text-red-800 border-red-200",
    description: "After review, we were unable to approve your application at this time.",
  },
  info_requested: {
    label: "More information needed",
    icon: HelpCircle,
    className: "bg-blue-100 text-blue-800 border-blue-200",
    description: "We need a little more information from you before we can complete our review.",
  },
};

export default function MembershipStatusPage() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, isError } = useGetMemberStatusByToken(token ?? "", {
    query: { enabled: !!token, queryKey: getGetMemberStatusByTokenQueryKey(token ?? "") },
  });

  const config = data ? STATUS_CONFIG[data.status] : undefined;
  const Icon = config?.icon ?? Clock;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <ClipboardCheck className="h-10 w-10 mx-auto mb-4 text-primary-foreground/90" />
            <h1 className="font-serif text-3xl md:text-4xl">Membership Application Status</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Check the status of your membership application to Grays Park Masjid.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-6 py-16">
          <Card className="border-card-border" data-testid="card-membership-status">
            <CardContent className="p-6 md:p-8">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8" data-testid="text-status-loading">
                  Loading your application status...
                </p>
              ) : isError || !data ? (
                <div className="text-center py-8" data-testid="text-status-not-found">
                  <AlertTriangle className="h-10 w-10 mx-auto mb-4 text-destructive" />
                  <h2 className="font-serif text-2xl mb-2">Application not found</h2>
                  <p className="text-muted-foreground">
                    We couldn't find an application for this link. Please check the link from your confirmation
                    email, or contact us if you believe this is a mistake.
                  </p>
                </div>
              ) : (
                <div data-testid="text-status-result">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="h-8 w-8" />
                    <div>
                      <p className="text-sm text-muted-foreground">Applicant</p>
                      <p className="font-serif text-xl">{data.fullName}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <Badge
                      variant="outline"
                      className={config?.className}
                      data-testid="badge-status"
                    >
                      {config?.label ?? data.status}
                    </Badge>
                  </div>

                  <p className="text-foreground mb-6">{config?.description}</p>

                  <div className="grid sm:grid-cols-2 gap-4 text-sm border-t border-card-border pt-6">
                    <div>
                      <p className="text-muted-foreground">Membership type</p>
                      <p className="font-medium capitalize">{data.membershipType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Submitted</p>
                      <p className="font-medium">{new Date(data.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {data.status === "info_requested" && data.adminNotes && (
                    <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 p-4">
                      <p className="text-sm font-medium text-blue-900 mb-1">What we need from you</p>
                      <p className="text-sm text-blue-800">{data.adminNotes}</p>
                      <p className="text-sm text-blue-800 mt-2">
                        Please reply to the confirmation email you received, or contact us directly with these
                        details.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
