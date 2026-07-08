/**
 * Trims/expands community posts to meet the 600-800 word requirement.
 * Run with: /path/to/tsx lib/db/src/update-blog-categories-wordcount.ts
 */

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq } from "drizzle-orm";
import { blogPostsTable } from "./schema/blog.ts";

const { Pool } = pg;

function countWords(html: string) {
  return html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
}

const patches: Array<{ slug: string; content: string }> = [
  {
    slug: "nikkah-services-grays-park-masjid",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>Nikkah is one of the most blessed and important events in a Muslim's life. It is a sacred covenant — not just between two people, but witnessed by Allah, recorded by the angels, and celebrated by the community. The Prophet ﷺ described it as completing half of one's faith, and said: "There is nothing like marriage for two who love each other."</p>

<p>At Grays Park Masjid, we are pleased to offer comprehensive Nikkah ceremony services through <strong>Imam Abdul Rashid</strong>, who has been conducting Nikkah ceremonies for families across London, Essex, and the surrounding areas for many years.</p>

<h2>What We Offer</h2>

<p>Our Nikkah service is designed to make the process as smooth, meaningful, and Islamic as possible. We offer:</p>

<ul>
  <li><strong>One-to-one consultation</strong> — Imam Abdul Rashid meets with the couple and families beforehand to discuss the Islamic requirements of the Nikkah, answer questions, and ensure everything is in order.</li>
  <li><strong>Witnesses arranged on request</strong> — If you need witnesses for the ceremony, we can arrange this through the masjid community.</li>
  <li><strong>Khutbah in Arabic with English translation</strong> — The Nikkah Khutbah (sermon) is delivered in classical Arabic as is the Sunnah, with a clear English translation so all guests can understand and share in the blessing of the moment.</li>
  <li><strong>Two signed Nikkah certificates</strong> — One for each family, formally documenting the Islamic marriage contract.</li>
  <li><strong>Ceremonies at the masjid or at your venue</strong> — We can conduct the Nikkah at Grays Park Masjid, or Imam Abdul Rashid can travel to your home, a wedding venue, or another location of your choice.</li>
</ul>

<h2>The Islamic Requirements</h2>

<p>A properly conducted Nikkah ensures that the union is Islamically valid, clearly documented, and witnessed according to the Sunnah. The Nikkah requires four key elements: an offer (<em>Ijab</em>) and acceptance (<em>Qabool</em>) from both parties, a Wali (guardian) for the bride, at least two Muslim witnesses, and a Mahr (dowry) agreed and stated at the time of the contract.</p>

<p>Imam Abdul Rashid will walk through each of these requirements with your family during the initial consultation, ensuring nothing is overlooked and that everyone present understands what is happening and why. For families where not everyone speaks Arabic, the English explanation given during the ceremony ensures that the meaning of every word is accessible to all.</p>

<h2>Civil Marriage Registration</h2>

<p>Please note that an Islamic Nikkah is separate from civil marriage registration in the UK. If you wish your marriage to be legally recognised by the state, you will also need to register it with the relevant civil registry. We are happy to advise on this and recommend that couples arrange their civil registration either before or alongside their Nikkah.</p>

<h2>Serving the Community</h2>

<p>Grays Park Masjid is run by the Thurrock Islamic Education & Cultural Association (TIECA), and we take our responsibility to the community seriously. Nikkah ceremonies are among the most important moments in community life — and we want every couple in our community to have access to a knowledgeable, caring Imam who can guide them through the process properly.</p>

<p>We serve families from Thurrock, Grays, Tilbury, Basildon, Dagenham, and the wider Essex and East London area.</p>

<h2>Get in Touch</h2>

<p>To enquire about booking a Nikkah ceremony or to arrange an initial consultation with Imam Abdul Rashid, please contact us:</p>

<p><strong>Phone / WhatsApp:</strong> +44 7944 182862</p>

<p>We recommend contacting us at least four to six weeks before your preferred date to allow adequate time for consultation and preparation.</p>

<p>May Allah bless every couple who comes to us with a marriage full of love, mercy, and barakah. <em>Ameen.</em></p>

<blockquote><p><em>"And of His signs is that He created for you from yourselves mates that you may find tranquillity in them; and He placed between you affection and mercy. Indeed in that are signs for a people who give thought."</em><br>— Surah Ar-Rum, 30:21</p></blockquote>`,
  },
  {
    slug: "hajj-2027-community-support",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>Hajj is one of the five pillars of Islam — an obligation upon every Muslim who is physically and financially able to perform it at least once in their lifetime. It is also, for most Muslims who undertake it, one of the most transformative experiences of their lives. Standing on the plain of Arafat with millions of believers from every nation on Earth — wearing the same simple white garment, making the same du'a, facing the same direction — is something no description can fully prepare you for.</p>

<p>Alhamdulillah, following the success of our Hajj 2026 programme, we have been receiving enquiries from community members planning for <strong>Hajj 2027</strong>. This post explains how Grays Park Masjid can support you — and what you need to know as you begin planning.</p>

<h2>Our Role</h2>

<p>Grays Park Masjid does not operate as a commercial Hajj travel agent. What we offer is something different and, we believe, more valuable: <strong>free, non-commercial advice, guidance, and community support</strong> for those considering or planning Hajj.</p>

<p>Our team has direct experience of the Hajj journey, knowledge of the current systems and routes, and connections with reputable service providers. We are happy to help you understand your options, navigate the application process, and prepare practically and spiritually — without any commercial interest in your decision.</p>

<h2>The Two Main Routes</h2>

<p>There are currently two main routes to Hajj for British Muslims:</p>

<h3>The NUSUK Route</h3>
<p>The NUSUK platform is the Saudi government's official digital system for independent Hajj applications. It allows individuals and families to apply for Hajj permits directly, then arrange their own accommodation, transport, and Hajj services through the platform. It offers more flexibility but requires more active planning and familiarity with the system. Our team has navigated this route and can walk you through the application process step by step.</p>

<h3>The Dual National Route</h3>
<p>This route is available to British Muslims who hold dual nationality with a Muslim-majority country. It allows applications through the Hajj mission of the second country, which often has different quotas, different timelines, and a different process. Our team can advise on whether this route applies to your situation and how to navigate it effectively.</p>

<h2>Registering Your Interest</h2>

<p>Given the level of enquiries for Hajj 2027, we strongly encourage those interested to register as early as possible. Demand for Hajj permits can be high — particularly via the NUSUK route — and early registration allows significantly more time for practical and spiritual preparation.</p>

<p>To register your interest and receive personalised guidance, please complete our online form at: <strong><a href="https://tinyurl.com/Arif-ABGHajj27">tinyurl.com/Arif-ABGHajj27</a></strong></p>

<p>Alternatively, speak to us directly at the masjid or contact us via WhatsApp.</p>

<h2>Preparing for Hajj</h2>

<p>Hajj is far more than a logistical exercise. It is the journey of a lifetime, and spiritual preparation is as important as practical planning. At Grays Park Masjid, we run periodic Hajj preparation classes covering the rites of Hajj, the du'as for each station, the significance of each sacred site, and how to maximise the spiritual benefits of the experience.</p>

<p>If you are planning for 2027, now is an excellent time to begin:</p>
<ul>
  <li>Learning the manasik (rites) of Hajj properly — not just the actions, but their meaning</li>
  <li>Increasing your worship — Tahajjud, Quran recitation, dhikr, and charity</li>
  <li>Settling any outstanding debts or obligations before travelling</li>
  <li>Speaking to community members who have performed Hajj and learning from their experience</li>
  <li>Making sincere du'a that Allah calls you as His guest</li>
</ul>

<h2>A Word on Intention</h2>

<p>The Prophet ﷺ said: "Whoever performs Hajj for the sake of Allah and does not commit any obscenity or sin will return home as free of sin as the day his mother gave birth to him."</p>

<p>The journey to Hajj begins long before the plane departs. It begins in the heart — with the intention, the preparation, and the du'a that Allah makes us of those invited to His house. May Allah accept the Hajj of all who have performed it, and open this door for all who are planning. Ameen.</p>`,
  },
];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  for (const { slug, content } of patches) {
    const words = countWords(content);
    await db.update(blogPostsTable).set({ content, updatedAt: new Date() }).where(eq(blogPostsTable.slug, slug));
    console.log(`  ✓ ${slug} (${words}w)`);
  }

  console.log("\nVerification:");
  const res = await pool.query(
    `SELECT slug, category, published, feature_image_url IS NOT NULL as has_image FROM blog_posts WHERE category IN ('islamic_history','stories','community','reflections') ORDER BY category, created_at`
  );
  for (const r of res.rows) {
    console.log(`  [${r.published ? "published" : "DRAFT"}] [${r.has_image ? "✓ image" : "✗ no image"}] ${r.category} — ${r.slug}`);
  }
  console.log(`\nTotal: ${res.rows.length}/16`);

  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
