import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { FileLock2, FileText, Scale } from "lucide-react";
import { IslamicPattern, IslamicStar, ArchIconBadge } from "@/components/site/islamic-pattern";

const DEFAULT_CONTENT = `Grays Park Masjid maintains a set of governing policies to ensure we operate safely, transparently, and in line with charity and legal requirements. These include our Safeguarding Policy, Privacy Policy, Equality & Diversity Policy, Health & Safety Policy, and Complaints Procedure.

Copies of our full policy documents are available on request from the masjid office. We review all policies at least annually, or sooner if legislation or best practice changes.

Our Privacy Policy explains how we collect, use, and protect personal information submitted through this website, including contact forms, course registrations, and donations. We never sell or share personal data with third parties for marketing purposes.`;

const FEATURES = [
  { icon: FileLock2, title: "Privacy Policy", description: "How we collect, use, and protect your personal information." },
  { icon: Scale, title: "Equality & Diversity", description: "Our commitment to fair and inclusive treatment for everyone." },
  { icon: FileText, title: "Complaints Procedure", description: "Request full policy documents from the masjid office at any time." },
];

const PRIVACY_CONTACT = "info@graysparkmasjid.org.uk";

// This is the privacy policy URL registered with the App Store and Google Play,
// so it must describe what the website and the mobile app actually collect.
// If you change what is collected in code, change this too.
const PRIVACY_SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "What we collect",
    body: [
      "Membership and enquiry forms, on this website and in our app, ask for your name, email address, an optional phone number, and the type of membership you are applying for. Providing them is entirely optional — the app can be used in full without signing up.",
      "Donations are processed by Square on their own secure checkout pages. Your card details never pass through our systems and we never see them. We record the amount, the appeal you gave to, and any name or email you chose to give.",
      "If you turn on prayer notifications in the app, we store a notification token and a randomly generated device identifier so we can send the adhan reminder to your device. These are not linked to you unless you have also signed up for membership.",
      "The Qibla compass uses your device's location and compass sensors. This happens entirely on your phone — your location is never transmitted to us or to anyone else.",
    ],
  },
  {
    heading: "How we use it",
    body: [
      "To process membership applications, to send prayer time and masjid notifications you have asked for, to acknowledge donations, and to reply to enquiries.",
      "We do not sell your personal data, and we do not share it with third parties for marketing. We use no advertising or analytics trackers in our website or app.",
    ],
  },
  {
    heading: "Who else handles it",
    body: [
      "Square processes donation payments. Apple and Google deliver push notifications to your device. Our email provider delivers messages we send you. Each acts only on our instructions and for the purposes above.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "Membership records are kept for as long as the membership is active and for six years afterwards, as required for charity accounting. Donation records are kept for six years. Notification tokens are deleted when you turn notifications off or uninstall the app. Enquiries are kept for two years.",
    ],
  },
  {
    heading: "Deleting your data",
    body: [
      "This applies to the Grays Masjid app, published by Grays Park Masjid, and to this website.",
      `To request deletion: email ${PRIVACY_CONTACT} with the subject "Delete my data", sending it from the email address you gave us, or including your full name and the phone number you gave. We will confirm within one month, free of charge. You do not need an account — the app does not have one.`,
      "What we delete: your membership record, including your name, email address, phone number and membership type; any enquiry you have sent us; and the notification token and device identifier stored for your device.",
      "What we must keep, and for how long: if you have donated, UK charity and tax law requires us to retain the donation record — the amount, date and appeal — for six years from the end of the financial year it falls in. Where you gave a name or email with a donation, we retain those alongside it for the same period, and we delete them at the end of it. We keep nothing else.",
      "To stop notifications immediately without contacting anyone, turn them off in the app's settings or uninstall the app. That deletes the notification token held for your device straight away.",
    ],
  },
  {
    heading: "Your other rights",
    body: [
      `Under UK data protection law you may also ask us for a copy of the data we hold about you, ask us to correct it, or object to how we use it. Email ${PRIVACY_CONTACT} and we will respond within one month.`,
      "If you are unhappy with how we have handled your information, you may complain to the Information Commissioner's Office at ico.org.uk.",
    ],
  },
];

export default function PoliciesPage() {
  const { data } = useGetSettingPublic("policies_content");
  const content = data?.value || DEFAULT_CONTENT;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative bg-primary text-primary-foreground overflow-hidden">
          <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
          <IslamicStar className="absolute -top-10 -right-10 w-56 h-56 text-white/5" />
          <IslamicStar className="absolute -bottom-10 -left-10 w-48 h-48 text-white/5" />
          <div className="relative mx-auto max-w-4xl px-6 py-16 md:py-20 text-center">
            <h1 className="font-serif text-4xl md:text-5xl">Policies</h1>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg leading-relaxed">
              Our governing policies, maintained for transparency and legal compliance.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-14 md:py-16">
          <div className="flex items-center gap-3 mb-8">
            <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
            <h2 className="font-serif text-3xl">Governing Policies</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base" data-testid="text-policies-content">
            {content}
          </p>
        </section>

        <section id="privacy" className="mx-auto max-w-4xl px-6 pb-14 md:pb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
            <h2 className="font-serif text-3xl">Privacy Policy</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed text-base">
            This policy covers both this website and the Grays Masjid app, published by Grays Park
            Masjid. We ask for as little as possible, and we never sell it.
          </p>

          {/* Google Play requires the delete-data link to put the deletion steps prominently on the
              landing page, so they are stated here as well as in full below. */}
          <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-5">
            <h3 className="font-serif text-xl mb-2">Deleting your data</h3>
            <p className="text-muted-foreground leading-relaxed text-base">
              Email{" "}
              <a href={`mailto:${PRIVACY_CONTACT}?subject=Delete%20my%20data`} className="text-primary underline underline-offset-4">
                {PRIVACY_CONTACT}
              </a>{" "}
              with the subject &ldquo;Delete my data&rdquo;, from the address you gave us or
              including your name and phone number. We delete your membership record, any enquiry,
              and your notification token, and confirm within one month. Donation records are kept
              for six years where charity and tax law requires it. To stop notifications straight
              away, turn them off in the app or uninstall it. Full detail below.
            </p>
          </div>
          {PRIVACY_SECTIONS.map((section) => (
            <div key={section.heading} className="mt-8">
              <h3 className="font-serif text-xl mb-3">{section.heading}</h3>
              {section.body.map((para) => (
                <p key={para} className="text-muted-foreground leading-relaxed text-base mb-3">
                  {para}
                </p>
              ))}
            </div>
          ))}
          <p className="text-muted-foreground leading-relaxed text-base mt-8">
            Questions about this policy, or about your data, go to{" "}
            <a href={`mailto:${PRIVACY_CONTACT}`} className="text-primary underline underline-offset-4">
              {PRIVACY_CONTACT}
            </a>
            .
          </p>
        </section>

        <section className="relative overflow-hidden border-y border-primary/10">
          <div className="absolute inset-0 bg-primary/5" />
          <IslamicPattern className="absolute inset-0 w-full h-full text-primary/[0.04] [background-size:60px_60px]" />
          <div className="relative mx-auto max-w-6xl px-6 py-14">
            <div className="grid sm:grid-cols-3 gap-6">
              {FEATURES.map((feat) => (
                <div key={feat.title} className="group bg-card rounded-2xl border border-card-border px-6 py-8 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                  <IslamicPattern className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 text-primary/[0.05] group-hover:text-primary/[0.1] transition-colors duration-300" />
                  <ArchIconBadge icon={feat.icon} className="mx-auto mb-4" />
                  <div className="w-8 h-[2px] bg-secondary mx-auto mt-4 mb-3" />
                  <p className="font-serif text-lg mb-2">{feat.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
