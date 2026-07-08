/**
 * Seed script: Prophet Muhammad ﷺ life blog series (5 posts).
 * Run with: /path/to/tsx lib/db/src/seed-prophet-blog.ts
 */

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { blogPostsTable } from "./schema/blog.ts";

const { Pool } = pg;

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
const IS_REPLIT = Boolean(process.env.REPL_ID || process.env.REPLIT_DEV_DOMAIN);

function parseObjectPath(p: string) {
  if (!p.startsWith("/")) p = `/${p}`;
  const parts = p.split("/");
  return { bucketName: parts[1], objectName: parts.slice(2).join("/") };
}

async function signPutUrl(bucketName: string, objectName: string): Promise<string> {
  const res = await fetch(`${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket_name: bucketName,
      object_name: objectName,
      method: "PUT",
      expires_at: new Date(Date.now() + 900_000).toISOString(),
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Sidecar sign error ${res.status}: ${await res.text()}`);
  const { signed_url } = (await res.json()) as { signed_url: string };
  return signed_url;
}

async function uploadImage(localFilePath: string): Promise<string> {
  if (!IS_REPLIT) {
    throw new Error(
      "This seed script requires the Replit environment (GCS sidecar) to upload cover images. " +
      "Run it from within the Replit workspace, not from a Coolify container or local machine.",
    );
  }
  const privateObjectDir = process.env.PRIVATE_OBJECT_DIR;
  if (!privateObjectDir) throw new Error("PRIVATE_OBJECT_DIR not set");

  const objectId = randomUUID();
  const fullPath = `${privateObjectDir}/uploads/${objectId}`;
  const { bucketName, objectName } = parseObjectPath(fullPath);

  const imageBytes = fs.readFileSync(localFilePath);
  const signedUrl = await signPutUrl(bucketName, objectName);

  const putRes = await fetch(signedUrl, {
    method: "PUT",
    body: imageBytes,
    headers: { "Content-Type": "image/png" },
    signal: AbortSignal.timeout(60_000),
  });
  if (!putRes.ok) throw new Error(`GCS upload error ${putRes.status}`);

  return `/api/storage/objects/uploads/${objectId}`;
}

// ── Blog content ──────────────────────────────────────────────────────────────

const posts = [
  {
    slug: "prophet-birth-early-childhood",
    title: "The Light Before the Dawn: The Birth & Early Childhood of the Prophet ﷺ",
    excerpt:
      "In the Year of the Elephant, 570 CE, a child was born in Makkah who would change the world forever. This is the story of his earliest years — from the desert sands of Banu Sa'd to the grief of losing his mother.",
    imagePath: "attached_assets/generated_images/prophet_birth_makkah.png",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>Long before the sun rises, the sky begins to lighten. A quiet glow spreads across the horizon — not yet the blazing sun, but the promise of it. That is how we might think of the Prophet Muhammad ﷺ: a light that was always coming, always promised, long before the world was ready to receive it.</p>

<h2>The Year of the Elephant (570 CE)</h2>

<p>He was born in the city of Makkah, in what is now Saudi Arabia, in a year so remarkable that the Arabs remembered it by a single event: the Year of the Elephant. That year, a powerful army marched on the Ka'bah — the sacred house of Allah — led by the Abyssinian general Abraha, mounted on a great war elephant. But before they could reach it, Allah sent flocks of birds raining down small stones, destroying the army entirely. The Ka'bah was saved. A few weeks later, a child was born into the noble Quraysh tribe, the clan of Banu Hashim.</p>

<p>His father was <strong>Abdullah ibn Abd al-Muttalib</strong>, a beloved young man of Makkah who had passed away before his son was even born, leaving behind only a few camels and a young wife. His mother was <strong>Aminah bint Wahb</strong>, a woman of noble character, who later recalled seeing a great light at his birth that illuminated the palaces of distant Syria.</p>

<p>He was named <strong>Muhammad</strong> — a name meaning "the praised one" — chosen by his grandfather Abd al-Muttalib, who declared it a name for both this world and the heavens.</p>

<h2>With Halimah in the Desert</h2>

<p>In the custom of the noble Arab families of that time, infant boys were sent to live with Bedouin families in the desert. The fresh air, the open space, and the pure Arabic of the tribes were seen as gifts for a growing child. A woman named <strong>Halimah al-Sa'diyyah</strong>, from the tribe of Banu Sa'd, came to Makkah looking for a child to nurse.</p>

<p>Halimah later recalled that her year had been hard. Her tribe's land was dry. Her own infant was hungry. Her milk was barely enough. But when she held the baby Muhammad ﷺ, something changed. Suddenly her milk flowed freely. The animals that had been frail grew strong. The land around her home became green. Halimah and her husband both knew: this was a blessed child.</p>

<p>He grew up running in the golden desert, playing with Halimah's children, learning the purest Arabic, breathing the clean open air. Years passed happily, until Halimah brought him home to his mother Aminah in Makkah.</p>

<h2>The Opening of the Chest</h2>

<p>While still living with Halimah, something extraordinary happened. Islamic tradition records that two figures appeared near the young Muhammad ﷺ, gently laid him down, opened his chest, removed something dark from his heart, washed it with snow-white substance, then placed it back and departed. He was unharmed. The scholars understand this as the removal of any trace of worldly weakness from his heart — a preparation for the great mission ahead.</p>

<p>When Halimah heard what had happened, she was frightened and returned him early to his mother Aminah.</p>

<h2>Loss Upon Loss</h2>

<p>When Muhammad ﷺ was six years old, his mother Aminah took him to Madinah (then called Yathrib) to visit the grave of his father Abdullah. On their journey home, Aminah fell gravely ill and passed away near a place called Al-Abwa. A little boy, six years old, stood by his mother's grave in the desert.</p>

<p>Their faithful servant Umm Ayman brought him back to Makkah, where his grandfather <strong>Abd al-Muttalib</strong> — the elder statesman of the Quraysh — took him in with great love. He would carry the child with him everywhere, giving him a seat of honour next to himself. But this comfort too did not last long. When Muhammad ﷺ was eight years old, his beloved grandfather died.</p>

<p>He was now in the care of his uncle, <strong>Abu Talib</strong>. More loss would come. And yet, looking back on this childhood of orphanhood and grief, we see something the Quran would later confirm:</p>

<blockquote><p><em>"Did He not find you an orphan and shelter you? Did He not find you lost and guide you? Did He not find you in need and make you self-sufficient?"</em><br>— Surah Ad-Duha, 93:6-8</p></blockquote>

<p>Every loss was a preparation. Every hardship was building something in him that the comfortable never develop: patience, gratitude, reliance on Allah alone.</p>

<h2>What This Teaches Us</h2>

<p>The Prophet ﷺ was not born into a life of ease and protection. He was born into vulnerability — an orphan before birth, motherless at six, grandfatherless at eight. And yet he became the most beloved person who ever lived.</p>

<p>This tells us something important: <em>Allah does not always protect us from difficulty. He prepares us through it.</em></p>

<p>In our next post, we'll follow the young Muhammad ﷺ as he grows into a young man — honest, thoughtful, and already beginning to stand apart from those around him.</p>`,
  },
  {
    slug: "prophet-youth-first-revelation",
    title: "The Trustworthy One: Youth, Trade & the First Revelation",
    excerpt:
      "He became known as Al-Amin — The Trustworthy — years before prophethood. Then one night in a cave on a mountain called Hira, everything changed.",
    imagePath: "attached_assets/generated_images/prophet_cave_hira.png",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>There is a quality the world recognises before it even understands its own need for it: <em>trustworthiness</em>. A person who always tells the truth. A person who honours every promise. A person who would never steal, cheat, or deceive — not even when they could get away with it.</p>

<p>The city of Makkah knew such a person. They called him <strong>Al-Amin</strong>: The Trustworthy One.</p>

<h2>A Young Man of Character</h2>

<p>Muhammad ﷺ grew up in the household of his uncle Abu Talib, a respected man of the Quraysh who had many responsibilities and modest means. From a young age, Muhammad ﷺ worked as a shepherd — tending flocks in the hills around Makkah. It was humble work, but later he would say: "Allah did not send a prophet who was not a shepherd."</p>

<p>He was quiet and thoughtful. In a city where men boasted, he was modest. In a culture where disputes were settled with swords, he looked for fairness. Even as a teenager, when a great conflict over the Black Stone of the Ka'bah threatened to tear the leading tribes of Makkah apart — each wanting the honour of placing it back in its position — it was the young Muhammad ﷺ who offered the elegant solution: he placed the stone in his cloak, and asked each tribe's leader to take a corner. Together, they all lifted it. He then placed it with his own blessed hands. Every tribe was honoured. The conflict dissolved.</p>

<h2>The Journey to Syria and the Monk Bahirah</h2>

<p>When Muhammad ﷺ was around twelve years old, his uncle Abu Talib prepared for a trade caravan to Syria. The boy pleaded to come along, and Abu Talib — unable to refuse his nephew — agreed. It was his first journey beyond Makkah.</p>

<p>Near the city of Busra in Syria, the caravan stopped near the cell of a Christian monk named <strong>Bahirah</strong>. This monk rarely acknowledged passing caravans, but on this occasion he invited them all to share his food. He studied each traveller carefully. Finally he asked: who had stayed behind with the belongings? The young boy who had stayed with the camels was brought forward. Bahirah examined him: the eyes, the back between the shoulders, the bearing. He spoke privately with Abu Talib: "Take your nephew home. Great things await him — but not everyone who learns of him will wish him well."</p>

<h2>A Merchant of Honour</h2>

<p>As he reached adulthood, Muhammad ﷺ became known across Makkah as a man whose word was absolute. Merchants trusted him with their goods. His reputation was without stain.</p>

<p>A remarkable woman heard of this reputation. <strong>Khadijah bint Khuwaylid</strong> was a wealthy merchant widow — intelligent, dignified, respected. She employed Muhammad ﷺ to lead her trade caravan to Syria. Her servant Maysarah accompanied him and returned with wondrous reports: how the young man conducted business fairly, how he treated everyone with respect, how the whole journey had been unusually blessed.</p>

<p>Khadijah proposed marriage. She was fifteen years his senior. He was twenty-five. He accepted. Theirs became one of the great loves in human history — a marriage of deep respect, trust, and unwavering support. Together they had children: sons who did not survive infancy, and daughters among them the beloved Fatimah RA. For twenty-five years, until Khadijah's last breath, Muhammad ﷺ took no other wife. He would speak of her with love long after she was gone.</p>

<h2>The Cave of Hira</h2>

<p>As the years passed, a restlessness grew in Muhammad ﷺ. The society around him troubled him deeply: the worship of idols, the burying of infant daughters alive, the cruelty to the poor and enslaved. He found no peace in it.</p>

<p>He began retreating to a cave on a mountain called <strong>Jabal an-Nur</strong> — the Mountain of Light — just outside Makkah. The cave was called <strong>Hira</strong>. He would stay there for days at a time, contemplating, praying in his own way, searching.</p>

<p>Then came the night that changed everything.</p>

<p>He was forty years old. It was Ramadan — a month already regarded as special for contemplation. Suddenly he felt himself being held and squeezed with tremendous force. A voice commanded:</p>

<blockquote><p><em>"Iqra!" — "Read! Recite!"</em></p></blockquote>

<p>"I do not know how to read," he said — and indeed, he had never learned to read or write.</p>

<p>Three times the command came. Three times he answered. And then, in the darkness of that cave, the first words of the Quran descended upon his heart:</p>

<blockquote><p><em>"Read! In the name of your Lord who created. Created man from a clinging clot. Read! And your Lord is the Most Generous — who taught by the pen. Taught man what he did not know."</em><br>— Surah Al-Alaq, 96:1–5</p></blockquote>

<h2>The Return Home</h2>

<p>He ran from the cave, shaking with awe and fear. He reached his wife Khadijah and asked her to wrap him in his cloak. He was trembling. "I fear for myself," he told her.</p>

<p>Without hesitation, Khadijah uttered words that would echo through history:</p>

<p><em>"Never! By Allah, Allah will never disgrace you. You keep good relations with your relatives, you help the weak, you earn for the poor, you entertain guests, and you help those who have suffered hardship."</em></p>

<p>Then she took him to her cousin, the Christian scholar <strong>Waraqah ibn Nawfal</strong>. He listened carefully. "This is the same angel who came to Moses," he said. "You are the prophet of this nation."</p>

<h2>What This Teaches Us</h2>

<p>Before a single verse of Quran was revealed, Muhammad ﷺ had already lived a lifetime of honesty. His character came first — his prophethood came in confirmation of it.</p>

<p>And when the world-changing moment of his life arrived, it was his wife — a woman — who first believed him, first comforted him, first ran with him to find answers.</p>

<p>In our next post, we'll see what happened when he took this message to his city — and how Makkah responded.</p>`,
  },
  {
    slug: "prophet-makkah-persecution",
    title: "Patience Under Fire: The Makkan Years & the Test of Persecution",
    excerpt:
      "When the Prophet ﷺ began calling people to Islam publicly, Makkah pushed back — with ridicule, torture, and exile. This is the story of those who held firm when holding firm cost everything.",
    imagePath: "attached_assets/generated_images/prophet_makkah_persecution.png",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>When you know the truth — genuinely, deeply know it — there comes a moment when you must decide what to do with it. You could keep it quiet. You could protect yourself. Or you could speak.</p>

<p>The Prophet Muhammad ﷺ spoke. And Makkah was not pleased.</p>

<h2>The First Believers</h2>

<p>For the first three years, Islam was a private message shared quietly, person to person. The first to believe was his wife <strong>Khadijah RA</strong>. The first child was his cousin <strong>Ali ibn Abi Talib RA</strong>, then perhaps ten years old, who lived in the Prophet's household. The first free man outside the family was <strong>Abu Bakr As-Siddiq RA</strong> — a close friend and respected merchant whose response to the message was immediate and wholehearted. Through Abu Bakr, several other prominent Makkans accepted Islam.</p>

<p>Among the earliest was a man who would become one of the most powerful symbols of Islam's message of equality: <strong>Bilal ibn Rabah RA</strong>, an enslaved Abyssinian man owned by one of the Quraysh. When his master discovered that Bilal had become Muslim, the torture began. He was taken out into the blazing Makkan heat, laid on scorching sand, and heavy stones were placed on his chest. His torturers demanded he denounce Muhammad ﷺ. Bilal's answer, through cracked lips and a crushing weight, was a single word, repeated again and again:</p>

<p><em>"Ahad. Ahad." — "One. One."</em></p>

<p>Allah is One. That was all Bilal would say. Abu Bakr purchased Bilal's freedom. Bilal would later become the first person in history to call the adhan — the Islamic call to prayer — his deep, resonant voice carrying from the first mosque across all of Madinah.</p>

<h2>Going Public</h2>

<p>After three years, the command came from Allah: proclaim the message openly. The Prophet ﷺ stood on the hill of As-Safa and called the people of Makkah together. He asked them: "If I told you there was an army behind this hill, about to attack — would you believe me?"</p>

<p>"Yes," they said. "You have never lied."</p>

<p>"Then I am warning you of a punishment ahead — greater than any army."</p>

<p>His uncle Abu Lahab, the wealthy, proud chieftain, stood up in fury. "May you perish!" he said. "Is this why you called us here?"</p>

<p>And with that, the public opposition of Makkah began.</p>

<h2>Ridicule, Torture, and Siege</h2>

<p>The Quraysh used every weapon they had. They mocked the Prophet ﷺ in public, calling him a madman, a poet, a liar. They persecuted his followers mercilessly — especially those who had no tribal protection, the poor and enslaved.</p>

<p>The wealthy, powerful, and protected faced ridicule and social exclusion. The vulnerable faced something worse. Female companions were tortured. Families were torn apart. Some early Muslims fled to the Christian kingdom of Abyssinia — the first migration in Islam's history — where the just king Negus gave them refuge and refused to return them to their persecutors.</p>

<p>When the Prophet ﷺ himself walked through Makkah, some would throw dirt and rubbish at him. His daughter would cry as she cleaned it from his face. He told her: "Don't cry, my daughter — Allah will protect your father."</p>

<p>For three years, the entire Banu Hashim clan — Muslim and non-Muslim alike — were subjected to an economic and social boycott. They were confined to a valley outside Makkah. No one could trade with them, marry from them, or speak with them. Children cried from hunger. People survived by eating the leaves from trees. The parchment on which the agreement of boycott was written was later found eaten through by insects — except for the parts that mentioned Allah's name. They said it was a sign.</p>

<h2>The Year of Sorrow</h2>

<p>Then, in a single devastating year, the Prophet ﷺ lost the two people who had shielded him most.</p>

<p>First, his beloved wife <strong>Khadijah RA</strong> — after twenty-five years of marriage, his greatest supporter, the mother of his children, the first believer — passed away. He was overwhelmed with grief. Later in life, he would still speak of her with such love that his later wife Aisha RA admitted to feeling a kind of jealousy of someone she had never met.</p>

<p>Then his uncle <strong>Abu Talib</strong> died — the man who had protected him since childhood, who had never converted to Islam but had never once withdrawn his protection. Without him, the Prophet ﷺ had no political shield. When he went to the nearby city of Ta'if to seek a new audience for his message, he was driven out. Children threw stones at his legs until he bled.</p>

<p>He sat wounded, alone, outside the city. And he prayed one of the most moving prayers in Islamic history:</p>

<blockquote><p><em>"O Allah, to You alone I complain of my weakness and helplessness. O most Merciful — You are the Lord of the weak, and You are my Lord. To whom would You leave me?"</em></p></blockquote>

<h2>The Night Journey: Isra wal-Miraj</h2>

<p>In the depths of this grief and difficulty, Allah gave the Prophet ﷺ a gift beyond imagination. One night, he was taken on a miraculous journey — first from Makkah to Jerusalem (<em>Isra</em>), where he led all the previous prophets in prayer at Al-Aqsa. Then he was taken upward through the heavens (<em>Miraj</em>), meeting Ibrahim, Musa, and Isa (peace be upon them all), until he reached a station no creation had reached before.</p>

<p>It was there that the five daily prayers were given to the Muslim nation — a gift described not as a command, but as a meeting between a servant and their Lord, five times every day.</p>

<h2>What This Teaches Us</h2>

<p>The scholars of Islam often reflect on one remarkable fact: the Night Journey happened immediately after the Year of Sorrow — after the worst losses, the deepest wounds. When everything was taken from him humanly, Allah gave him something divine.</p>

<p>This is the pattern of <em>sabr</em> — patience. Not passive resignation, but an active trust that Allah does not forget those who hold on.</p>

<p>In our next post, we follow the Prophet ﷺ as he prepares for the journey that would transform history: the Hijrah to Madinah.</p>`,
  },
  {
    slug: "prophet-hijrah-madinah",
    title: "A New Beginning: The Hijrah & Building Madinah",
    excerpt:
      "In 622 CE, the Prophet ﷺ and his companions left everything they had ever known and walked toward an uncertain future — and found a new home that would become the first Islamic state.",
    imagePath: "attached_assets/generated_images/prophet_hijrah_madinah.png",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>Sometimes, the most faithful thing you can do is leave.</p>

<p>Not in defeat. Not in despair. But in trust — that where you are going has been prepared for you, even if you cannot see it yet.</p>

<p>In 622 CE, the Prophet Muhammad ﷺ and his companions made the journey that Muslims today mark the beginning of the Islamic calendar by: the <strong>Hijrah</strong> — the migration to Madinah. So significant was this event that Umar ibn Al-Khattab RA, the second Caliph, chose it as the start of Islamic history. Not the birth of the Prophet. Not his first revelation. The Hijrah — because it marked the moment when a community of believers became, truly, a community.</p>

<h2>The Plot Against the Prophet ﷺ</h2>

<p>The leaders of Makkah had decided: Muhammad ﷺ must be killed. A plan was made. Representatives from each Qurayshi clan would each strike him simultaneously, so that no single tribe could be held responsible. The blood guilt would be shared among all — too complicated for any clan to pursue revenge for.</p>

<p>But the one who reveals secrets to His prophets revealed it. The Prophet ﷺ was told to leave that very night. He asked his young cousin Ali RA to sleep in his bed, wrapped in his green cloak, as a decoy — an extraordinary act of courage that Ali accepted without hesitation.</p>

<p>When the assassins crept to the Prophet's home and peered in, they saw the figure sleeping. They waited. At dawn they struck — and found Ali. Muhammad ﷺ was already gone.</p>

<h2>The Cave of Thawr</h2>

<p>With his closest companion <strong>Abu Bakr As-Siddiq RA</strong>, the Prophet ﷺ made his way to a cave called <strong>Thawr</strong>, south of Makkah. They hid there for three nights while search parties scoured the hills. The Quraysh placed a bounty of one hundred camels on Muhammad ﷺ's capture.</p>

<p>At one point, the searchers came right to the mouth of the cave. Abu Bakr RA whispered, afraid — not for himself, but for the Prophet. The Prophet ﷺ placed his hand on his companion's shoulder and said the words that Allah would later make eternal in the Quran:</p>

<blockquote><p><em>"Do not grieve — Allah is with us."</em><br>— Surah At-Tawbah, 9:40</p></blockquote>

<p>A spider had spun its web across the cave mouth. A dove had nested at the entrance. The search party, seeing the undisturbed web, concluded no one had entered and moved on.</p>

<h2>The Welcome of Madinah</h2>

<p>The journey to Madinah — nearly 400 kilometres — took around two weeks on foot and camelback. When the Prophet ﷺ finally arrived at the outskirts of Madinah, the entire city came out to meet him. Children climbed rooftops. Women and girls sang from doorways:</p>

<blockquote><p><em>"The full moon has risen over us, from the valley of Wada' — We must be grateful while the caller calls to Allah."</em></p></blockquote>

<p>Every household wanted the Prophet ﷺ to stay with them. He said: "Let the camel go — wherever she stops, that is where I shall stay." The camel stopped and knelt near the home of Abu Ayyub al-Ansari RA, a man of modest means who wept with gratitude. The Prophet ﷺ stayed with him while a mosque was built.</p>

<h2>Building a Community</h2>

<p>The first act was to build <strong>Masjid an-Nabawi</strong> — the Mosque of the Prophet. The Prophet ﷺ worked alongside his companions, carrying bricks and mixing mud. No leader stood aside while others laboured. The mosque became the centre of everything: prayer, justice, teaching, community meetings, care for the poor.</p>

<p>Madinah was a city of mixed communities — Muslims from Makkah (<em>Muhajirin</em>, the migrants), Muslims of Madinah (<em>Ansar</em>, the helpers), as well as various Jewish tribes and Arab clans of different allegiances. The Prophet ﷺ did something extraordinary: he gathered all of them and drafted the <strong>Constitution of Madinah</strong> — widely regarded as one of the world's earliest written social contracts.</p>

<p>It declared:</p>
<ul>
  <li>All the communities are one nation.</li>
  <li>Each group retains its own religion and internal affairs.</li>
  <li>All are bound to defend Madinah from outside attack.</li>
  <li>Justice is available to all, without tribal favour.</li>
</ul>

<p>Seven centuries before the Magna Carta. Fourteen centuries before the United Nations.</p>

<h2>The Brotherhood of Ansar and Muhajirin</h2>

<p>Many of the migrants had arrived with nothing — they had left their homes, businesses, and belongings behind in Makkah. The Prophet ﷺ established a bond of <em>brotherhood</em> between each migrant and a host from Madinah. These were not loose friendships — some Ansari families divided their homes, their wealth, even offered a divorce so a migrant brother could marry. The spirit was: <em>you are not alone. We have enough. We share.</em></p>

<p>Sa'd ibn Ar-Rabi' RA of the Ansar said to his migrant brother Abd Al-Rahman ibn Awf RA: "I am the wealthiest man among the Ansar. Take half my wealth. I have two wives — choose the one you prefer, and I will divorce her."</p>

<p>Abd Al-Rahman ibn Awf RA refused the generosity, preferring to start fresh through his own trade. But the offer — made sincerely — tells us everything about the spirit of Madinah.</p>

<h2>What This Teaches Us</h2>

<p>The Hijrah teaches us that a new beginning is possible. That leaving a place of harm for a place of growth is not weakness — it is wisdom. That community is built through sacrifice, not mere proximity. And that a diverse, pluralistic society can be governed with fairness and dignity when justice, not tribalism, is the foundation.</p>

<p>In our final post, we'll witness the Prophet's ﷺ greatest achievement and his peaceful farewell to the world he transformed.</p>`,
  },
  {
    slug: "prophet-farewell-sermon-legacy",
    title: "The Farewell: The Final Years, the Last Sermon & the Eternal Legacy",
    excerpt:
      "In his final years, the Prophet ﷺ returned to Makkah — not in triumph and revenge, but in mercy and forgiveness. Then, on the plains of Arafah, he delivered a sermon that still echoes through history.",
    imagePath: "attached_assets/generated_images/prophet_farewell_arafah.png",
    content: `<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>

<p>How does a man who was driven from his city return to it?</p>

<p>If you had been mocked, tortured, bereaved, exiled, and hunted — what would you do when you finally had the power to answer all of that?</p>

<p>The answer the Prophet Muhammad ﷺ gave is one of the most extraordinary moments in the history of the world.</p>

<h2>The Conquest of Makkah (630 CE)</h2>

<p>Eight years after the Hijrah, after years of battles, treaties, broken truces, and the gradual growth of the Muslim community across Arabia, the Prophet ﷺ marched toward Makkah with an army of ten thousand. The city that had persecuted, exiled, and plotted against him stood before him. He was returning as its conqueror.</p>

<p>His commanders expected the orders that all conquerors give.</p>

<p>Instead, he entered Makkah quietly, his head bowed in humility, his lips moving in gratitude to Allah. He went directly to the Ka'bah, circled it, cleared it of its idols, and then turned to the people of Makkah who had gathered, uncertain of their fate.</p>

<p>He said: <em>"O people of Quraysh, what do you think I am going to do with you?"</em></p>

<p>Silence.</p>

<p>Then: <em>"Go. You are free."</em></p>

<p>The people who had tortured Bilal. Who had buried his companions' loved ones. Who had hunted him across the desert. Freed. Without condition. Without revenge. This moment of <em>general amnesty</em> is still cited by historians as one of history's most remarkable acts of mercy.</p>

<h2>The Farewell Pilgrimage (632 CE)</h2>

<p>Two years later, the Prophet ﷺ performed what would be his only Hajj as the leader of the Muslim community — and what he seemed to know would be his last. He set out from Madinah with somewhere between ninety thousand and one hundred and forty thousand companions. The scale was vast. The occasion was sacred.</p>

<p>At the plains of <strong>Arafah</strong> — a broad, open valley beneath a hill called the Mountain of Mercy — he mounted his camel and delivered what we call the <strong>Farewell Sermon</strong>. His voice was amplified by thousands of companions who repeated his words section by section, so the message reached those at the edges of the vast crowd.</p>

<h2>The Farewell Sermon</h2>

<p>What did he say? Scholars have preserved multiple transmissions of this sermon. Some of its most important declarations:</p>

<blockquote>
<p><em>"O People — your Lord is One, and your father (Adam) is one. An Arab has no superiority over a non-Arab, nor a non-Arab over an Arab. A white person has no superiority over a black person, nor a black person over a white — except by taqwa (God-consciousness, righteousness)."</em></p>
</blockquote>

<blockquote>
<p><em>"Your lives, your property, and your honour are sacred to one another, as sacred as this day, in this month, in this city."</em></p>
</blockquote>

<blockquote>
<p><em>"Treat women well and be kind to them. You have rights over them and they have rights over you."</em></p>
</blockquote>

<blockquote>
<p><em>"I leave behind two things: the Quran and my Sunnah. If you hold to them, you will never go astray."</em></p>
</blockquote>

<p>Then he asked the vast crowd: <em>"Have I conveyed the message?"</em></p>

<p>A roar across the plains: <em>"Yes!"</em></p>

<p>"O Allah," he said, "be my witness."</p>

<p>Shortly after, these verses descended:</p>

<blockquote><p><em>"This day I have perfected your religion for you, completed My favour upon you, and have chosen for you Islam as your religion."</em><br>— Surah Al-Ma'idah, 5:3</p></blockquote>

<p>When the great companion Abu Bakr RA heard this verse, he wept. Someone asked him why. He understood what others had not yet grasped: when a task is completed, the one who set out to do it returns home. The Prophet's ﷺ work was done.</p>

<h2>His Final Days</h2>

<p>The Prophet ﷺ returned to Madinah and fell ill. In the final days, despite his weakness, he asked to be carried to the mosque to pray with his community. When he could no longer lead, he asked Abu Bakr to lead the prayers in his place.</p>

<p>He distributed whatever little he had. He freed his enslaved servants. He asked: "Is there anyone I owe a debt to? Now is the time to come forward." He was meticulous about leaving no obligation unfulfilled.</p>

<p>On the 12th of Rabi al-Awwal, in the year 632 CE, in the arms of his wife Aisha RA, the Prophet Muhammad ﷺ passed away. He was sixty-three years old.</p>

<p>The news struck the community like a catastrophe. Umar ibn Al-Khattab RA stood in the mosque, disbelieving, declaring that the Prophet had not died. It was Abu Bakr RA who walked in quietly, went to the room, drew back the cloth, kissed the Prophet's blessed forehead, and walked out to say the words that have echoed through time:</p>

<blockquote><p><em>"Whoever worshipped Muhammad, know that Muhammad has died. And whoever worships Allah — know that Allah is Ever-Living and never dies."</em></p></blockquote>

<h2>The Eternal Legacy</h2>

<p>What did he leave behind?</p>

<p>The <strong>Quran</strong> — memorised in its entirety by thousands of his companions, written down, preserved letter-perfect for over fourteen centuries. No other book in human history has been preserved with such precision.</p>

<p>The <strong>Sunnah</strong> — his sayings, actions, and approvals, meticulously collected and verified. A way of life: how to pray, how to eat, how to treat a spouse, how to greet a stranger, how to handle grief, how to conduct business fairly, how to die with dignity.</p>

<p>A <strong>community</strong> — which grew from one man and a handful of believers in a desert city to one in four human beings on earth today, across every continent, culture, and language.</p>

<p>And something harder to measure but perhaps more important: <em>a way of being human</em>. Honest. Merciful. Just. Patient. Grateful. Humble. A way that begins in a desert orphan carrying rocks, and ends in a man who forgave everything and left a world better than he found it.</p>

<blockquote><p><em>"And We have not sent you, [O Muhammad], except as a mercy to the worlds."</em><br>— Surah Al-Anbiya, 21:107</p></blockquote>

<p>May Allah's peace and blessings be upon him — forever.</p>`,
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
      console.warn(`  WARNING: image not found at ${imgPath}, skipping upload`);
      imageUrls[post.slug] = null;
    } else {
      const url = await uploadImage(imgPath);
      imageUrls[post.slug] = url;
      console.log(`  ${post.slug}: ${url ?? "no upload (non-Replit)"}`);
    }
  }

  console.log("\nInserting blog posts…");
  for (const post of posts) {
    const [row] = await db
      .insert(blogPostsTable)
      .values({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featureImageUrl: imageUrls[post.slug],
        category: "prophet",
        authorName: "Grays Park Masjid",
        published: true,
        publishedAt: new Date(),
      })
      .returning({ id: blogPostsTable.id, slug: blogPostsTable.slug });
    console.log(`  ✓ ${row.slug} (${row.id})`);
  }

  await pool.end();
  console.log("\nDone! All 5 posts published.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
