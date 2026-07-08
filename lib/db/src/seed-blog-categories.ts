/**
 * Seed: 16 blog posts across 4 categories (4 each).
 * Run with: /path/to/tsx lib/db/src/seed-blog-categories.ts
 */

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { blogPostsTable } from "./schema/blog.ts";

const { Pool } = pg;

const REPLIT_SIDECAR = "http://127.0.0.1:1106";
const IS_REPLIT = Boolean(process.env.REPL_ID || process.env.REPLIT_DEV_DOMAIN);

function parseObjectPath(p: string) {
  if (!p.startsWith("/")) p = `/${p}`;
  const parts = p.split("/");
  return { bucketName: parts[1], objectName: parts.slice(2).join("/") };
}

async function signPutUrl(bucket: string, obj: string): Promise<string> {
  const res = await fetch(`${REPLIT_SIDECAR}/object-storage/signed-object-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bucket_name: bucket, object_name: obj, method: "PUT", expires_at: new Date(Date.now() + 900_000).toISOString() }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Sidecar ${res.status}: ${await res.text()}`);
  return ((await res.json()) as { signed_url: string }).signed_url;
}

async function uploadImage(localPath: string): Promise<string> {
  if (!IS_REPLIT) throw new Error("Requires Replit environment for GCS sidecar image upload.");
  const dir = process.env.PRIVATE_OBJECT_DIR;
  if (!dir) throw new Error("PRIVATE_OBJECT_DIR not set");
  const id = randomUUID();
  const { bucketName, objectName } = parseObjectPath(`${dir}/uploads/${id}`);
  const signedUrl = await signPutUrl(bucketName, objectName);
  const putRes = await fetch(signedUrl, { method: "PUT", body: fs.readFileSync(localPath), headers: { "Content-Type": "image/png" }, signal: AbortSignal.timeout(60_000) });
  if (!putRes.ok) throw new Error(`GCS upload error ${putRes.status}`);
  return `/api/storage/objects/uploads/${id}`;
}

// ── Post content ──────────────────────────────────────────────────────────────

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: "islamic_history" | "stories" | "community" | "reflections";
  imagePath: string;
  content: string;
};

const posts: Post[] = [

  // ══ ISLAMIC HISTORY ════════════════════════════════════════════════════════

  {
    slug: "masjid-quba-first-mosque",
    title: "The First Mosque: Masjid al-Quba and the Birth of Islamic Community",
    excerpt: "When the Prophet ﷺ arrived in Madinah after the Hijrah, the very first thing he built was a mosque. What did that tell us about the role of the masjid — then and now?",
    category: "islamic_history",
    imagePath: "attached_assets/generated_images/blog_masjid_quba.png",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>When the Prophet Muhammad ﷺ arrived on the outskirts of Madinah after the long and dangerous journey of the Hijrah in 622 CE, he did not first build a home. He did not establish a government, a treasury, or an army. The very first thing he did — before anything else — was build a mosque.</p>

<p>That mosque was <strong>Masjid al-Quba</strong>, built in the village of Quba just south of Madinah. And in that simple act, the Prophet ﷺ told us everything about what a mosque is for.</p>

<h2>What Was Masjid al-Quba?</h2>

<p>It was not grand. The first version had no columns, no dome, and no minaret. The companions carried stones from the surrounding land and laid them by hand. The Prophet ﷺ worked alongside them, carrying rocks and mixing mortar. A simple enclosure with a roof of palm leaves. A space to stand together, to bow together, to prostrate together.</p>

<p>The Quran honoured it specifically:</p>

<blockquote><p><em>"A mosque founded on taqwa (God-consciousness) from the very first day is more worthy that you pray in it."</em><br>— Surah At-Tawbah, 9:108</p></blockquote>

<p>The Prophet ﷺ said that praying two rak'ahs at Masjid al-Quba carries the reward of performing Umrah. He used to visit it himself every Saturday.</p>

<h2>A Mosque Is More Than a Prayer Hall</h2>

<p>In the early Muslim community, the mosque was the centre of everything. It was where people prayed — yes. But it was also where disputes were resolved, where the sick were tended, where travellers rested, where education happened, and where the poor were fed.</p>

<p>The Prophet's ﷺ mosque in Madinah had a covered section called the <em>Suffah</em> — a kind of open dormitory where poor and homeless companions lived, learned, and were looked after by the community. These people became known as <em>Ahl al-Suffah</em> — the People of the Bench — and many of them became great scholars.</p>

<p>The mosque was not separate from society. It <em>was</em> society — its spiritual centre, its community hall, its refuge, its school.</p>

<h2>The Mosque Today</h2>

<p>Fourteen centuries later, mosques around the world continue this legacy. Grays Park Masjid, like Masjid al-Quba, began as a community coming together to establish a place for worship, learning, and care. The programmes — education classes, community events, welfare services — are a continuation of what the Prophet ﷺ established from the first day of his arrival in a new city.</p>

<p>The masjid is not simply a building you visit on Fridays. It is an institution. It is a statement that a community takes its faith and its people seriously.</p>

<h2>Lessons from Masjid al-Quba</h2>

<p>There are three things that stand out from the story of that first mosque:</p>

<p><strong>First: the community built it together.</strong> The Prophet ﷺ did not delegate the work — he participated. No one was too important to carry a stone. This spirit of shared effort is the foundation of any genuine community.</p>

<p><strong>Second: it was built on taqwa.</strong> The Quran's praise for Masjid al-Quba was not about its architecture — it was about the intention behind it. A mosque built for fame or politics earns no such praise. Only sincerity qualifies.</p>

<p><strong>Third: it came first.</strong> Before comfort, before convenience, before personal settlement — the community's spiritual home came first. This is the priority that has guided Muslim communities in every land they have settled, from Al-Andalus to the streets of Grays in Essex.</p>

<p>Every time we walk through the doors of our local masjid, we are walking into a tradition that began in a simple stone enclosure on the edge of Madinah, built by the hands of the Prophet ﷺ himself.</p>

<p>May Allah fill our masajid with taqwa, knowledge, and mercy. Ameen.</p>`,
  },

  {
    slug: "al-andalus-islamic-spain",
    title: "Al-Andalus: When Muslims Led Europe in Science & Culture",
    excerpt: "For nearly eight centuries, the Iberian Peninsula was home to one of the most brilliant civilisations the world had seen. This is the story of Islamic Spain — and what it still means today.",
    category: "islamic_history",
    imagePath: "attached_assets/generated_images/blog_al_andalus.png",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>In 711 CE, a young Berber general named Tariq ibn Ziyad crossed the narrow strait separating Africa from Europe and stepped onto the shores of what is now Spain. Looking back at the sea — the only route of retreat — he made a decision that became legend: he ordered his boats to be burned.</p>

<p>"Where is the retreat?" he said to his army. "The sea is behind you and the enemy is before you. By Allah, there is nothing for you but truth and patience."</p>

<p>From that moment began one of the most remarkable chapters in human history: <strong>Al-Andalus</strong> — Islamic Spain.</p>

<h2>A Civilisation of Light</h2>

<p>At a time when much of Europe was experiencing what historians once called the Dark Ages — when libraries were few, medicine was crude, and cities were small — the cities of Al-Andalus blazed with light. Córdoba, the capital, was the largest city in Western Europe. It had paved streets with street lighting. It had running water, public baths, and hundreds of libraries. The Great Mosque of Córdoba — the <em>Mezquita</em> — with its forest of striped arches, is still standing today, a testament to the beauty of that civilisation.</p>

<p>By the 10th century, the royal library of Caliph Al-Hakam II in Córdoba held an estimated 400,000 books — at a time when the largest libraries in Christian Europe held perhaps a few hundred manuscripts.</p>

<h2>The Scholars Who Changed Everything</h2>

<p>It was in Al-Andalus that many of the ideas we now take for granted were developed, refined, and passed on to the world.</p>

<p><strong>Ibn Rushd</strong> (Averroes, 1126–1198) was a philosopher and physician whose commentaries on Aristotle were so influential that Christian scholars in medieval Europe could not study philosophy without engaging with his work. He is still studied in universities today.</p>

<p><strong>Ibn Tufayl</strong> wrote <em>Hayy ibn Yaqzan</em> — a philosophical novel about a child raised alone on an island who discovers reason and faith independently. It directly influenced later European Enlightenment thinkers.</p>

<p><strong>Al-Zahrawi</strong> (Abulcasis, 936–1013) was a surgeon from Córdoba whose encyclopaedic medical work <em>Al-Tasrif</em> — describing over 200 surgical instruments he designed himself — was the standard medical reference in Europe for five centuries.</p>

<p><strong>Al-Idrisi</strong> created a world map in 1154 that was the most accurate produced anywhere in the world at that time.</p>

<h2>Living Together</h2>

<p>Perhaps as remarkable as the scholarship was the social experiment: Muslims, Christians, and Jews lived alongside one another in a system called <em>convivencia</em> — coexistence. It was not always perfect, and there were tensions and periods of conflict. But at its best, Al-Andalus showed that civilisations built on the exchange of ideas, faith, and culture could produce extraordinary things.</p>

<p>Jewish scholars translated Arabic texts into Latin. Christian scholars studied in Muslim universities. Musicians, poets, architects, and astronomers of different faiths worked side by side.</p>

<h2>What This Means for Us</h2>

<p>The fall of Granada in 1492 — the last Muslim city of Al-Andalus — marked the end of nearly eight centuries of this civilisation. The Spanish Inquisition that followed expelled or forcibly converted Muslims and Jews. Libraries were burned. Mosques became churches.</p>

<p>But the knowledge survived. The texts had already been translated. The mathematics was already embedded in European learning. The medicine was already being practised. Al-Andalus gave Europe — and through Europe, the modern world — algebra, algorithms, surgical instruments, astronomical models, and the preservation of Greek philosophy that would fuel the Renaissance.</p>

<p>For young British Muslims, this history matters. Our tradition is not one of backwardness — it is one of light. At a time when Islam is sometimes misrepresented, knowing this history is both a source of pride and a responsibility: to continue the tradition of knowledge, beauty, and coexistence that Al-Andalus embodied at its finest.</p>`,
  },

  {
    slug: "golden-age-of-islam-scholars",
    title: "The Scholars Who Preserved Knowledge: The Golden Age of Islam",
    excerpt: "Long before modern science, Muslim scholars in Baghdad, Cairo, and beyond were making discoveries in astronomy, medicine, chemistry, and mathematics that shaped the world we live in.",
    category: "islamic_history",
    imagePath: "attached_assets/generated_images/blog_golden_age.png",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>If you have ever used the word "algebra," you are speaking Arabic. If you have ever looked at a star named Aldebaran, Betelgeuse, or Altair, you are reading Arabic. If you have ever been treated with a medicine whose effects were understood through systematic clinical trials, you owe a debt to an Iraqi physician who developed the method over a thousand years ago.</p>

<p>The Golden Age of Islam — roughly 750 to 1258 CE — was one of the most productive periods of intellectual activity in human history. And it matters deeply that Muslims know it.</p>

<h2>The House of Wisdom</h2>

<p>In Baghdad, the Abbasid Caliph Harun al-Rashid and his son Al-Ma'mun established an institution called <strong>Bayt al-Hikmah</strong> — the House of Wisdom. It was more than a library. It was a research institute, a translation bureau, and a gathering place for the greatest minds of the age.</p>

<p>Scholars came from across the known world — Arab, Persian, Greek, Indian, Jewish, and Christian — bringing manuscripts with them. They translated works from Greek, Sanskrit, Syriac, and Persian into Arabic, the international language of scholarship. Then they built upon those works, corrected them, and advanced them.</p>

<p>The translation movement alone is staggering: essentially all of the surviving works of ancient Greek science and philosophy that we know today survived because they were translated into Arabic and preserved during this period, before eventually being translated back into Latin and passed on to European universities.</p>

<h2>The Scholars Themselves</h2>

<p><strong>Al-Khwarizmi</strong> (780–850 CE) wrote a book called <em>Al-Kitab al-mukhtasar fi hisab al-jabr wal-muqabala</em> — "The Compendious Book on Calculation by Completion and Balancing." The word <em>al-jabr</em> became "algebra." His name, Latinised as "Algoritmi," gave us the word "algorithm." Modern computing, GPS, and artificial intelligence all trace their lineage to his work.</p>

<p><strong>Ibn Sina</strong> (Avicenna, 980–1037 CE) wrote the <em>Canon of Medicine</em> — a medical encyclopaedia that remained the primary medical textbook in European universities until the 17th century. He described the nature of contagious disease, the importance of quarantine, and the connection between mind and body at a time when European medicine was still largely based on ancient superstition.</p>

<p><strong>Ibn al-Haytham</strong> (965–1040 CE), working in Egypt, wrote <em>Kitab al-Manazir</em> — the Book of Optics. He was the first to correctly explain how vision works: that eyes receive light rather than emit it. His method of systematic observation and controlled experimentation is considered a foundation of what we now call the scientific method. In 2015, UNESCO named 2015 the International Year of Light in his honour, one thousand years after his book.</p>

<p><strong>Al-Biruni</strong> (973–1048 CE) calculated the radius of the Earth to within 1% accuracy using only a mountain, a geometric formula, and careful measurement — at a time when most of the world had not even agreed the Earth was round.</p>

<h2>Why This Was Possible</h2>

<p>The Golden Age was not accidental. It grew from specific conditions: political stability under the Abbasid caliphate, patronage from rulers who valued knowledge, a religious tradition that actively encouraged learning ("The ink of the scholar is more sacred than the blood of the martyr"), and a cosmopolitan society that welcomed ideas from every culture.</p>

<p>The Prophet ﷺ said: "Seek knowledge, even unto China." This was not a metaphor. It was a command. And the scholars of the Golden Age took it literally — travelling thousands of miles, learning languages, gathering manuscripts.</p>

<h2>What We Inherit</h2>

<p>The Mongol sack of Baghdad in 1258 destroyed much of this civilisation — burning the libraries, killing the scholars, turning the Tigris River dark with ink from thousands of manuscripts. It was a catastrophe from which the Islamic world took centuries to recover.</p>

<p>But the knowledge had already spread. And we — Muslims in Britain today — are inheritors of this tradition. A tradition that says: think carefully, observe the world, build on what came before, and contribute something new. That is not just an intellectual tradition. It is a spiritual one. Every discovery made in service of truth is, in its way, an act of worship.</p>`,
  },

  {
    slug: "hijri-calendar-explained",
    title: "The Hijri Calendar: Why Muslims Count Time Differently",
    excerpt: "Every year, Ramadan falls at a different time. Eid moves. Muharram comes and goes without a fixed date on the wall. This is not disorganisation — it is a deliberate, meaningful way of counting time.",
    category: "islamic_history",
    imagePath: "attached_assets/generated_images/blog_hijri_calendar.png",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>If you have ever tried to explain to a non-Muslim colleague why Ramadan is "earlier this year," or why Eid doesn't always land on the same date, you have encountered one of the more practical differences between Islamic and Western ways of measuring time.</p>

<p>The Islamic calendar — the <strong>Hijri calendar</strong> — is a lunar calendar. It is built around the cycles of the moon, not the sun. And understanding why it works the way it does opens a window into Islamic history, values, and the way Muslims relate to time itself.</p>

<h2>How It Works</h2>

<p>The Gregorian calendar most of the world uses today is a solar calendar — it tracks the Earth's orbit around the sun. Each year is approximately 365.25 days, and the months are tied to fixed positions in that orbit. This is why January is always winter and July is always summer (in the Northern Hemisphere).</p>

<p>The Islamic calendar is different. It is based on the lunar month — the time it takes the moon to complete one orbit of the Earth, which is approximately 29.5 days. Twelve lunar months make one Islamic year, totalling about 354 days — around 11 days shorter than the Gregorian year.</p>

<p>This is why Ramadan moves earlier by roughly 11 days each year. Over a lifetime, it will fall in every season: summer Ramadans with long, hot days of fasting; winter Ramadans with short, cold days that are comparatively easy. Every Muslim, over their life, experiences the full range. No one gets only the comfortable version.</p>

<h2>The Twelve Months</h2>

<p>The Islamic year has twelve months: Muharram, Safar, Rabi al-Awwal, Rabi al-Thani, Jumada al-Ula, Jumada al-Thania, Rajab, Sha'ban, Ramadan, Shawwal, Dhul Qa'dah, and Dhul Hijjah.</p>

<p>Four of these are "sacred months" — Muharram, Rajab, Dhul Qa'dah, and Dhul Hijjah — in which fighting was traditionally prohibited, even in the pre-Islamic Arab world. Allah mentions them in the Quran (9:36).</p>

<p><strong>Muharram</strong>, the first month, contains one of the most significant days in the Islamic calendar: the 10th of Muharram, called <em>Ashura</em>. The Prophet ﷺ fasted this day, explaining that Musa (Moses) ﷺ fasted on it as gratitude to Allah for saving the Children of Israel from Pharaoh.</p>

<p><strong>Dhul Hijjah</strong>, the twelfth month, contains Hajj — the annual pilgrimage — and Eid al-Adha.</p>

<h2>Why the Hijrah?</h2>

<p>Here is the most interesting question: why does the Islamic calendar begin from the Hijrah — the Prophet's ﷺ migration to Madinah in 622 CE — rather than from his birth, or his first revelation?</p>

<p>When Umar ibn Al-Khattab RA became Caliph, the Muslim community needed a consistent dating system for official documents. A committee was convened. Several options were proposed. The year of the Prophet's birth? The year of his first revelation?</p>

<p>Ultimately, the companions chose the Hijrah. And their reasoning is profound: the Hijrah was the moment when a community of believers became, collectively, a functioning society. It was the transition from a persecuted minority into a community capable of building, governing, and living by its values.</p>

<p>The Islamic calendar begins not with a miracle, but with <em>effort</em> — with the sacrifice and courage required to leave everything for the sake of Allah and build something new.</p>

<h2>The Moon as a Sign</h2>

<p>The Quran specifically references the moon as a way of marking time: <em>"They ask you about the new moons. Say: they are time markers for the people and for Hajj."</em> (2:189)</p>

<p>The crescent moon is visible to the naked eye, from anywhere in the world, without instruments or technology. This inclusivity is intentional: the Islamic calendar is a calendar for all people, not just those with access to computation or almanacs. A shepherd in a village with no electricity can look up at the sky and know: Ramadan begins tonight.</p>

<p>This simple, universal marker has connected Muslims across fourteen centuries and every continent on Earth — all looking at the same moon, counting the same months, fasting in the same period, celebrating on the same day.</p>

<p>That shared rhythm is not just practical. It is one of the most beautiful expressions of the <em>ummah</em> — the global Muslim community — as a single, breathing whole.</p>`,
  },

  // ══ STORIES ════════════════════════════════════════════════════════════════

  {
    slug: "uwais-al-qarni-mother-love",
    title: "The Man Who Moved Mountains: The Story of Uwais al-Qarni",
    excerpt: "He never met the Prophet ﷺ in person. Yet the Prophet ﷺ spoke of him as one of the best people on Earth. This is the story of Uwais al-Qarni — and the lesson of a love that puts everything else second.",
    category: "stories",
    imagePath: "attached_assets/generated_images/blog_uwais_qarni.png",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>There is a companion of the Prophet ﷺ who was not quite a companion at all.</p>

<p>He lived during the time of the Prophet ﷺ. He believed in him completely. He followed the message. He longed with every part of his heart to see him.</p>

<p>But he never did. And the reason why tells us something extraordinary about Islam's values — about what truly matters in the sight of Allah.</p>

<h2>Who Was Uwais?</h2>

<p><strong>Uwais ibn Amir al-Qarni</strong> lived in Yemen, in a tribe called Murad. He was a man of deep faith — praying through the nights, fasting through the days, wearing simple clothes, eating little, owning less. His neighbours did not think much of him. He was poor, obscure, and quiet.</p>

<p>But he had an old and frail mother who depended entirely on him. And he had made a decision: he would never leave her alone long enough to travel to Madinah.</p>

<p>Once — just once — he made the journey. He arrived in Madinah. He went to the Prophet's house. The Prophet ﷺ was away. He waited. Then, calculating the time he had, he made the heartbreaking choice: he turned around and went back to his mother. He could not leave her unattended.</p>

<p>He never saw the Prophet ﷺ. Not once.</p>

<h2>What the Prophet ﷺ Said About Him</h2>

<p>And yet — the Prophet ﷺ knew him. He spoke of Uwais to his companions:</p>

<blockquote><p><em>"There will come to you a man from Yemen called Uwais, who will have on him traces of leprosy that he has been cured of, except for a spot the size of a dirham. He has a mother to whom he is very dutiful. If he were to swear by Allah, Allah would fulfil his oath. If you can, ask him to pray for forgiveness for you."</em></p></blockquote>

<p>The Prophet ﷺ then said, directly to Umar ibn Al-Khattab and Ali ibn Abi Talib RA: when Uwais comes from Yemen with the delegation, find him and ask him to make du'a for you.</p>

<p>Think about what this means. The greatest man who ever lived — whose own companions were honoured above all others in Islamic history — was telling those same honoured companions to seek the intercession of a man who had never even met him. A poor, unknown herder from Yemen.</p>

<h2>The Meeting</h2>

<p>Years later, after the Prophet ﷺ had passed, a delegation arrived from Yemen. Umar RA and Ali RA searched among them for Uwais. They found him.</p>

<p>He was thin. Simple. Nothing about him suggested greatness to the eye. They greeted him and asked him to make du'a for them.</p>

<p>He was astonished: "It is I who should ask you to pray for me! You are the companions of the Prophet ﷺ."</p>

<p>"We have been asked to seek your du'a," they insisted.</p>

<p>He prayed for them. And Umar RA — the Caliph, the great leader, the man who had known the Prophet ﷺ intimately — asked Uwais: "Where are you going now?"</p>

<p>"To Kufa," Uwais replied.</p>

<p>"Shall I write to the governor to honour you?"</p>

<p>"No," said Uwais. "I prefer to be among the ordinary people."</p>

<h2>The Lesson</h2>

<p>Uwais al-Qarni is classified in Islamic tradition as one of the <em>Tabi'een</em> — those who came after the companions. And yet the Prophet ﷺ described him as the best of the Tabi'een. The most beloved to Allah among them.</p>

<p>Not because of wealth. Not because of fame or connection to power. Not even because of the number of prayers or fasts — though his worship was extraordinary.</p>

<p>Because of a mother. Because he chose her needs over his own greatest longing. Because his sincerity was total — he served Allah in a way no one could see or reward, in a small house in Yemen, caring for an elderly woman who needed him.</p>

<p>The Prophet ﷺ could not meet him — but Allah showed him to his Prophet's heart.</p>

<p>When you feel unseen in your goodness — when your sacrifices go unnoticed, your efforts unacknowledged — remember Uwais al-Qarni. Allah sees. Allah knows. And what He sees matters more than anything the world can offer.</p>`,
  },

  {
    slug: "bilal-ibn-rabah-first-muadhin",
    title: "Bilal ibn Rabah: From Chains to Calling the Adhan",
    excerpt: "He was enslaved, tortured, and told to deny his faith. His answer was two words: 'Ahad. Ahad.' One. One. This is the story of Bilal ibn Rabah — the first person to call the adhan in Islam.",
    category: "stories",
    imagePath: "attached_assets/generated_images/blog_bilal_adhan.png",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>There is a sound that goes up five times a day in every corner of the Muslim world — from the megacities of Cairo and Istanbul to the smallest village in Indonesia, from towering minarets in Malaysia to modest community halls in Britain.</p>

<p><em>Allahu Akbar. Allahu Akbar.</em></p>

<p>That call — the <em>adhan</em> — was first given by a man who was enslaved. Who was tortured. Who was told that if he simply said the right words, the suffering would stop. He refused. Again and again, he refused.</p>

<p>His name was <strong>Bilal ibn Rabah</strong>.</p>

<h2>Who Was Bilal?</h2>

<p>Bilal was born into slavery in Makkah. His mother, Hamamah, was an Abyssinian (Ethiopian) slave. In the society of Makkah, this meant he was among the most powerless people imaginable — no tribe, no protection, no legal rights.</p>

<p>He was owned by a man named Umayyah ibn Khalaf, one of the fiercest opponents of the Prophet Muhammad ﷺ and his message.</p>

<p>When news reached Umayyah that Bilal had accepted Islam — that this enslaved man in his household had declared "There is no god but Allah, and Muhammad is His messenger" — the reaction was vicious.</p>

<h2>The Torture</h2>

<p>Every day, Umayyah and his men would take Bilal to the open desert in the blazing Makkan heat. They would lay him on the scorching sand and place a great rock on his chest — so heavy he could barely breathe. Then they would demand: renounce Muhammad. Say what we want you to say. Deny your faith.</p>

<p>Bilal's answer, through cracked lips, a parched throat, and a chest that could barely expand:</p>

<p><em>"Ahad. Ahad."</em></p>

<p>One. One. Allah is One.</p>

<p>That was all he would say. Day after day. Stone after stone. <em>Ahad. Ahad.</em></p>

<p>The Prophet ﷺ, seeing him in the street one day, was deeply moved. One of the earliest Muslims — Abu Bakr As-Siddiq RA — went to Umayyah and purchased Bilal's freedom. Umayyah, thinking Abu Bakr must have valued Bilal highly, deliberately named a high price. Abu Bakr paid it without hesitation.</p>

<p>Bilal was free.</p>

<h2>The Adhan</h2>

<p>Years later, after the migration to Madinah, the Muslim community was growing. There was a question: how should the community be called to prayer? Should a bell be rung, as in the churches? Should a horn be blown?</p>

<p>Then a companion named Abdullah ibn Zayd reported a dream: a man in green clothing had taught him words — a beautiful, flowing call that announced the time of prayer and the greatness of Allah.</p>

<p>The Prophet ﷺ confirmed it was a true vision. And then he made a decision that must have astonished some: he chose <strong>Bilal</strong> to be the first person to call the adhan. The freed Ethiopian slave. The man who had been tortured in the dirt of Makkah.</p>

<p>His voice — deep, resonant, carrying — rang out over Madinah for the first time:</p>

<p><em>Allahu Akbar. Allahu Akbar.<br>
Ash-hadu an la ilaha ill-Allah.<br>
Ash-hadu anna Muhammadan Rasulullah.<br>
Hayya 'ala as-salah. Hayya 'ala al-falah.<br>
Allahu Akbar. Allahu Akbar.<br>
La ilaha ill-Allah.</em></p>

<h2>The Conquest of Makkah</h2>

<p>When the Prophet ﷺ conquered Makkah peacefully in 630 CE, he went to the Ka'bah. After clearing it of its idols, he asked Bilal to climb to the top of the Ka'bah itself — the most sacred place in all of Makkah — and call the adhan from there.</p>

<p>In that same city where Bilal had been laid on the burning ground with a rock on his chest. From the roof of the Ka'bah that his torturers had believed they were protecting. <em>Ahad. Ahad.</em></p>

<h2>The Lesson</h2>

<p>Bilal's story teaches us that faith is the great equaliser. In the sight of Allah, no one's lineage, skin colour, or social position determines their worth. Only their sincerity. Only their <em>taqwa</em>.</p>

<p>The Prophet ﷺ chose Bilal to be the voice of Islam — the sound that calls the world to prayer five times a day — because of the strength of his faith and the purity of his heart.</p>

<p>Every time you hear the adhan, you are hearing an echo of <em>Ahad. Ahad.</em> — a sound that was born in suffering and became a gift to all of humanity.</p>`,
  },

  {
    slug: "generous-neighbour-sadaqah-story",
    title: "The Generous Neighbour: A Story of Sadaqah",
    excerpt: "Eight-year-old Yusuf notices something strange happening on his street — every week, someone is leaving food at old Mrs Ahmed's door. He wants to know who it is. What he finds surprises him.",
    category: "stories",
    imagePath: "attached_assets/generated_images/blog_generous_neighbour.png",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>Yusuf was eight years old and very good at noticing things.</p>

<p>He had noticed, for example, that the cat on Milton Street was always sitting in the same window. He had noticed that Mr Patel at the corner shop always gave you an extra sweet if you said "please" twice. And he had noticed something on his own street that no one else seemed to see at all.</p>

<h2>The Mystery</h2>

<p>Every Thursday morning, there was a bag on old Mrs Ahmed's doorstep.</p>

<p>Mrs Ahmed was ninety-one years old and lived alone in the terraced house at the end of the row. Her children lived far away. She walked slowly, with a cane. Sometimes Yusuf saw her standing at the window, watching the street.</p>

<p>The bag was always the same: a brown paper bag with handles. Inside — Yusuf had seen once when the wind blew it over — were things like rice, tinned tomatoes, a jar of honey, sometimes fresh bread. Always halal. Always things Mrs Ahmed could actually eat.</p>

<p>Yusuf asked his mother: "Who leaves the bag?"</p>

<p>His mother didn't know. She asked a few neighbours. Nobody knew.</p>

<p>This bothered Yusuf considerably. Someone was doing something kind and nobody knew who it was. He decided he would find out.</p>

<h2>The Investigation</h2>

<p>The following Wednesday night, Yusuf set his alarm for 5:30 AM. He crept downstairs in his socks, wrapped himself in a blanket, and sat by the front window where he could see Mrs Ahmed's door.</p>

<p>It was cold. It was dark. The streetlights made orange puddles on the wet pavement. Yusuf waited.</p>

<p>At 5:47 AM, a figure appeared. Moving quietly, no rush. A woman, wearing a dark coat and a headscarf. She walked to Mrs Ahmed's door, placed the bag gently on the step, and turned to go.</p>

<p>It was Mrs Miriam. From number 14. The woman who sang to herself while hanging laundry and always waved at the school bus. She had four children of her own. She worked part-time at the library.</p>

<p>She didn't knock. She didn't wait. She just set the bag down and walked away into the dark morning.</p>

<h2>The Conversation</h2>

<p>Yusuf thought about this all day at school. After dinner, he told his mother what he had seen.</p>

<p>His mother was quiet for a moment. "Did Mrs Miriam see you watching?" she asked.</p>

<p>"No."</p>

<p>"Good," said his mother. "Some people don't do things to be seen."</p>

<p>"But why does she not tell anyone? Wouldn't it be nice if people knew how kind she was?"</p>

<p>His mother sat down next to him. "Do you remember what the Prophet ﷺ said about sadaqah given in secret?"</p>

<p>Yusuf thought. They had learned this at madrasah. "He said it extinguishes sins like water extinguishes fire?"</p>

<p>"Yes. And he said: the left hand should not know what the right hand gives. Real sadaqah — the most precious kind — is the kind no one sees. Because when no one sees it, you know you are doing it only for Allah."</p>

<p>Yusuf was quiet, thinking. "So Mrs Miriam gets more reward because nobody knows?"</p>

<p>"That is for Allah to decide. But she is not doing it for the reward of people. That much is clear."</p>

<h2>What Yusuf Did Next</h2>

<p>Yusuf had saved some money — twelve pounds and forty pence — from birthdays and helping with the garden. He had been planning to buy a particular book he wanted.</p>

<p>Instead, the following Wednesday at 5:30 AM, he crept downstairs again. He placed a bag on Mrs Ahmed's doorstep — rice, tinned tomatoes, honey from the shop, and the remaining two pounds and forty pence slipped into an envelope marked "from a neighbour."</p>

<p>He went back to bed before the sun came up.</p>

<p>He never told anyone. Not even his mother.</p>

<p>But somehow — lying in the dark, listening to the birds beginning outside his window — he felt something he hadn't felt in a long time. Light. As if something had been lifted.</p>

<h2>The Hadith</h2>

<blockquote><p><em>"The best of people are those who are most beneficial to people."</em><br>— The Prophet Muhammad ﷺ (Al-Mu'jam Al-Awsat)</p></blockquote>

<p>Sadaqah does not have to be large to change the world. It just has to be real.</p>`,
  },

  {
    slug: "maryam-most-honoured-woman-quran",
    title: "Maryam: The Most Honoured Woman in the Quran",
    excerpt: "In the Quran, there is an entire chapter named after her — Surah Maryam. She is the only woman mentioned by name in the whole of the Quran. This is her story, as Islam tells it.",
    category: "stories",
    imagePath: "attached_assets/generated_images/blog_maryam.png",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>Among all the women of history, the Quran honours one above all others. She has an entire chapter of the Quran named after her. She is the only woman referred to by name anywhere in the Quran's 6,236 verses. And the honour given to her by Islam may surprise those who are unfamiliar with what Muslims actually believe.</p>

<p>Her name is <strong>Maryam</strong> — known in the Christian tradition as Mary, the mother of Jesus.</p>

<h2>Her Dedication Before Birth</h2>

<p>The story of Maryam begins before her birth. Her mother, Hannah (known in Arabic as Imra'at Imran), was a pious woman who had longed for a child. When she became pregnant, she made a vow: she dedicated the child in her womb entirely to Allah's service in the temple.</p>

<p>When the child was born and was a girl — not the boy Hannah had expected and assumed — she was momentarily surprised. But she kept her vow. She named her Maryam and gave her to the service of the temple.</p>

<p>The Quran tells us that Allah accepted Maryam with a beautiful acceptance and caused her to grow in a beautiful way, and placed her in the care of the prophet Zakariyya ﷺ.</p>

<h2>The Miraculous Provision</h2>

<p>Zakariyya ﷺ would come to Maryam's prayer chamber and find, to his astonishment, food that he had not brought and had not been delivered. Fresh fruit — winter fruit in summer, summer fruit in winter.</p>

<blockquote><p><em>"O Maryam, where does this come from?" She said: "It is from Allah. Indeed, Allah provides for whom He wills without account."</em><br>— Surah Al-Imran, 3:37</p></blockquote>

<p>This simple answer — "It is from Allah" — is one of the most profound statements in the Quran. Maryam did not boast. She did not take credit. She simply pointed to the source of all provision.</p>

<h2>The Angel and the Miracle</h2>

<p>When Maryam had grown and withdrawn from her family to a private place, an angel appeared to her in the form of a man. She was immediately afraid. But the angel said:</p>

<blockquote><p><em>"I am only the messenger of your Lord to give you news of a pure son."</em></p></blockquote>

<p>Maryam's response was not joyful acceptance. It was honest bewilderment:</p>

<blockquote><p><em>"How can I have a son when no man has touched me and I am not unchaste?"</em></p></blockquote>

<p>The angel replied:</p>

<blockquote><p><em>"It will be so. Your Lord says it is easy for Me. We will make him a sign for the people and a mercy from Us. It is a matter already decreed."</em></p></blockquote>

<p>And so Maryam — a virgin, honoured above all women, devoted to Allah from before her birth — conceived Isa (Jesus) ﷺ by the command of Allah alone, without a father. This is the Islamic understanding: a miracle, not a divinity. Allah said "Be" — and it was.</p>

<h2>The Pain and the Palm Tree</h2>

<p>What follows in the Quran is one of the most humanly moving passages in any scripture. Maryam went alone into the desert to give birth. She was in tremendous pain. Afraid of what people would say. Vulnerable in a way that no theology can fully cushion.</p>

<blockquote><p><em>"The pains of childbirth drove her to the trunk of a palm tree. She said: 'Would that I had died before this and was in oblivion, forgotten.'"</em></p></blockquote>

<p>Then a voice spoke to her — either the angel, or the infant Isa ﷺ himself, by Allah's miracle:</p>

<blockquote><p><em>"Do not grieve. Your Lord has placed a stream beneath you. Shake toward you the trunk of the palm tree — it will drop fresh, ripe dates upon you. Eat and drink and be consoled."</em><br>— Surah Maryam, 19:24–26</p></blockquote>

<h2>A Bridge Between Faiths</h2>

<p>The story of Maryam in the Quran has a unique capacity to build understanding between Muslims and Christians. Both traditions honour her. Both affirm the virgin birth. Both believe in Isa ﷺ as a prophet of extraordinary significance. The differences are real and meaningful — Muslims do not believe Isa ﷺ is divine — but the common ground of reverence for Maryam is genuine.</p>

<p>When the Prophet ﷺ refused to allow the icons in the Ka'bah to be destroyed during the Conquest of Makkah, he placed his hands protectively over an image of Maryam and her son. A small gesture. A profound one.</p>

<p>She is, the Prophet ﷺ said, one of the greatest women who ever lived. "The best women of Paradise are: Khadijah bint Khuwaylid, Fatimah bint Muhammad, Maryam bint Imran, and Asiyah the wife of Pharaoh."</p>

<p>May Allah have mercy on her and raise her in the highest stations of Jannah. Ameen.</p>`,
  },

  // ══ COMMUNITY ══════════════════════════════════════════════════════════════

  {
    slug: "nikkah-services-grays-park-masjid",
    title: "Nikkah Services at Grays Park Masjid",
    excerpt: "Imam Abdul Rashid offers full Nikkah ceremony services — one-to-one consultations, witnesses arranged, and signed certificates. Serving London, Essex, and surrounding areas.",
    category: "community",
    imagePath: "attached_assets/generated_images/blog_nikkah_services.png",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>Nikkah is one of the most blessed and important events in a Muslim's life. It is a sacred covenant — not just between two people, but witnessed by Allah, recorded by the angels, and celebrated by the community.</p>

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

<h2>The Importance of a Proper Nikkah</h2>

<p>The Prophet Muhammad ﷺ described the Nikkah as completing half of one's faith. He also said: "There is nothing like marriage for two who love each other." A properly conducted Nikkah ensures that the union is Islamically valid, clearly documented, and witnessed according to the Sunnah.</p>

<p>The Nikkah requires:</p>
<ul>
  <li>Offer (<em>Ijab</em>) and acceptance (<em>Qabool</em>) from both parties</li>
  <li>A Wali (guardian) for the bride</li>
  <li>Two Muslim witnesses</li>
  <li>A Mahr (dowry) agreed and stated</li>
</ul>

<p>Imam Abdul Rashid will walk through each of these requirements with your family during the consultation, ensuring nothing is overlooked and everyone understands what is happening and why.</p>

<h2>Serving the Community</h2>

<p>Grays Park Masjid is run by the Thurrock Islamic Education & Cultural Association, and we take our responsibility to the community seriously. Nikkah ceremonies are among the most important moments in community life — and we want to make sure every couple in our community has access to a knowledgeable, caring Imam who can guide them through the process properly.</p>

<p>We serve families from Thurrock, Grays, Tilbury, Basildon, Dagenham, and the wider Essex and East London area.</p>

<h2>Get in Touch</h2>

<p>To enquire about booking a Nikkah ceremony or to arrange an initial consultation with Imam Abdul Rashid, please contact us:</p>

<p><strong>Phone / WhatsApp:</strong> +44 7944 182862</p>

<p>We recommend contacting us as early as possible — ideally at least four to six weeks before your preferred date — to allow adequate time for consultation and preparation.</p>

<p>May Allah bless every couple who comes to us with a marriage full of love, mercy, and barakah. <em>Ameen.</em></p>

<blockquote><p><em>"And of His signs is that He created for you from yourselves mates that you may find tranquillity in them; and He placed between you affection and mercy. Indeed in that are signs for a people who give thought."</em><br>— Surah Ar-Rum, 30:21</p></blockquote>`,
  },

  {
    slug: "hajj-2027-community-support",
    title: "Hajj 2027 — How We Support Our Community Through the Journey of a Lifetime",
    excerpt: "Following a successful Hajj 2026 programme, Grays Park Masjid is receiving enquiries for Hajj 2027. Here is how we can help — whether you are considering the NUSUK route or the Dual National Route.",
    category: "community",
    imagePath: "attached_assets/generated_images/blog_hajj_2027.png",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>Hajj is one of the five pillars of Islam — an obligation upon every Muslim who is physically and financially able to perform it at least once in their lifetime. It is also, for most Muslims who undertake it, one of the most transformative experiences of their lives.</p>

<p>Alhamdulillah, following the success of our Hajj 2026 programme, we have been overwhelmed with enquiries from community members planning for <strong>Hajj 2027</strong>. This post explains how Grays Park Masjid can support you — and what you need to know as you begin planning.</p>

<h2>Our Role</h2>

<p>Grays Park Masjid does not operate as a commercial Hajj travel agent. What we offer is something different and, we believe, more valuable: <strong>free, non-commercial advice, guidance, and community support</strong> for those considering or planning Hajj.</p>

<p>Our team has direct experience of the Hajj journey, knowledge of the current systems and routes, and connections with reputable service providers. We are happy to help you understand your options, navigate the application process, and prepare practically and spiritually — without any commercial interest in your decision.</p>

<h2>The Two Main Routes</h2>

<p>There are currently two main routes to Hajj for British Muslims:</p>

<h3>The NUSUK Route</h3>
<p>The NUSUK platform is the Saudi government's official digital system for independent Hajj applications. It allows individuals and families to apply for Hajj permits directly, then arrange their own accommodation, transport, and Hajj services through the platform. It offers more flexibility but requires more active planning and familiarity with the system.</p>

<h3>The Dual National Route</h3>
<p>This route is available to British Muslims who hold dual nationality with a Muslim-majority country. It allows applications through the Hajj mission of the second country, which often has different quotas and processes. Our team can advise on whether this route is applicable to your situation and how to navigate it.</p>

<h2>Registering Your Interest</h2>

<p>Given the popularity of Hajj 2027 enquiries, we strongly encourage those interested to register as early as possible. Demand for Hajj permits — especially via the NUSUK route — can be high, and early registration allows more time for preparation.</p>

<p>To register your interest and receive personalised guidance, please complete our online form at: <strong><a href="https://tinyurl.com/Arif-ABGHajj27">tinyurl.com/Arif-ABGHajj27</a></strong></p>

<p>Alternatively, speak to us directly at the masjid or contact us via WhatsApp.</p>

<h2>Preparing for Hajj</h2>

<p>Hajj is far more than a logistical exercise. It is the journey of a lifetime, and spiritual preparation is as important as practical planning. At Grays Park Masjid, we run periodic Hajj preparation classes — covering the rites of Hajj, the du'as, the significance of each site, and how to maximise the spiritual benefits of the experience.</p>

<p>If you are planning for 2027, now is an excellent time to:</p>
<ul>
  <li>Begin learning the manasik (rites) of Hajj properly</li>
  <li>Increase your worship — Tahajjud, Quran, dhikr</li>
  <li>Settle any outstanding debts and obligations before going</li>
  <li>Speak to those who have performed Hajj and learn from their experience</li>
  <li>Make sincere du'a that Allah accepts you as His guest</li>
</ul>

<h2>A Word on Intention</h2>

<p>The Prophet ﷺ said: "Whoever performs Hajj for the sake of Allah and does not commit any obscenity or sin will return home as free of sin as the day his mother gave birth to him."</p>

<p>The journey to Hajj begins long before the plane departs. It begins in the heart — with the intention, the preparation, and the du'a that Allah makes us of those who are called to His house.</p>

<p>May Allah accept the Hajj of all who have performed it, and grant the opportunity to those who are planning. Ameen.</p>`,
  },

  {
    slug: "srebrenica-remembrance-standing-against-injustice",
    title: "Srebrenica Remembrance: Standing Together Against Injustice",
    excerpt: "In July 1995, around 8,000 Bosnian Muslim men and boys were killed in Srebrenica — the worst mass murder in Europe since the Holocaust. This is why we remember, and why silence is not an option.",
    category: "community",
    imagePath: "attached_assets/generated_images/blog_srebrenica.png",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>There are events in history that demand remembrance. Not because remembering is comfortable — it is not — but because forgetting is a betrayal. Of the dead. Of the survivors. Of the values we claim to hold.</p>

<p>Srebrenica is one of those events.</p>

<h2>What Happened</h2>

<p>In July 1995, during the Bosnian War, the town of Srebrenica in eastern Bosnia — which had been designated a United Nations "safe area" — fell to Bosnian Serb forces under the command of General Ratko Mladić.</p>

<p>In the days that followed, in a systematic operation that lasted less than two weeks, approximately <strong>8,000 Bosnian Muslim men and boys</strong> were separated from their families and killed. Fathers. Sons. Brothers. Boys as young as twelve. Teenagers. Old men.</p>

<p>It was the single largest mass murder in Europe since the Holocaust of the Second World War. In 2004, the International Criminal Tribunal for the former Yugoslavia ruled that it constituted an act of genocide. Ratko Mladić was eventually convicted of genocide and crimes against humanity in 2017.</p>

<p>The women and children who survived were expelled. Many spent years — some spent decades — not knowing for certain whether their husbands, fathers, and sons were dead or alive. Identification of remains, through DNA matching, continues to this day. Some families have only just received partial remains for burial.</p>

<h2>Why Muslims Remember This</h2>

<p>The Quran commands: <em>"And why should you not fight in the cause of Allah and for those who, being weak, are ill-treated and oppressed?"</em> (4:75)</p>

<p>The Prophet ﷺ said: "Whoever among you sees an evil, let him change it with his hand. If he cannot, then with his tongue. If he cannot, then with his heart — and that is the weakest of faith."</p>

<p>For most of us, our capacity to act is limited. We cannot change the past. We cannot bring back those who were killed. But we can refuse to be silent. We can educate ourselves and our children. We can bear witness. We can stand alongside survivors. We can vote and speak and advocate for the kind of world where such things are not possible.</p>

<p>Remembrance is not passive. It is a choice. It is a stance.</p>

<h2>The Grays Community and the Memorial</h2>

<p>Each year, communities across the United Kingdom mark the Srebrenica Memorial — a day of remembrance held in July, near the anniversary of the killings. In Thurrock, the memorial service has been held at Grays Town Park, bringing together people of all backgrounds to stand in solidarity with the victims, the survivors, and the families who continue to seek answers and recognition.</p>

<p>This kind of event matters beyond the Muslim community. Srebrenica is not only a Muslim story — it is a human story. It happened in a European country less than thirty years ago, within the lifetime of most adults reading this. The international community knew. And for too long, it did not act.</p>

<p>Attending the memorial is a way of saying: we know. We remember. We refuse to look away.</p>

<h2>The Islamic Duty to Speak Out</h2>

<p>The concept of <em>amr bil ma'ruf wa nahy 'anil munkar</em> — commanding good and forbidding evil — is one of the fundamental responsibilities of every Muslim. It extends beyond personal morality to social and political life.</p>

<p>When injustice is committed anywhere — against any people — the Muslim response is not indifference. Our tradition calls us to care, to speak, to act, and to pray.</p>

<p>To the families of Srebrenica: we have not forgotten. To the survivors: we stand with you. To those who were killed: <em>Inna lillahi wa inna ilayhi raji'un.</em> May Allah grant them the highest stations of Jannah. Ameen.</p>

<blockquote><p><em>"And never think of those who have been killed in the cause of Allah as dead. Rather, they are alive with their Lord, receiving provision."</em><br>— Surah Al-Imran, 3:169</p></blockquote>`,
  },

  {
    slug: "guide-for-new-visitors-grays-park-masjid",
    title: "What Happens at Grays Park Masjid: A Warm Guide for New Visitors",
    excerpt: "Whether you are new to Islam, a non-Muslim curious about what happens inside a mosque, or a Muslim who has just moved to the area — this guide is for you. You are very welcome here.",
    category: "community",
    imagePath: "attached_assets/generated_images/blog_new_visitors.png",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>Stepping into a mosque for the first time can feel unfamiliar — even a little daunting. You might wonder about the etiquette. What to wear. What will happen. Whether you will be welcome.</p>

<p>Let us answer those questions clearly, warmly, and honestly. <strong>You are very welcome at Grays Park Masjid</strong> — whoever you are, whatever your background, and whether you are Muslim or not.</p>

<h2>Where We Are</h2>

<p>Grays Park Masjid is located in Grays, Essex, run by the Thurrock Islamic Education & Cultural Association (TIECA). We serve the Muslim community of Thurrock and the surrounding areas, and we are open to visitors, neighbours, and anyone curious about Islam.</p>

<h2>Prayer Times</h2>

<p>The mosque holds five daily congregational prayers (Fajr, Dhuhr, Asr, Maghrib, and Isha) and the Friday Jumu'ah prayer, which is the most attended prayer of the week. Prayer times change throughout the year as daylight varies — you can find the current times on this website or displayed at the masjid.</p>

<p>The Friday Jumu'ah prayer typically has two congregations to accommodate our growing community — please check the current times for the Friday you plan to visit.</p>

<h2>What to Wear</h2>

<p><strong>For men:</strong> Modest, clean clothing. Smart casual is fine. You do not need to dress in any particular Islamic style. Just ensure your clothing is respectful — nothing revealing or inappropriate.</p>

<p><strong>For women:</strong> Modest clothing that covers arms and legs. Bringing a headscarf to cover your hair is appreciated, though you will not be turned away if you do not have one. A loose-fitting top and trousers or a skirt below the knee works well.</p>

<h2>Removing Your Shoes</h2>

<p>Everyone removes their shoes before entering the prayer area. This is a practice with deep symbolic meaning — entering a sacred space with clean feet — and is also simply practical. Shoe racks are provided near the entrance.</p>

<h2>The Prayer Hall</h2>

<p>The main prayer hall is where congregational prayers take place. Men and women pray in separate areas — this is Islamic practice, not a sign of inequality. Both spaces are part of the same community and the same prayer.</p>

<p>If you are visiting as an observer rather than to pray, you are welcome to sit quietly at the back of the hall and watch. You do not need to participate — simply be respectful and quiet.</p>

<h2>Wudu (Ritual Washing)</h2>

<p>Before prayer, Muslims perform <em>wudu</em> — a ritual washing of the hands, face, arms, and feet. There are wudu facilities in the mosque. If you are not praying yourself, you do not need to use them.</p>

<h2>Community Facilities</h2>

<p>Beyond prayer, Grays Park Masjid offers:</p>
<ul>
  <li><strong>Islamic education classes</strong> for children and adults</li>
  <li><strong>Quran learning</strong> for all ages and levels</li>
  <li><strong>Community events</strong> — Eid celebrations, talks, interfaith gatherings</li>
  <li><strong>Welfare support</strong> for those in need in the local area</li>
  <li><strong>Nikkah (Islamic marriage) services</strong></li>
  <li><strong>Funeral and Janazah support</strong></li>
</ul>

<h2>A Note for Non-Muslim Visitors</h2>

<p>You are genuinely welcome. Many mosques across the UK actively invite neighbours, students, and curious visitors to come and see for themselves what Islam is and what Muslims do. We are a community of ordinary people — working families, students, elderly neighbours — who come together five times a day to remember Allah and support one another.</p>

<p>If you have questions — about Islam, about what you observe during your visit, about anything — please feel free to ask. Our community is happy to talk.</p>

<p>The Prophet ﷺ said: "The most complete in faith among the believers is he who is best in conduct, and the best of you are those who are best to their wives." And he ﷺ also said: "A Muslim is one from whose tongue and hand the people are safe."</p>

<p>We hope your visit to Grays Park Masjid leaves you feeling that you encountered a community of warmth, faith, and genuine welcome. Come as you are. You are among neighbours.</p>`,
  },

  // ══ REFLECTIONS ════════════════════════════════════════════════════════════

  {
    slug: "power-of-istighfar",
    title: "The Power of Istighfar: Why Seeking Forgiveness Changes Everything",
    excerpt: "The Prophet ﷺ used to seek forgiveness more than seventy times a day — and he had been forgiven everything. So what does Istighfar do for the rest of us? More than you might think.",
    category: "reflections",
    imagePath: "attached_assets/generated_images/blog_istighfar.png",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>There is a narration that always stops me. The Prophet Muhammad ﷺ — who had been told by Allah that his past and future sins had been forgiven — used to seek forgiveness from Allah more than seventy times a day.</p>

<p>Why? What could he possibly have to seek forgiveness for?</p>

<p>The scholars offer many answers. But perhaps the simplest is this: <em>istighfar</em> — seeking Allah's forgiveness — is not only about sins. It is a state of the heart. It is the acknowledgement that no matter how much we worship, how much we give, how sincerely we try — we always fall short of what Allah deserves. And in that acknowledgement is a kind of humility that opens the doors of mercy.</p>

<h2>What the Quran Says</h2>

<p>The Quran mentions istighfar and its effects in striking, practical terms — not just in terms of the afterlife, but in this world.</p>

<p>The Prophet Nuh ﷺ told his people:</p>

<blockquote><p><em>"Ask forgiveness of your Lord. Indeed, He is ever a Perpetual Forgiver. He will send rain from the sky upon you in continuing showers, and give you increase in wealth and children, and provide you gardens, and provide you rivers."</em><br>— Surah Nuh, 71:10–12</p></blockquote>

<p>Rain. Wealth. Children. Gardens. These are not metaphors — or not only metaphors. The scholars explain that the blessings of istighfar flow into every area of life: sustenance, relationships, health, ease in affairs, clarity of mind and heart. Doors that seemed closed begin to open.</p>

<p>Why? Because sin creates a kind of barrier — between us and Allah's mercy, between us and the blessings He has decreed for us. Istighfar removes that barrier. It is not magic; it is a spiritual law.</p>

<h2>The Hadith That Should Change Everything</h2>

<p>There is a hadith in which the Prophet ﷺ describes Allah descending to the lowest heaven in the last third of the night and calling out:</p>

<blockquote><p><em>"Is there anyone seeking forgiveness, so that I may forgive him? Is there anyone making du'a, so that I may answer him? Is there anyone asking, so that I may give to him?"</em><br>— Bukhari and Muslim</p></blockquote>

<p>Every night. Without exception. Allah Himself is calling — waiting, as it were, for us to come. We just have to show up.</p>

<h2>How to Make Istighfar</h2>

<p>Istighfar does not need to be complicated. The simplest form — <em>Astaghfirullah</em> (I seek Allah's forgiveness) — repeated throughout the day is a complete act of worship. The Prophet ﷺ used to say it in gatherings after rising, after finishing speeches, before and after prayer.</p>

<p>The <em>Sayyid al-Istighfar</em> — the Master of Seeking Forgiveness — is a powerful du'a the Prophet ﷺ called the best: it acknowledges Allah as our Creator and Lord, affirms our covenant with Him, seeks refuge from the evil of what we have done, acknowledges His blessings upon us, confesses our sins, and asks for forgiveness. Saying it sincerely in the morning or evening is among the most recommended daily acts.</p>

<h2>A Practical Invitation</h2>

<p>This week, try something simple: whenever you find yourself waiting — at a red light, in a queue, between meetings — let your lips move in <em>Astaghfirullah</em> rather than scrolling through a phone. Seventy times is the Prophet's ﷺ minimum. It takes about three minutes if you count them.</p>

<p>You may not feel an immediate difference. But the scholars promise — and experience confirms — that over time, the heart that makes istighfar regularly becomes softer, clearer, and more at peace. The world doesn't change. The heart does. And that changes everything.</p>

<blockquote><p><em>"Say: O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins. Indeed, it is He who is the Forgiving, the Merciful."</em><br>— Surah Az-Zumar, 39:53</p></blockquote>`,
  },

  {
    slug: "gratitude-alhamdulillah-hard-times",
    title: "Gratitude in Hard Times: The Wisdom of 'Alhamdulillah ala kulli hal'",
    excerpt: "Thanking Allah when things are good is easy. But the Quran and the Sunnah teach us something far more powerful — and far more difficult: gratitude in every condition.",
    category: "reflections",
    imagePath: "attached_assets/generated_images/blog_gratitude.png",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>There is a phrase in Arabic that contains an entire worldview: <em>Alhamdulillah ala kulli hal</em>. All praise belongs to Allah in every condition.</p>

<p>Not "all praise belongs to Allah when things go well." Not "all praise belongs to Allah when I get what I want." <em>In every condition</em> — in ease and in hardship, in health and in illness, in abundance and in loss.</p>

<p>This is one of the most radical — and most liberating — ideas in Islam.</p>

<h2>The Story of Ayyub ﷺ</h2>

<p>The Quran tells us of the Prophet Ayyub ﷺ — known in the Biblical tradition as Job — who was tested with illness and loss for many years. He lost his health. He lost his wealth. He lost his children. He endured suffering that the Quran describes as severe and prolonged.</p>

<p>And yet his response is one of the most beautiful in all of scripture:</p>

<blockquote><p><em>"Indeed, adversity has touched me, and you are the Most Merciful of the merciful."</em><br>— Surah Al-Anbiya, 21:83</p></blockquote>

<p>Notice what he did not say. He did not say "Why me?" He did not say "This is unfair." He did not lose faith. He simply stated his condition — with honesty, not complaint — and appealed to Allah's mercy.</p>

<p>Allah's response: <em>"So We responded to him and removed what afflicted him of adversity. And We gave him back his family and the like thereof with them as mercy from Us."</em></p>

<h2>The Paradox of Shukr</h2>

<p>The Arabic word for gratitude — <em>shukr</em> — has a root meaning that includes "to recognise and acknowledge." True gratitude is not a feeling. It is an act of recognition: that everything we have comes from Allah, that even our difficulties carry wisdom and mercy we cannot always see.</p>

<p>The Prophet ﷺ expressed this paradox beautifully:</p>

<blockquote><p><em>"How wonderful is the affair of the believer! Everything in his life is good for him — and this applies only to the believer. If something good comes to him, he is grateful, and that is good for him. If something bad comes to him, he is patient, and that is good for him."</em><br>— Muslim</p></blockquote>

<p>The believer cannot lose. Not because life is always pleasant — it is not. But because the believer's response to life has been calibrated to bring benefit regardless of what happens.</p>

<h2>What Gratitude Physically Does</h2>

<p>Modern psychology has increasingly confirmed what the Prophet ﷺ described fourteen centuries ago: gratitude — genuine, practised gratitude — changes us measurably. Studies show it reduces anxiety and depression, improves sleep, strengthens relationships, and increases resilience under stress.</p>

<p>Allah said in the Quran: <em>"If you are grateful, I will surely give you more."</em> (14:7). This promise is both spiritual and, as it turns out, deeply practical.</p>

<h2>Building a Gratitude Practice</h2>

<p>Here are three small, sustainable practices:</p>

<p><strong>1. The morning Alhamdulillah.</strong> The Prophet ﷺ taught a du'a upon waking that includes thanking Allah for returning the soul after sleep. Make it the first thing you say before checking your phone.</p>

<p><strong>2. List three specific things.</strong> Not "family and health" — those are categories. Three specific things: the cup of tea that was just right this morning. The fact that your knees work. A moment when someone was kind to you. Specificity forces real attention.</p>

<p><strong>3. Find the lesson in what is hard.</strong> Not immediately — grief and pain need time. But at some point, ask: what is this teaching me? What am I learning about patience, or reliance on Allah, or what truly matters? The question itself is a form of shukr.</p>

<p>We live in an age of endless comparison, endless complaint, endless wanting. The practice of <em>Alhamdulillah ala kulli hal</em> is a counter-cultural act. It is a quiet declaration that what we have is already enough — and that what we are going through, however difficult, is not the end of the story.</p>

<p>May Allah make us among those who are truly grateful. Ameen.</p>`,
  },

  {
    slug: "five-minutes-before-fajr",
    title: "Five Minutes Before Fajr: The Most Powerful Moment of Your Day",
    excerpt: "Long before the world wakes up, Allah descends to the lowest heaven and calls out: is there anyone seeking forgiveness? Is there anyone making du'a? Most of us sleep through it. What if we didn't?",
    category: "reflections",
    imagePath: "attached_assets/generated_images/blog_fajr.png",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>This is not a guilt trip. There is no shame here for sleeping, for struggling, for the exhaustion of modern life. If the only relationship you have with Fajr right now is the alarm that you silence before going back to sleep — that is okay. Start where you are.</p>

<p>But if you have ever wondered why the scholars and the awliya (the friends of Allah) have always spoken of the pre-dawn hours with such reverence — why Tahajjud, the voluntary night prayer, has such a prominent place in Islamic tradition — this post is an invitation to understand why. And perhaps to try, just once, to stay awake for five minutes before Fajr.</p>

<h2>The Last Third of the Night</h2>

<p>There is a famous hadith — agreed upon by Bukhari and Muslim — that describes something remarkable:</p>

<blockquote><p><em>"Our Lord descends every night to the lowest heaven when one-third of the night remains, and says: 'Who is calling upon Me, that I may answer him? Who is asking of Me, that I may give to him? Who is seeking My forgiveness, that I may forgive him?'"</em></p></blockquote>

<p>Every night. Without exception. Allah — glorified and exalted beyond all human comprehension — calls out to His servants in the stillness before dawn. The question He asks is not rhetorical. He is genuinely waiting for an answer.</p>

<p>Most of us are asleep.</p>

<h2>What the Pre-Dawn Hours Feel Like</h2>

<p>If you have ever been awake between 3 and 5 AM — really awake, not scrolling a phone but actually present — you may have noticed something different about those hours. A quality of stillness that does not exist in daylight. The world is not just quiet; it feels distilled, stripped of the noise of the day.</p>

<p>The Quran describes Tahajjud as <em>ashaddu wat'an wa aqwamu qeela</em> — "more effective for the soul and more upright in speech" (73:6). The scholars explain: at that hour, the mind is not cluttered with the day's concerns. The heart is more honest. Words spoken to Allah at that time carry a weight and clarity they do not always have in the middle of the day.</p>

<p>Even Fajr itself — the dawn prayer — carries a particular quality. The Prophet ﷺ said: "Pray Fajr and you are under Allah's protection for the rest of the day." Two rak'ahs of the Sunnah before Fajr, he ﷺ said, are better than the entire world and everything in it.</p>

<h2>The Practical Reality</h2>

<p>Let's be honest. Waking for Fajr is one of the hardest habits to build. It cuts against the natural rhythms of modern life — late evenings, artificial light, the culture of staying up. For parents of young children, it can feel impossible. For shift workers, it requires real planning. For teenagers, it can feel like a form of torture.</p>

<p>The scholars did not promise it would be easy. What they promised — and what experience confirms — is that those who establish Fajr consistently find the rest of the day changes. Not because of magic, but because starting the day with prayer, with presence, with the remembrance of Allah, sets the tone for everything that follows. The day that begins with Fajr rarely begins with panic or emptiness.</p>

<h2>Just Five Minutes</h2>

<p>If Tahajjud feels out of reach, try something smaller. Set your alarm five minutes before Fajr. Sit up. Make wudu. Sit on the prayer mat before the adhan sounds. Say <em>Astaghfirullah</em> ten times. Say <em>Alhamdulillah</em> ten times. Ask Allah for whatever you need — career, marriage, health, guidance for your children, anything. Ask sincerely. The hadith says He is waiting.</p>

<p>Then pray Fajr.</p>

<p>Five minutes. One day. Then another. Then another.</p>

<blockquote><p><em>"And in the hours before dawn they used to ask forgiveness."</em><br>— Surah Adh-Dhariyat, 51:18</p></blockquote>

<p>This verse, describing the people of Paradise, is in the past tense. It is describing what they used to do — in this world, in ordinary life, before they arrived at the reward. The people of Paradise were not extraordinary in every way. They were people who got up before dawn and asked for forgiveness.</p>

<p>That is a door open to all of us.</p>`,
  },

  {
    slug: "good-muslim-neighbour-britain",
    title: "What Does It Mean to Be a Good Muslim Neighbour in Britain Today?",
    excerpt: "The Prophet ﷺ was asked about the rights of neighbours so many times that he thought Allah might actually make them inheritors. A reflection on community, kindness, and living Islam in Grays.",
    category: "reflections",
    imagePath: "attached_assets/generated_images/blog_neighbour_britain.png",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>The Quran links care for neighbours directly to worship of Allah:</p>

<blockquote><p><em>"Worship Allah and associate nothing with Him, and to parents do good, and to relatives, orphans, the poor, the near neighbour, the farther neighbour, the companion at your side, the traveller, and those your right hand possesses."</em><br>— Surah An-Nisa, 4:36</p></blockquote>

<p>Near neighbour. Farther neighbour. Both explicitly named. The scholars of Islam have defined the near neighbour as the forty houses in every direction from your home. Forty houses. That is most of your street, and then some.</p>

<p>The Prophet ﷺ spoke about neighbours so frequently and so emphatically that, as he said himself: "Jibril (Gabriel) kept advising me to treat neighbours well until I thought he might make them inheritors."</p>

<p>Not just Muslim neighbours. <em>Neighbours.</em></p>

<h2>Living Islam in Grays</h2>

<p>Grays is a genuinely diverse town — one of the most ethnically mixed areas in Essex. On any street, you are likely to have neighbours from several different countries, religions, and backgrounds. This is not a challenge to navigate; it is an opportunity to live the message of Islam in the most direct and practical way possible.</p>

<p>The Prophet ﷺ was not a prophet only to the Muslims of his time. He was sent as a mercy to all of humanity. His dealings with non-Muslims in Madinah were characterised by fairness, honesty, and genuine care. He visited sick non-Muslim neighbours. He attended their funerals. He ensured they were not oppressed or cheated.</p>

<p>Being a good neighbour in Grays does not require a programme or a committee. It requires intention and consistency in small things.</p>

<h2>What Good Neighbourliness Looks Like</h2>

<p><strong>It begins with greeting.</strong> The Prophet ﷺ said: "You will not enter Paradise until you believe, and you will not believe until you love one another. Shall I tell you of something which, if you do it, will make you love one another? Spread salam (peace) among you." Greet your neighbours. Learn their names. This alone transforms a street.</p>

<p><strong>It includes food.</strong> When the Prophet ﷺ spoke to Abu Dharr RA about cooking broth, he said: "Add more water, then look at your neighbours and give them some." Food is one of the most universal languages of care. During Ramadan, iftar food reaching a non-Muslim neighbour's door says more than a thousand words about Islam.</p>

<p><strong>It means not causing harm.</strong> The Prophet ﷺ said: "By Allah, he is not a believer! By Allah, he is not a believer! By Allah, he is not a believer!" When asked who, he said: "The one whose neighbour is not safe from his harm." Noise. Parking. The way we leave shared spaces. These are not minor matters in Islam.</p>

<p><strong>It means noticing absence.</strong> If an elderly neighbour you usually see hasn't appeared for a few days, knock on the door. This is Sunnah — paying attention to those around you, noticing when something might be wrong.</p>

<h2>Identity Without Isolation</h2>

<p>Some Muslims worry that engaging deeply with non-Muslim neighbours risks losing something of their identity or faith. The opposite is generally true. It is from a position of security in your identity that you can engage fully and openly with others. A confident Muslim who knows who they are, what they believe, and why — and who brings that to every relationship — is a walking da'wah.</p>

<p>The masjid is the spiritual centre of the community. But the ummah does not begin and end at the masjid door. It extends into every street, every workplace, every school gate. Every interaction is an opportunity to embody what Islam actually teaches.</p>

<p>The non-Muslim who lives next to a Muslim family and finds them honest, generous, kind, and present — who finds the masjid around the corner to be a place of warmth and service, not suspicion — that person's understanding of Islam is formed not by the media, but by lived experience.</p>

<p>That is the most powerful da'wah there is. And it is available to all of us, right now, on our own streets.</p>`,
  },

];

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  const projectRoot = path.resolve(import.meta.dirname, "../../../");

  console.log("Uploading cover images…");
  const imageUrls: Record<string, string | null> = {};

  for (const post of posts) {
    const imgPath = path.join(projectRoot, post.imagePath);
    if (!fs.existsSync(imgPath)) {
      console.warn(`  WARNING: image not found — ${path.basename(imgPath)}`);
      imageUrls[post.slug] = null;
    } else {
      imageUrls[post.slug] = await uploadImage(imgPath);
      console.log(`  ✓ ${post.slug}: ${imageUrls[post.slug]}`);
    }
  }

  console.log("\nInserting blog posts…");
  for (const post of posts) {
    const words = post.content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    const [row] = await db.insert(blogPostsTable).values({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featureImageUrl: imageUrls[post.slug],
      category: post.category,
      authorName: "Grays Park Masjid",
      published: true,
      publishedAt: new Date(),
    }).returning({ id: blogPostsTable.id, slug: blogPostsTable.slug });
    console.log(`  ✓ [${post.category}] ${row.slug} (${words}w)`);
  }

  // ── Verification ───────────────────────────────────────────────────────────
  console.log("\nVerification by category:");
  for (const cat of ["islamic_history", "stories", "community", "reflections"]) {
    const res = await pool.query(
      `SELECT slug, feature_image_url IS NOT NULL as has_image FROM blog_posts WHERE category = $1 AND published = true`,
      [cat]
    );
    console.log(`  ${cat}: ${res.rows.length} posts (${res.rows.filter((r: { has_image: boolean }) => r.has_image).length} with images)`);
  }

  await pool.end();
  console.log("\nDone!");
}

main().catch((err) => { console.error("Seed failed:", err); process.exit(1); });
