import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { IslamicPattern, IslamicStar } from "@/components/site/islamic-pattern";

type Faq = { question: string; answer: string };

const DEFAULT_FAQS: Faq[] = [
  { question: "What are the masjid's opening hours?", answer: "The masjid is open daily from before Fajr until after Isha prayer. Exact times vary with the season — see our Prayer Times page for today's timings." },
  { question: "Do I need to book to attend Jumu'ah or Eid prayers?", answer: "No booking is required for regular Jumu'ah prayers. For Eid prayers, please check our Events page closer to the date as some years require registration due to capacity." },
  { question: "How can I register my child for Madrassah?", answer: "Visit our Education or Madrassah page for current class information, then register through our Education page or contact the office directly." },
  { question: "How do I make a donation?", answer: "You can donate online via our Donate page, or via bank transfer using the details listed there. Zakat, Sadaqah, and Lillah donations are all accepted." },
  { question: "How do I volunteer at the masjid?", answer: "Visit our Volunteer page to see current opportunities and submit an application — we welcome help across many areas of masjid life." },
];

export default function FaqsPage() {
  const { data } = useGetSettingPublic("faqs_content");
  let faqs: Faq[] = DEFAULT_FAQS;
  if (data?.value) {
    try {
      const parsed = JSON.parse(data.value);
      if (Array.isArray(parsed) && parsed.length > 0) faqs = parsed;
    } catch { faqs = DEFAULT_FAQS; }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative bg-primary text-primary-foreground overflow-hidden">
          <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
          <IslamicStar className="absolute -top-10 -right-10 w-56 h-56 text-white/5" />
          <IslamicStar className="absolute -bottom-10 -left-10 w-48 h-48 text-white/5" />
          <div className="relative mx-auto max-w-4xl px-6 py-16 md:py-20 text-center">
            <h1 className="font-serif text-4xl md:text-5xl">Frequently Asked Questions</h1>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg leading-relaxed">
              Answers to the questions we're asked most often.
            </p>
          </div>
        </section>

        {/* FAQs */}
        <section className="mx-auto max-w-3xl px-6 py-14 md:py-18" data-testid="section-faqs-content">
          <div className="flex items-center gap-3 mb-10">
            <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
            <h2 className="font-serif text-3xl">Common Questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                data-testid={`accordion-faq-${index}`}
                className="border border-card-border rounded-xl px-5 overflow-hidden data-[state=open]:border-primary/30 data-[state=open]:bg-primary/[0.02] transition-colors"
              >
                <AccordionTrigger className="text-left font-serif text-lg py-5 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* CTA band */}
        <section className="relative bg-primary text-primary-foreground overflow-hidden">
          <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
          <IslamicStar className="absolute -top-6 -right-6 w-36 h-36 text-white/5" />
          <div className="relative mx-auto max-w-3xl px-6 py-12 text-center">
            <h2 className="font-serif text-2xl md:text-3xl mb-3">Still have a question?</h2>
            <p className="text-primary-foreground/70 mb-6">Send us a message and we'll get back to you as soon as possible.</p>
            <a href="/contact">
              <button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-6 py-2.5 rounded-md text-sm transition-colors">
                Contact Us
              </button>
            </a>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
