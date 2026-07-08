/**
 * Trims overlong Prophet series posts to the 600-900 word requirement.
 * Updates existing DB records in place.
 */

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq } from "drizzle-orm";
import { blogPostsTable } from "./schema/blog.ts";

const { Pool } = pg;

// ── Trimmed post content (all targeting 800–870 words) ────────────────────────

const POST2_CONTENT = `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>There is a quality the world recognises before it understands its own need for it: <em>trustworthiness</em>. A person who always tells the truth. Who honours every promise. Who would never deceive — not even when they could get away with it.</p>

<p>The city of Makkah knew such a person. They called him <strong>Al-Amin</strong>: The Trustworthy One.</p>

<h2>A Young Man of Character</h2>

<p>Muhammad ﷺ grew up in the household of his uncle Abu Talib, working as a shepherd in the hills around Makkah. It was humble work, but the Prophet later said: "Allah did not send a prophet who was not a shepherd." He was quiet and thoughtful. In a culture where disputes were settled with swords, he looked for fairness.</p>

<p>When a dispute over placing the Black Stone back in the Ka'bah threatened to tear Makkah's leading tribes apart, it was the young Muhammad ﷺ who resolved it. He placed the stone in his cloak and asked each tribe's leader to take a corner. Together they lifted it. He then placed it with his own hands. Every tribe was honoured. The conflict dissolved.</p>

<h2>The Journey to Syria and the Monk Bahirah</h2>

<p>When he was around twelve, his uncle Abu Talib prepared a trade caravan to Syria, and the boy pleaded to come along. Near the city of Busra, the caravan stopped near the cell of a Christian monk named <strong>Bahirah</strong>. This monk rarely acknowledged passing caravans, but on this occasion he invited them all in. He studied each traveller, then asked who had stayed behind with the camels. The young Muhammad ﷺ was brought forward. Bahirah examined him carefully and spoke privately to Abu Talib: "Take your nephew home. Great things await him — but not everyone who learns of him will wish him well."</p>

<h2>Khadijah RA</h2>

<p>As an adult, Muhammad ﷺ became known across Makkah as a man whose word was absolute. A remarkable woman heard of this reputation: <strong>Khadijah bint Khuwaylid</strong>, a wealthy merchant widow — intelligent, dignified, and respected. She employed Muhammad ﷺ to lead her trade caravan to Syria. Her servant Maysarah returned with extraordinary reports: how the young man conducted business fairly, how the entire journey had been uncommonly blessed.</p>

<p>Khadijah proposed marriage. She was fifteen years his senior. He was twenty-five. He accepted. Theirs became one of the great loves in history — twenty-five years of deep loyalty and unwavering support, until Khadijah's last breath. He would speak of her with tenderness long after she was gone.</p>

<h2>The Cave of Hira</h2>

<p>As the years passed, a restlessness grew in him. The society around him troubled him deeply: idols, injustice, the cruelty to the poor. He began retreating to a cave on a mountain outside Makkah called <strong>Jabal an-Nur</strong> — the Mountain of Light. The cave was Hira. He would stay for days at a time, contemplating and searching.</p>

<p>Then came the night that changed everything.</p>

<p>He was forty years old. It was Ramadan. Suddenly he felt himself seized with tremendous force. A voice commanded:</p>

<blockquote><p><em>"Iqra!" — "Read! Recite!"</em></p></blockquote>

<p>"I do not know how to read," he said — and indeed, he had never learned.</p>

<p>Three times the command came. Three times he answered. And then, in the darkness of that cave, the first words of the Quran descended upon his heart:</p>

<blockquote><p><em>"Read! In the name of your Lord who created. Created man from a clinging clot. Read! And your Lord is the Most Generous — who taught by the pen. Taught man what he did not know."</em><br>— Surah Al-Alaq, 96:1–5</p></blockquote>

<h2>The Return Home</h2>

<p>He ran from the cave trembling. He reached Khadijah and asked her to wrap him in his cloak. "I fear for myself," he told her.</p>

<p>Without hesitation, Khadijah spoke words that would echo through time:</p>

<p><em>"Never! By Allah, Allah will never disgrace you. You keep good relations with your relatives, you help the weak, you earn for the poor, you entertain guests, and you help those who have suffered hardship."</em></p>

<p>She took him to her cousin, the Christian scholar <strong>Waraqah ibn Nawfal</strong>, who listened carefully and said: "This is the same angel who came to Moses. You are the prophet of this nation."</p>

<h2>What This Teaches Us</h2>

<p>Before a single verse of Quran was revealed, Muhammad ﷺ had already lived a lifetime of honesty. His character came first — prophethood came in confirmation of it.</p>

<p>And when the most momentous night of his life arrived, it was his wife — a woman — who first believed him, comforted him, and ran with him to find answers.</p>

<p>In our next post, we'll see what happened when he took this message to his city — and how Makkah responded.</p>`;

const POST3_CONTENT = `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>When you know the truth — genuinely, deeply — there comes a moment when you must decide what to do with it. You could keep it quiet. Protect yourself. Or you could speak.</p>

<p>The Prophet Muhammad ﷺ spoke. And Makkah was not pleased.</p>

<h2>The First Believers</h2>

<p>For the first three years, Islam was shared quietly, person to person. The first to believe was his wife <strong>Khadijah RA</strong>. The first child was his cousin <strong>Ali RA</strong>. The first free man outside the family was <strong>Abu Bakr As-Siddiq RA</strong>, whose response was immediate and wholehearted.</p>

<p>Among the earliest was a man who became one of Islam's greatest symbols: <strong>Bilal ibn Rabah RA</strong>, an enslaved Abyssinian man. When his master discovered he had become Muslim, the torture began — laid on scorching sand in the Makkan heat, heavy stones on his chest, ordered to denounce Muhammad ﷺ. Through cracked lips and a crushing weight, Bilal's answer was a single word, repeated again and again:</p>

<p><em>"Ahad. Ahad." — "One. One."</em></p>

<p>Abu Bakr RA purchased Bilal's freedom. Bilal later became the first person in history to call the adhan — the Islamic call to prayer — his deep voice carrying across Madinah.</p>

<h2>Going Public</h2>

<p>After three years, the command came to proclaim the message openly. The Prophet ﷺ gathered the people of Makkah at the hill of As-Safa: "If I told you there was an army behind this hill — would you believe me?"</p>

<p>"Yes. You have never lied."</p>

<p>"Then I warn you of a punishment greater than any army."</p>

<p>His uncle Abu Lahab stood up in fury: "May you perish! Is this why you called us here?"</p>

<p>And with that, the public opposition began.</p>

<h2>Persecution</h2>

<p>The Quraysh used every weapon they had. They mocked the Prophet ﷺ publicly — calling him a madman, a poet, a liar. They persecuted his followers mercilessly, especially those without tribal protection. Some fled to the Christian kingdom of Abyssinia, where the just king Negus gave them refuge and refused to return them to their persecutors.</p>

<p>For three years, the entire Banu Hashim clan — Muslim and non-Muslim alike — was subjected to a total economic and social boycott. Confined to a valley outside Makkah. No one could trade with them, marry from them, or speak with them. Children cried from hunger. People ate leaves from trees. The parchment of the boycott agreement was later found eaten by insects — except the portions mentioning Allah's name.</p>

<h2>The Year of Sorrow</h2>

<p>Then, in a single devastating year, the Prophet ﷺ lost his two greatest protectors.</p>

<p>First, his beloved wife <strong>Khadijah RA</strong> — after twenty-five years of marriage, his greatest supporter and the mother of his children — passed away. Then his uncle <strong>Abu Talib</strong> died, the man who had shielded him since childhood. Without him, the Prophet ﷺ had no political protection. He went to the city of Ta'if seeking a new audience for his message. He was driven out. Children threw stones at his legs until he bled.</p>

<p>He sat wounded and alone outside the city, and prayed:</p>

<blockquote><p><em>"O Allah, to You alone I complain of my weakness. O most Merciful — You are the Lord of the weak, and You are my Lord. To whom would You leave me?"</em></p></blockquote>

<h2>The Night Journey: Isra wal-Miraj</h2>

<p>In the depths of this grief, Allah gave the Prophet ﷺ a gift beyond imagination. One night he was taken on a miraculous journey — first from Makkah to Jerusalem (<em>Isra</em>), where he led all the previous prophets in prayer at Al-Aqsa. Then upward through the heavens (<em>Miraj</em>), until he reached a station no creation had reached before.</p>

<p>It was there that the five daily prayers were given as a gift to the Muslim nation — described not as a burden, but as a meeting between a servant and their Lord, five times every day.</p>

<h2>What This Teaches Us</h2>

<p>The scholars often reflect on one remarkable fact: the Night Journey happened immediately after the Year of Sorrow. When everything was taken from him humanly, Allah gave him something divine.</p>

<p>This is the pattern of <em>sabr</em> — patience. Not resignation, but an active trust that Allah does not forget those who hold on.</p>

<p>In our next post, we follow the Prophet ﷺ on the journey that would transform history: the Hijrah to Madinah.</p>`;

const POST4_CONTENT = `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>Sometimes, the most faithful thing you can do is leave.</p>

<p>Not in defeat. Not in despair. But in trust — that where you are going has been prepared for you, even if you cannot yet see it.</p>

<p>In 622 CE, the Prophet Muhammad ﷺ and his companions made the journey that Muslims mark the beginning of the Islamic calendar by: the <strong>Hijrah</strong> — the migration to Madinah. Umar ibn Al-Khattab RA later chose it as the start of Islamic history. Not the birth of the Prophet. Not his first revelation. The Hijrah — because it marked the moment when a community of believers truly became a community.</p>

<h2>The Plot and the Escape</h2>

<p>The leaders of Makkah had agreed: Muhammad ﷺ must be killed. Representatives from each clan would strike him together, sharing the blood guilt so no tribe could be held responsible.</p>

<p>The Prophet ﷺ was warned and told to leave that very night. He asked his young cousin <strong>Ali RA</strong> to sleep in his bed as a decoy — which Ali accepted without hesitation. When the assassins struck at dawn, they found Ali. Muhammad ﷺ was already gone.</p>

<p>With his closest companion <strong>Abu Bakr RA</strong>, the Prophet ﷺ hid in a cave called <strong>Thawr</strong>, south of Makkah, for three nights while search parties scoured the hills. The Quraysh placed a bounty of one hundred camels on him. At one point, the searchers came right to the cave mouth. Abu Bakr whispered in fear — not for himself, but for the Prophet. The Prophet placed his hand on his companion's shoulder and said words Allah would later make eternal:</p>

<blockquote><p><em>"Do not grieve — Allah is with us."</em><br>— Surah At-Tawbah, 9:40</p></blockquote>

<p>A spider had spun its web across the entrance. A dove had nested there. The search party, seeing the undisturbed web, moved on.</p>

<h2>The Welcome of Madinah</h2>

<p>The journey north — nearly 400 kilometres — took around two weeks. When the Prophet ﷺ finally arrived at the outskirts of Madinah, the entire city came out to meet him. Children climbed rooftops. Women and girls sang from doorways:</p>

<blockquote><p><em>"The full moon has risen over us — from the valley of Wada'."</em></p></blockquote>

<p>Every household wanted him to stay. He said: "Let the camel go. Wherever she stops, that is where I will stay." The camel knelt near the home of <strong>Abu Ayyub al-Ansari RA</strong>, a man of modest means who wept with gratitude and hosted the Prophet while a mosque was built.</p>

<h2>Building the Community</h2>

<p>The first act in Madinah was to build <strong>Masjid an-Nabawi</strong> — the Prophet's Mosque. He worked alongside his companions, carrying bricks and mixing mud. No leader stood aside while others laboured.</p>

<p>Madinah was diverse: Muslims from Makkah (<em>Muhajirin</em>, the migrants), Muslims of Madinah (<em>Ansar</em>, the helpers), Jewish tribes, and Arab clans of various allegiances. The Prophet ﷺ drafted the <strong>Constitution of Madinah</strong> — one of the world's earliest written social contracts. It declared all communities as one nation, each retaining their own religion and internal affairs, bound together to defend Madinah and uphold justice for all — without tribal favour.</p>

<p>Seven centuries before the Magna Carta. Fourteen centuries before the United Nations.</p>

<h2>The Brotherhood</h2>

<p>Many migrants had arrived with nothing — they had left homes, businesses, and belongings behind in Makkah. The Prophet ﷺ established a bond of brotherhood between each migrant and a host from Madinah. Sa'd ibn Ar-Rabi' RA of the Ansar said to his new brother Abd Al-Rahman ibn Awf RA: "I am the wealthiest man among the Ansar. Take half my wealth."</p>

<p>Abd Al-Rahman refused, preferring to start fresh through his own trade. But the offer — made sincerely — captures everything about the spirit of Madinah: <em>you are not alone. We have enough. We share.</em></p>

<h2>What This Teaches Us</h2>

<p>The Hijrah teaches us that a new beginning is possible. That leaving a place of harm for a place of growth is not weakness — it is wisdom. That community is built through sacrifice, not mere proximity. And that a diverse society can be governed with fairness when justice, not tribalism, is the foundation.</p>

<p>In our final post, we'll witness the Prophet's ﷺ greatest act of mercy and his peaceful farewell to the world he transformed.</p>`;

const POST5_CONTENT = `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>How does a man who was driven from his city return to it?</p>

<p>If you had been mocked, tortured, bereaved, exiled, and hunted — what would you do when you finally had the power to answer all of that?</p>

<p>The answer the Prophet Muhammad ﷺ gave is one of the most extraordinary moments in human history.</p>

<h2>The Conquest of Makkah (630 CE)</h2>

<p>Eight years after the Hijrah, the Prophet ﷺ marched toward Makkah with an army of ten thousand. The city that had persecuted, exiled, and plotted against him stood before him. He entered quietly, head bowed in humility, lips moving in gratitude to Allah. He went directly to the Ka'bah, circled it, and cleared it of its idols.</p>

<p>Then he turned to the people of Makkah who had gathered, uncertain of their fate:</p>

<p><em>"O people of Quraysh, what do you think I am going to do with you?"</em></p>

<p>Silence.</p>

<p><em>"Go. You are free."</em></p>

<p>The people who had tortured Bilal RA. Who had buried his companions' loved ones. Who had hunted him across the desert. Freed. Without condition. Without revenge. This moment of general amnesty is still cited by historians as one of history's most remarkable acts of mercy.</p>

<h2>The Farewell Pilgrimage (632 CE)</h2>

<p>Two years later, the Prophet ﷺ performed his only Hajj as leader of the Muslim community — and what he seemed to know would be his last. He set out from Madinah with over ninety thousand companions. At the plains of <strong>Arafah</strong>, he mounted his camel and delivered the <strong>Farewell Sermon</strong>, his words carried to the edges of the vast crowd by companions repeating them section by section.</p>

<h2>The Farewell Sermon</h2>

<blockquote>
<p><em>"O People — your Lord is One, and your father is one. An Arab has no superiority over a non-Arab, nor a non-Arab over an Arab. A white person has no superiority over a black person — except by taqwa (righteousness)."</em></p>
</blockquote>

<blockquote>
<p><em>"Your lives, your property, and your honour are sacred to one another — as sacred as this day, in this month, in this city."</em></p>
</blockquote>

<blockquote>
<p><em>"I leave behind two things: the Quran and my Sunnah. If you hold to them, you will never go astray."</em></p>
</blockquote>

<p>Then he asked the crowd: <em>"Have I conveyed the message?"</em></p>

<p>A roar across the plains: <em>"Yes!"</em></p>

<p>"O Allah, be my witness." Shortly after, these words descended:</p>

<blockquote><p><em>"This day I have perfected your religion for you, completed My favour upon you, and have chosen for you Islam as your religion."</em><br>— Surah Al-Ma'idah, 5:3</p></blockquote>

<p>When Abu Bakr RA heard this verse, he wept. He understood what others had not yet grasped: when a task is complete, the one who set out to do it returns home.</p>

<h2>His Final Days</h2>

<p>The Prophet ﷺ returned to Madinah and fell ill. Despite his weakness, he asked to be carried to the mosque to pray with his community. When he could no longer lead, he asked Abu Bakr to lead in his place. He distributed whatever he had, freed his servants, and asked: "Is there anyone I owe a debt to? Come forward now." He was meticulous about leaving no obligation unfulfilled.</p>

<p>On the 12th of Rabi al-Awwal, 632 CE, in the arms of his wife Aisha RA, the Prophet Muhammad ﷺ passed away. He was sixty-three years old.</p>

<p>It was Abu Bakr RA who walked into the mosque and spoke the words that echo through every century since:</p>

<blockquote><p><em>"Whoever worshipped Muhammad, know that Muhammad has died. Whoever worships Allah — know that Allah is Ever-Living and never dies."</em></p></blockquote>

<h2>The Eternal Legacy</h2>

<p>What did he leave behind?</p>

<p>The <strong>Quran</strong> — memorised by thousands of companions, written down, preserved letter-perfect for over fourteen centuries. No other text in human history has been preserved with such precision.</p>

<p>The <strong>Sunnah</strong> — his sayings and actions, carefully collected and verified. A complete way of life: how to pray, how to treat a spouse, how to handle grief, how to conduct business, how to die with dignity.</p>

<p>And something harder to measure: <em>a way of being human</em>. Honest. Merciful. Just. Patient. Grateful. A way that begins with a desert orphan carrying rocks, and ends with a man who forgave everything and left the world better than he found it.</p>

<blockquote><p><em>"And We have not sent you, [O Muhammad], except as a mercy to the worlds."</em><br>— Surah Al-Anbiya, 21:107</p></blockquote>

<p>May Allah's peace and blessings be upon him — forever.</p>`;

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  const updates = [
    { slug: "prophet-youth-first-revelation", content: POST2_CONTENT },
    { slug: "prophet-makkah-persecution", content: POST3_CONTENT },
    { slug: "prophet-hijrah-madinah", content: POST4_CONTENT },
    { slug: "prophet-farewell-sermon-legacy", content: POST5_CONTENT },
  ];

  for (const { slug, content } of updates) {
    const [row] = await db
      .update(blogPostsTable)
      .set({ content, updatedAt: new Date() })
      .where(eq(blogPostsTable.slug, slug))
      .returning({ id: blogPostsTable.id, slug: blogPostsTable.slug });

    if (!row) {
      console.error(`  ✗ Not found: ${slug}`);
    } else {
      // Rough word count
      const words = content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
      console.log(`  ✓ ${slug} (${words} words)`);
    }
  }

  // ── Verification: confirm all 5 posts exist, published, with images ─────────
  console.log("\nVerification — all prophet posts:");
  const rows = await db
    .select({
      slug: blogPostsTable.slug,
      published: blogPostsTable.published,
      hasImage: blogPostsTable.featureImageUrl,
    })
    .from(blogPostsTable)
    .where(eq(blogPostsTable.category, "prophet"));

  for (const r of rows) {
    const imageStatus = r.hasImage ? "✓ image" : "✗ no image";
    const pubStatus = r.published ? "published" : "DRAFT";
    console.log(`  [${pubStatus}] [${imageStatus}] ${r.slug}`);
  }

  console.log(`\nTotal prophet posts: ${rows.length}/5`);

  await pool.end();
}

main().catch((err) => {
  console.error("Update failed:", err);
  process.exit(1);
});
