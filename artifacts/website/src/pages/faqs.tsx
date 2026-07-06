import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useGetSettingPublic } from "@workspace/api-client-react";

type Faq = { question: string; answer: string };

const DEFAULT_FAQS: Faq[] = [
  {
    question: "What are the masjid's opening hours?",
    answer:
      "The masjid is open daily from before Fajr until after Isha prayer. Exact times vary with the season — see our Prayer Times page for today's timings.",
  },
  {
    question: "Is there parking available?",
    answer:
      "Limited on-site parking is available, and it fills up quickly during Jumu'ah and Ramadan. Please consider walking, cycling, or car-sharing where possible.",
  },
  {
    question: "Do I need to book to attend Jumu'ah or Eid prayers?",
    answer:
      "No booking is required for regular Jumu'ah prayers. For Eid prayers, please check our Events page closer to the date as some years require registration due to capacity.",
  },
  {
    question: "How can I register my child for Madrassah?",
    answer:
      "Visit our Education or Madrassah page for current class information, then register through our Education page or contact the office directly.",
  },
  {
    question: "How do I make a donation?",
    answer:
      "You can donate online via our Donate page, or via bank transfer using the details listed there. Zakat, Sadaqah, and Lillah donations are all accepted.",
  },
  {
    question: "How do I volunteer at the masjid?",
    answer:
      "Visit our Volunteer page to see current opportunities and submit an application — we welcome help across many areas of masjid life.",
  },
];

export default function FaqsPage() {
  const { data } = useGetSettingPublic("faqs_content");
  let faqs: Faq[] = DEFAULT_FAQS;
  if (data?.value) {
    try {
      const parsed = JSON.parse(data.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        faqs = parsed;
      }
    } catch {
      faqs = DEFAULT_FAQS;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="font-serif text-3xl md:text-4xl">Frequently Asked Questions</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Answers to the questions we're asked most often.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-16" data-testid="section-faqs-content">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`} data-testid={`accordion-faq-${index}`}>
                <AccordionTrigger className="text-left font-serif text-lg">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
