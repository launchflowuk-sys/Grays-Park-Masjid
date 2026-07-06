import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { adminUsersTable } from "./schema/admin-users.ts";
import { prayerTimesTable, timetablePdfsTable } from "./schema/prayer.ts";
import { servicesTable } from "./schema/services.ts";
import { eventsTable } from "./schema/events.ts";
import { newsPostsTable } from "./schema/news.ts";
import { announcementsTable } from "./schema/announcements.ts";
import { staffMembersTable } from "./schema/staff.ts";
import { galleryAlbumsTable, galleryMediaTable } from "./schema/gallery.ts";
import { donationCampaignsTable } from "./schema/donations.ts";
import { coursesTable } from "./schema/courses.ts";
import { volunteerOpportunitiesTable } from "./schema/volunteers.ts";
import { siteSettingsTable } from "./schema/settings.ts";

const { Pool } = pg;

function todayPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function isoAt(daysFromNow: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function seedAdmin(db: ReturnType<typeof drizzle>) {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@graysparkmasjid.org.uk";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  const [existing] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, email))
    .limit(1);

  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.insert(adminUsersTable).values({
    email,
    passwordHash,
    name: "Super Admin",
    role: "super_admin",
    active: true,
  });

  console.log(`Seeded super admin user: ${email} / ${password}`);
}

async function seedPrayerTimes(db: ReturnType<typeof drizzle>) {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(prayerTimesTable);
  if (count > 0) {
    console.log("Prayer times already seeded, skipping.");
    return;
  }

  const rows = [];
  for (let i = -1; i < 13; i++) {
    rows.push({
      date: todayPlusDays(i),
      fajrAdhan: "05:10",
      fajrIqamah: "05:30",
      dhuhrAdhan: "13:00",
      dhuhrIqamah: "13:20",
      asrAdhan: "16:45",
      asrIqamah: "17:00",
      maghribAdhan: "20:05",
      maghribIqamah: "20:10",
      ishaAdhan: "21:30",
      ishaIqamah: "21:45",
      jummahKhutbah: "13:15",
      jummahIqamah: "13:30",
      sunrise: "06:40",
    });
  }
  await db.insert(prayerTimesTable).values(rows);

  await db.insert(timetablePdfsTable).values([
    {
      title: "Prayer Timetable",
      fileUrl: "/objects/timetables/placeholder-timetable.pdf",
      monthLabel: new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
      active: true,
      sortOrder: 0,
    },
  ]);

  console.log("Seeded prayer times and timetable PDF entry.");
}

async function seedServices(db: ReturnType<typeof drizzle>) {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(servicesTable);
  if (count > 0) {
    console.log("Services already seeded, skipping.");
    return;
  }

  await db.insert(servicesTable).values([
    {
      title: "Daily Congregational Prayers",
      description:
        "Join us for all five daily prayers led by our resident Imam. The main prayer hall accommodates over 300 worshippers, with a dedicated sisters' section.",
      icon: "moon-star",
      sortOrder: 0,
      published: true,
    },
    {
      title: "Jumu'ah (Friday Prayer)",
      description:
        "Two Jumu'ah khutbahs are held each Friday to accommodate our growing community — the first at 1:15pm and a second at 2:00pm during busy periods.",
      icon: "users",
      sortOrder: 1,
      published: true,
    },
    {
      title: "Nikah Ceremonies",
      description:
        "Our Imam conducts Nikah ceremonies in the masjid or at a venue of your choosing. Please contact the office at least four weeks in advance to book.",
      icon: "heart-handshake",
      sortOrder: 2,
      published: true,
    },
    {
      title: "Funeral & Janazah Services",
      description:
        "We support families with Ghusl (ritual washing), Janazah prayer, and guidance on burial arrangements. Our team is available around the clock for bereavement support.",
      icon: "flower",
      sortOrder: 3,
      published: true,
    },
    {
      title: "Madrassah (Weekend Islamic School)",
      description:
        "Qur'an recitation, Tajweed, Islamic studies and Arabic language classes for children aged 5-16, held every Saturday and Sunday morning.",
      icon: "book-open",
      sortOrder: 4,
      published: true,
    },
    {
      title: "Sisters' Facilities",
      description:
        "A dedicated, fully carpeted sisters' prayer hall with its own entrance, wudhu area, and audio relay of the khutbah and Salah.",
      icon: "home",
      sortOrder: 5,
      published: true,
    },
  ]);

  console.log("Seeded services.");
}

async function seedEvents(db: ReturnType<typeof drizzle>) {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(eventsTable);
  if (count > 0) {
    console.log("Events already seeded, skipping.");
    return;
  }

  await db.insert(eventsTable).values([
    {
      title: "Community Iftar Night",
      description:
        "Join us for a free community Iftar during Ramadan. All are welcome — please bring your family and friends. Catering is provided by local volunteers.",
      location: "Main Hall, Grays Park Masjid",
      startsAt: isoAt(10, 19, 45),
      endsAt: isoAt(10, 21, 30),
      published: true,
    },
    {
      title: "Islamic Finance Workshop",
      description:
        "A practical evening workshop covering halal mortgages, savings, and everyday money matters, delivered by a qualified Islamic finance adviser.",
      location: "Community Room, Grays Park Masjid",
      startsAt: isoAt(21, 18, 30),
      endsAt: isoAt(21, 20, 0),
      published: true,
    },
    {
      title: "Annual Charity Fun Run",
      description:
        "A family-friendly 5K fun run around Grays Park raising funds for our new extension. Register at the front desk or via the Donations page.",
      location: "Grays Park",
      startsAt: isoAt(35, 9, 0),
      endsAt: isoAt(35, 12, 0),
      published: true,
    },
    {
      title: "Eid al-Fitr Prayer & Celebration",
      description:
        "Eid Salah followed by a celebration for the whole family with food stalls, activities for children, and a raffle in aid of the masjid extension fund.",
      location: "Main Hall & Car Park, Grays Park Masjid",
      startsAt: isoAt(50, 8, 0),
      endsAt: isoAt(50, 11, 0),
      published: true,
    },
  ]);

  console.log("Seeded events.");
}

async function seedNews(db: ReturnType<typeof drizzle>) {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(newsPostsTable);
  if (count > 0) {
    console.log("News posts already seeded, skipping.");
    return;
  }

  await db.insert(newsPostsTable).values([
    {
      title: "New Extension Fund Reaches 60% of Target",
      slug: "extension-fund-reaches-60-percent",
      excerpt: "Thanks to your generosity, our extension fund has now raised over £180,000 towards the new sisters' wing and youth centre.",
      body:
        "Alhamdulillah, thanks to the incredible generosity of our community, the Grays Park Masjid Extension Fund has now reached 60% of its £300,000 target. " +
        "The extension will add a dedicated sisters' prayer hall, a purpose-built youth centre, and additional wudhu facilities. " +
        "Construction is expected to begin later this year subject to planning approval. Jazakallah khair to everyone who has contributed so far — " +
        "if you would like to donate, please visit our Donations page or speak to a committee member after any prayer.",
      published: true,
      publishedAt: new Date(),
    },
    {
      title: "Ramadan Timetable Now Available",
      slug: "ramadan-timetable-now-available",
      excerpt: "Our full Ramadan prayer timetable, including Taraweeh times, is now available to download from the Prayer Times page.",
      body:
        "As we approach the blessed month of Ramadan, we are pleased to share our full timetable covering Suhoor end times, Iftar times, and nightly Taraweeh prayers. " +
        "Taraweeh will be led by Hafiz Abdullah Rahman this year, with a Khatm-ul-Qur'an planned for the 27th night. " +
        "You can download the full PDF timetable from the Prayer Times page or pick up a printed copy from the masjid foyer.",
      published: true,
      publishedAt: new Date(),
    },
    {
      title: "Madrassah Enrolment Open for New Term",
      slug: "madrassah-enrolment-open-new-term",
      excerpt: "Registration is now open for the new Madrassah term. Places are limited, so early enrolment is recommended.",
      body:
        "We are delighted to announce that enrolment for the new Madrassah term is now open. Classes are available for children aged 5-16 across three levels, " +
        "covering Qur'an recitation, Tajweed, Islamic studies, and basic Arabic. Classes run every Saturday and Sunday morning. " +
        "To register, please visit the Madrassah page and complete the online enrolment form, or speak to our Education Admin team after Jumu'ah.",
      published: true,
      publishedAt: new Date(),
    },
  ]);

  console.log("Seeded news posts.");
}

async function seedAnnouncements(db: ReturnType<typeof drizzle>) {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(announcementsTable);
  if (count > 0) {
    console.log("Announcements already seeded, skipping.");
    return;
  }

  await db.insert(announcementsTable).values([
    {
      title: "Car Park Resurfacing — Please Use Overflow Parking",
      body:
        "The main car park will be closed for resurfacing works from Monday to Wednesday this week. Please use the overflow parking on Chadwell Road " +
        "or nearby street parking during this time. We apologise for any inconvenience and thank you for your patience.",
      published: true,
      pinned: true,
      publishedAt: new Date(),
    },
    {
      title: "Jumu'ah Second Khutbah Now at 2:00pm",
      body:
        "Due to growing attendance, we have introduced a second Jumu'ah khutbah at 2:00pm every Friday, in addition to the usual 1:15pm khutbah. " +
        "Both khutbahs will be delivered by our resident Imam.",
      published: true,
      pinned: false,
      publishedAt: new Date(),
    },
  ]);

  console.log("Seeded announcements.");
}

async function seedStaff(db: ReturnType<typeof drizzle>) {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(staffMembersTable);
  if (count > 0) {
    console.log("Staff already seeded, skipping.");
    return;
  }

  await db.insert(staffMembersTable).values([
    {
      name: "Imam Yusuf Hassan",
      role: "Resident Imam",
      bio:
        "Imam Yusuf has led prayers at Grays Park Masjid since 2015. He holds an Ijazah in Qur'an recitation and studied Islamic jurisprudence in Damascus and Cairo.",
      sortOrder: 0,
      published: true,
    },
    {
      name: "Hafiz Abdullah Rahman",
      role: "Assistant Imam & Hifz Teacher",
      bio:
        "Hafiz Abdullah leads our Taraweeh prayers during Ramadan and teaches the Hifz (memorisation) class for advanced Madrassah students.",
      sortOrder: 1,
      published: true,
    },
    {
      name: "Sister Amina Begum",
      role: "Madrassah Coordinator",
      bio:
        "Amina coordinates our weekend Madrassah programme and teaches Islamic studies to our youngest students. She has over ten years of experience in Islamic education.",
      sortOrder: 2,
      published: true,
    },
    {
      name: "Br. Tariq Iqbal",
      role: "Chair of Trustees",
      bio:
        "Tariq has served on the board of trustees for over a decade and leads our fundraising and community outreach initiatives, including the current extension project.",
      sortOrder: 3,
      published: true,
    },
  ]);

  console.log("Seeded staff members.");
}

async function seedGallery(db: ReturnType<typeof drizzle>) {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(galleryAlbumsTable);
  if (count > 0) {
    console.log("Gallery already seeded, skipping.");
    return;
  }

  const [eidAlbum] = await db
    .insert(galleryAlbumsTable)
    .values({
      title: "Eid Celebrations",
      description: "Photos from our recent Eid al-Fitr and Eid al-Adha community celebrations.",
      published: true,
    })
    .returning();

  const [extensionAlbum] = await db
    .insert(galleryAlbumsTable)
    .values({
      title: "Extension Project Progress",
      description: "Updates on our ongoing extension build, from groundbreaking through to completion.",
      published: true,
    })
    .returning();

  await db.insert(galleryMediaTable).values([
    {
      albumId: eidAlbum.id,
      mediaUrl: "/objects/gallery/eid-celebration-1.jpg",
      caption: "Families gathering after Eid prayer",
      sortOrder: 0,
    },
    {
      albumId: eidAlbum.id,
      mediaUrl: "/objects/gallery/eid-celebration-2.jpg",
      caption: "Children's activities in the car park",
      sortOrder: 1,
    },
    {
      albumId: extensionAlbum.id,
      mediaUrl: "/objects/gallery/extension-groundbreaking.jpg",
      caption: "Groundbreaking ceremony with trustees and volunteers",
      sortOrder: 0,
    },
  ]);

  console.log("Seeded gallery albums and media.");
}

async function seedDonations(db: ReturnType<typeof drizzle>) {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(donationCampaignsTable);
  if (count > 0) {
    console.log("Donation campaigns already seeded, skipping.");
    return;
  }

  await db.insert(donationCampaignsTable).values([
    {
      title: "Masjid Extension Fund",
      description:
        "Help us build a new sisters' prayer hall, youth centre, and additional wudhu facilities to serve our growing community.",
      targetAmount: "300000.00",
      raisedAmount: "182450.00",
      active: true,
      featured: true,
    },
    {
      title: "Ramadan Food Bank Appeal",
      description:
        "Provide Iftar meals and food parcels for families in need throughout Ramadan, distributed in partnership with local charities.",
      targetAmount: "15000.00",
      raisedAmount: "9320.00",
      active: true,
      featured: true,
    },
    {
      title: "Qurbani (Udhiyah) 2026",
      description:
        "Donate towards Qurbani on behalf of yourself or a loved one. Meat is distributed to families in need locally and overseas.",
      targetAmount: "20000.00",
      raisedAmount: "4100.00",
      active: true,
      featured: false,
    },
    {
      title: "General Masjid Maintenance",
      description: "Support the day-to-day running costs of the masjid, including utilities, cleaning, and minor repairs.",
      raisedAmount: "6780.00",
      active: true,
      featured: false,
    },
  ]);

  console.log("Seeded donation campaigns.");
}

async function seedCourses(db: ReturnType<typeof drizzle>) {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(coursesTable);
  if (count > 0) {
    console.log("Courses already seeded, skipping.");
    return;
  }

  await db.insert(coursesTable).values([
    {
      title: "Qur'an & Tajweed — Beginners",
      description: "Learn correct Arabic pronunciation and the rules of Tajweed. Suitable for children with little or no prior Qur'an reading experience.",
      ageGroup: "Ages 5-8",
      schedule: "Saturdays, 10:00am - 11:30am",
      fee: "20.00",
      capacity: 20,
      published: true,
    },
    {
      title: "Qur'an & Tajweed — Intermediate",
      description: "Building on beginner skills, students continue reading fluency and start memorising short Surahs.",
      ageGroup: "Ages 9-12",
      schedule: "Saturdays, 11:45am - 1:15pm",
      fee: "20.00",
      capacity: 20,
      published: true,
    },
    {
      title: "Hifz (Qur'an Memorisation) Programme",
      description: "An intensive weekend memorisation programme led by Hafiz Abdullah Rahman for dedicated older students.",
      ageGroup: "Ages 10+",
      schedule: "Sundays, 9:00am - 12:00pm",
      fee: "35.00",
      capacity: 12,
      published: true,
    },
    {
      title: "Arabic Language for Adults",
      description: "An evening course introducing conversational and Qur'anic Arabic for adult learners of all backgrounds.",
      ageGroup: "Adults",
      schedule: "Wednesdays, 7:00pm - 8:30pm",
      fee: "40.00",
      capacity: 15,
      published: true,
    },
  ]);

  console.log("Seeded courses.");
}

async function seedVolunteers(db: ReturnType<typeof drizzle>) {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(volunteerOpportunitiesTable);
  if (count > 0) {
    console.log("Volunteer opportunities already seeded, skipping.");
    return;
  }

  await db.insert(volunteerOpportunitiesTable).values([
    {
      title: "Ramadan Iftar Team",
      description: "Help prepare, serve, and clear away food for our nightly community Iftars throughout Ramadan.",
      active: true,
    },
    {
      title: "Madrassah Teaching Assistant",
      description: "Support our Madrassah teachers on Saturday and Sunday mornings, helping younger children with reading and classroom activities.",
      active: true,
    },
    {
      title: "Car Park & Events Steward",
      description: "Assist with car park management and general stewarding at Jumu'ah and larger community events such as Eid celebrations.",
      active: true,
    },
    {
      title: "Fundraising Committee",
      description: "Join our fundraising committee to help plan and run campaigns for the extension fund and other masjid appeals.",
      active: true,
    },
  ]);

  console.log("Seeded volunteer opportunities.");
}

async function seedSettings(db: ReturnType<typeof drizzle>) {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(siteSettingsTable);
  if (count > 0) {
    console.log("Site settings already seeded, skipping.");
    return;
  }

  const settings: Record<string, string> = {
    site_phone: "01375 382 910",
    site_email: "info@graysparkmasjid.org.uk",
    site_address: "Grays Park Masjid, 14 Chadwell Road, Grays, Essex, RM17 6QJ",
    site_announcement: "Our car park will be closed for resurfacing works Monday to Wednesday this week — please use overflow parking on Chadwell Road.",
    donation_bank_details:
      "Account Name: Grays Park Masjid Trust\nSort Code: 40-02-50\nAccount Number: 71234567\nReference: Please use your name and the campaign (e.g. 'Extension Fund')",
    madrassah_content:
      "Our Madrassah runs every Saturday and Sunday morning, offering Qur'an recitation, Tajweed, Islamic studies, and Arabic language classes for children " +
      "aged 5-16. Classes are taught by experienced, DBS-checked teachers in small groups to ensure every child gets individual attention. " +
      "Enrolment is open at the start of each term — see our Courses page for current classes and fees.",
    sisters_facilities_content:
      "Grays Park Masjid provides a dedicated, fully carpeted sisters' prayer hall with its own entrance, cloakroom, and wudhu area. " +
      "The hall has a live audio relay of the Khutbah and Salah, and is available for all five daily prayers as well as Jumu'ah. " +
      "Our sisters' committee also organises regular halaqas and social events — see our Events page for upcoming dates.",
    youth_programmes_content:
      "Our youth programme runs weekly sessions for teenagers covering Islamic studies, current affairs, and organised sports activities at the local " +
      "sports centre. We also run an annual residential youth camp during the summer holidays. Contact the office for the current schedule.",
    jumuah_content:
      "Jumu'ah prayer is held every Friday with two khutbahs to accommodate our growing congregation: the first khutbah begins at 1:15pm, followed by a " +
      "second khutbah at 2:00pm. Please arrive early as parking fills up quickly, and overflow parking is available on Chadwell Road.",
    funeral_content:
      "We support bereaved families with Ghusl (ritual washing), Janazah prayer, and guidance through the burial process. Our funeral team is available " +
      "around the clock — please call the masjid office on 01375 382 910 as soon as possible following a death so we can begin arrangements promptly.",
    nikah_content:
      "Our Imam is pleased to conduct Nikah ceremonies at the masjid or at a venue of your choosing. We ask that you contact the office at least four " +
      "weeks in advance with both parties' details so we can prepare the necessary documentation and book a suitable time.",
    ramadan_content:
      "During Ramadan we host nightly Taraweeh prayers, community Iftars, and a Ramadan Food Bank Appeal supporting local families in need. " +
      "Our full Ramadan timetable, including Suhoor and Iftar times, is published on the Prayer Times page ahead of the month beginning.",
    eid_content:
      "Eid prayers are held in two congregations to accommodate everyone comfortably — please check the Announcements page closer to the date for exact " +
      "timings. Celebrations continue after prayer with food stalls, activities for children, and a charity raffle in the car park.",
    zakat_content:
      "Zakat, Sadaqah, and Lillah donations can be made online via our Donations page, by bank transfer, or in person at the masjid office. " +
      "We calculate and distribute Zakat in accordance with the four schools of thought — please speak to our Imam if you have questions about your calculation.",
    safeguarding_content:
      "Grays Park Masjid is committed to the safety and wellbeing of all children and vulnerable adults in our care. All staff and volunteers working with " +
      "children undergo an enhanced DBS check. Our designated safeguarding lead can be contacted confidentially via the office on 01375 382 910.",
    policies_content:
      "Our full set of governing policies, including safeguarding, equal opportunities, health & safety, and data protection, are available on request " +
      "from the masjid office. Printed copies are also available in the foyer noticeboard.",
    faqs_content: JSON.stringify([
      { question: "What are your daily prayer times?", answer: "Our daily prayer times are published on the Prayer Times page and updated monthly — you can also download the full PDF timetable." },
      { question: "Do you have parking?", answer: "Yes, we have an on-site car park. During busy times such as Jumu'ah and Eid, please use the overflow parking on Chadwell Road." },
      { question: "How can I enrol my child in the Madrassah?", answer: "Visit our Madrassah page or Courses page to see current classes and complete the online enrolment form." },
      { question: "How do I make a donation?", answer: "You can donate online via our Donations page, by bank transfer using the details provided, or in person at the masjid office." },
    ]),
  };

  await db.insert(siteSettingsTable).values(Object.entries(settings).map(([key, value]) => ({ key, value })));

  console.log("Seeded site settings.");
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set.");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  await seedAdmin(db);
  await seedPrayerTimes(db);
  await seedServices(db);
  await seedEvents(db);
  await seedNews(db);
  await seedAnnouncements(db);
  await seedStaff(db);
  await seedGallery(db);
  await seedDonations(db);
  await seedCourses(db);
  await seedVolunteers(db);
  await seedSettings(db);

  await pool.end();
  console.log("Seeding complete.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
