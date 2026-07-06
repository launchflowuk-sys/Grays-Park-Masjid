import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  MapPin,
  Clock,
  ArrowRight,
  BookOpen,
  Users,
  Phone,
  Mail,
  Search,
  ChevronDown,
  Menu,
  Landmark,
  HeartHandshake,
  HandCoins,
  Calendar,
} from 'lucide-react';

import heroImage from '../../../assets/home-hero.png';
import rebuildImage from '../../../assets/rebuild-render.png';
import communityImage from '../../../assets/community.png';
import logoImage from '../../../../../../attached_assets/branding/grayspark_logo.png';

const TODAY_PRAYERS = [
  { name: 'Fajr', time: '4:35 AM' },
  { name: 'Dhuhr', time: '1:15 PM', active: true },
  { name: 'Asr', time: '4:45 PM' },
  { name: 'Maghrib', time: '8:39 PM' },
  { name: 'Isha', time: '10:15 PM' },
  { name: "Jumu'ah", time: '1:30 PM', time2: '2:15 PM' },
];

const STATS = [
  { icon: Users, title: 'WELCOMING EVERYONE', desc: 'All are welcome' },
  { icon: BookOpen, title: 'ISLAMIC EDUCATION', desc: 'Classes for all ages' },
  { icon: HeartHandshake, title: 'COMMUNITY SERVICE', desc: 'Serving the community' },
  { icon: HandCoins, title: 'DONATE & SUPPORT', desc: 'Help build our future' },
  { icon: Calendar, title: 'EVENTS & ACTIVITIES', desc: 'Bringing people together' },
];

export default function GraysParkMasjidLandingV2() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f2] flex flex-col font-sans text-[#1c2a1e] selection:bg-[#4a7856]/20">
      {/* Navigation — exact recreation of provided mock */}
      <nav className="fixed top-0 w-full z-50 bg-white shadow-sm py-3">
        <div className="mx-auto px-6 max-w-[1320px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Grays Park Masjid logo" className="h-10 w-auto object-contain" />
            <div className="leading-tight">
              <p className="font-semibold tracking-tight text-[#1c3a24] text-[15px]">GRAYS PARK</p>
              <p className="font-semibold tracking-tight text-[#d4a24c] text-[15px] -mt-1">MASJID</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-7 text-[13px] font-semibold tracking-wide text-[#1c3a24]/80">
            <a href="#prayer-times" className="hover:text-[#1c3a24] transition-colors">PRAYER TIMES</a>
            <a href="#" className="flex items-center gap-1 hover:text-[#1c3a24] transition-colors">
              SERVICES <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
            <a href="#" className="flex items-center gap-1 hover:text-[#1c3a24] transition-colors">
              EDUCATION <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
            <a href="#" className="hover:text-[#1c3a24] transition-colors">EVENTS</a>
            <a href="#" className="hover:text-[#1c3a24] transition-colors">NEWS</a>
            <a href="#" className="flex items-center gap-1 hover:text-[#1c3a24] transition-colors">
              ABOUT <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
            <a href="#contact" className="hover:text-[#1c3a24] transition-colors">CONTACT</a>
          </div>

          <div className="flex items-center gap-3">
            <button aria-label="Search" className="hidden md:flex w-9 h-9 items-center justify-center text-[#1c3a24]/70 hover:text-[#1c3a24] transition-colors">
              <Search className="w-[18px] h-[18px]" aria-hidden="true" />
            </button>
            <button
              aria-label="Donate to Grays Park Masjid"
              className="min-h-[40px] bg-[#d4a24c] text-white px-5 rounded-full font-semibold text-[13px] tracking-wide hover:bg-[#c3923d] active:scale-[0.97] transition-all flex items-center gap-2"
            >
              DONATE NOW <Heart className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button aria-label="Open menu" className="w-9 h-9 rounded-full border border-[#1c3a24]/20 flex items-center justify-center text-[#1c3a24] hover:bg-[#1c3a24]/5 transition-colors">
              <Menu className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero — exact recreation of provided mock, full-bleed background photo */}
      <section className="relative overflow-visible pt-[76px]">
        <div className="relative min-h-[620px] md:min-h-[680px] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img src={heroImage} alt="Grays Park Masjid building and grounds" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d1f12]/80 via-[#0d1f12]/25 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f12]/60 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1320px] px-6 w-full">
            <div className="max-w-xl">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-[#e0b562] text-xs md:text-sm font-semibold tracking-[0.15em] uppercase mb-4"
              >
                In the name of Allah, the Most Gracious, the Most Merciful
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05, ease: 'easeOut' }}
                className="text-4xl md:text-5xl lg:text-[3.25rem] font-semibold tracking-tight leading-[1.1] text-white"
              >
                A Place of Worship,
                <br />
                Learning &amp; Community
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="w-14 h-[3px] bg-[#e0b562] my-6"
              />
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                className="text-base md:text-lg text-white/85 leading-relaxed max-w-md"
              >
                Grays Park Masjid is a welcoming center for worship, education and community service. All are welcome.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <button className="min-h-[46px] bg-[#1c3a24] text-white px-6 rounded-full font-semibold text-[13px] tracking-wide hover:bg-[#254a2e] active:scale-[0.97] transition-all flex items-center gap-2">
                  VIEW PRAYER TIMES <Clock className="w-4 h-4" aria-hidden="true" />
                </button>
                <button className="min-h-[46px] bg-[#d4a24c] text-white px-6 rounded-full font-semibold text-[13px] tracking-wide hover:bg-[#c3923d] active:scale-[0.97] transition-all flex items-center gap-2">
                  DONATE NOW <Heart className="w-4 h-4" aria-hidden="true" />
                </button>
                <button className="min-h-[46px] border border-white/70 text-white px-6 rounded-full font-semibold text-[13px] tracking-wide hover:bg-white/10 active:scale-[0.97] transition-all flex items-center gap-2">
                  VISIT US <MapPin className="w-4 h-4" aria-hidden="true" />
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Floating Next Prayer card — bottom-left, overlaps hero/section boundary */}
        <div className="absolute left-6 md:left-[calc((100vw-1320px)/2+24px)] -bottom-28 md:-bottom-32 z-20 w-[calc(100%-3rem)] max-w-[420px]">
          <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#d4a24c] text-xs font-semibold tracking-wide uppercase">Next Prayer</p>
                <p className="text-2xl font-bold text-[#1c3a24] mt-1">Dhuhr</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold tabular-nums text-[#1c3a24]">01:15:45</p>
                <p className="text-xs text-[#1c3a24]/55 mt-0.5">starts at 1:15 PM</p>
              </div>
              <div className="w-11 h-11 rounded-full bg-[#1c3a24] flex items-center justify-center text-white shrink-0 ml-3">
                <Landmark className="w-5 h-5" aria-hidden="true" />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-1.5 mt-5">
              {TODAY_PRAYERS.map((p) => (
                <div
                  key={p.name}
                  className={`text-center rounded-lg py-2 px-1 ${p.active ? 'bg-[#eef0e6]' : ''}`}
                >
                  <p className="text-[10px] text-[#1c3a24]/55 font-semibold truncate">{p.name}</p>
                  <p className="text-[11px] font-semibold text-[#1c3a24] mt-1 leading-tight">{p.time}</p>
                  {p.time2 && <p className="text-[11px] font-semibold text-[#1c3a24] leading-tight">{p.time2}</p>}
                </div>
              ))}
            </div>

            <a
              href="#prayer-times"
              className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-[#1c3a24]/70 hover:text-[#1c3a24] transition-colors"
            >
              View full timetable <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Stats bar — dark green, five columns, sits directly beneath hero */}
        <div className="bg-[#1c3a24] pt-20 pb-8 md:pt-24 md:pb-9">
          <div className="mx-auto max-w-[1320px] px-6 grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
            {STATS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-[#e0b562] shrink-0">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-white text-[13px] font-semibold tracking-wide">{title}</p>
                  <p className="text-white/60 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Rebuild Appeal */}
      <section id="rebuild" className="pt-40 pb-24 md:pt-48 md:pb-28">
        <div className="mx-auto max-w-[1200px] px-6 grid lg:grid-cols-2 gap-14 items-center">
          <div className="relative">
            <div
              className="absolute -inset-3 bg-[#4a7856]/8"
              style={{ borderRadius: '3rem 3rem 1rem 3rem' }}
              aria-hidden="true"
            />
            <img
              src={rebuildImage}
              alt="Architectural render of the rebuilt mosque"
              className="relative w-full object-cover aspect-[4/3]"
              style={{ borderRadius: '2.5rem 2.5rem 0.75rem 2.5rem' }}
            />
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-[1.15] mb-5 max-w-md">
              Phase one is complete. Help us finish phase two.
            </h2>
            <p className="text-[#1c2a1e]/65 leading-relaxed mb-8 max-w-md">
              We've raised £1,050,000 toward expanded prayer halls, a dedicated sisters' section, youth classrooms, and a welcoming community hub.
            </p>

            <div className="bg-white rounded-[1.75rem] p-7 shadow-sm shadow-black/5 border border-black/5 mb-8">
              <div className="flex justify-between items-baseline mb-4">
                <div>
                  <p className="text-xs text-[#1c2a1e]/55 font-medium uppercase tracking-wide">Raised</p>
                  <p className="text-2xl font-semibold text-[#4a7856] mt-1">£1,050,000</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#1c2a1e]/55 font-medium uppercase tracking-wide">Target</p>
                  <p className="text-lg font-semibold mt-1">£2,000,000</p>
                </div>
              </div>
              <div className="w-full bg-[#4a7856]/10 h-3 rounded-full overflow-hidden" role="progressbar" aria-valuenow={52} aria-valuemin={0} aria-valuemax={100} aria-label="Rebuild funding progress">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '52%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className="bg-[#e8b34d] h-full rounded-full"
                />
              </div>
              <p className="text-xs text-[#1c2a1e]/55 mt-3">52% of the final goal raised so far.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="min-h-[44px] bg-[#1c2a1e] text-white px-7 rounded-full font-semibold hover:bg-[#1c2a1e]/90 active:scale-[0.97] transition-all">
                Donate £100
              </button>
              <button className="min-h-[44px] border-2 border-[#1c2a1e] px-7 rounded-full font-semibold hover:bg-[#1c2a1e] hover:text-white active:scale-[0.97] transition-all">
                Choose an amount
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Programs — organic asymmetric layout, single accent, no repeated card grid */}
      <section id="programs" className="py-24 md:py-28 bg-[#eef0e6]">
        <div className="mx-auto max-w-[1200px] px-6">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-md mb-14">
            More than a place to pray.
          </h2>

          <div className="grid lg:grid-cols-5 gap-6">
            <div
              className="lg:col-span-3 relative min-h-[340px] overflow-hidden group"
              style={{ borderRadius: '3rem 3rem 3rem 1rem' }}
            >
              <img
                src={communityImage}
                alt="Community members gathering at Grays Park Masjid"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c2a1e]/85 via-[#1c2a1e]/15 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="text-xl font-semibold text-white mb-2">Join our growing family</h3>
                <p className="text-white/75 text-sm max-w-xs mb-4">Everyone is welcome, from first prayer to lifelong member.</p>
                <a href="#" className="inline-flex items-center gap-1.5 text-sm font-medium text-white underline decoration-white/40 underline-offset-4 hover:decoration-white transition-colors">
                  View events <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-white p-7 flex-1" style={{ borderRadius: '2rem 2rem 2rem 0.75rem' }}>
                <div className="w-11 h-11 rounded-full bg-[#4a7856]/10 flex items-center justify-center text-[#4a7856] mb-4">
                  <BookOpen className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-semibold mb-2">Madrassah</h3>
                <p className="text-sm text-[#1c2a1e]/60 leading-relaxed">
                  Islamic education for ages 5–16: Qur'anic recitation, studies, and character development.
                </p>
              </div>
              <div className="bg-white p-7 flex-1" style={{ borderRadius: '2rem 2rem 2rem 0.75rem' }}>
                <div className="w-11 h-11 rounded-full bg-[#4a7856]/10 flex items-center justify-center text-[#4a7856] mb-4">
                  <Users className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-semibold mb-2">Community Welfare</h3>
                <p className="text-sm text-[#1c2a1e]/60 leading-relaxed">
                  A food bank, counselling, and welfare support for families across Thurrock.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#1c2a1e] text-white pt-16 pb-8">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-14">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-white p-2 rounded-2xl">
                  <img src={logoImage} alt="Grays Park Masjid logo" className="h-9 w-auto object-contain brightness-0" />
                </div>
                <span className="font-semibold tracking-tight">Grays Park Masjid</span>
              </div>
              <p className="text-white/60 max-w-sm leading-relaxed mb-5 text-sm">
                A spiritual home serving the Muslim community of Thurrock, Essex, through worship, education, and welfare.
              </p>
              <div className="flex items-start gap-2.5 text-sm text-white/75">
                <MapPin className="w-4 h-4 text-[#e8b34d] shrink-0 mt-0.5" aria-hidden="true" />
                <span>Grays Park Masjid, Grays, Essex, United Kingdom</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-5">Quick Links</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li><a href="#rebuild" className="hover:text-[#e8b34d] transition-colors">The Rebuild</a></li>
                <li><a href="#prayer-times" className="hover:text-[#e8b34d] transition-colors">Prayer Timetable</a></li>
                <li><a href="#programs" className="hover:text-[#e8b34d] transition-colors">Madrassah</a></li>
                <li><a href="#" className="hover:text-[#e8b34d] transition-colors">Donate</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-5">Contact</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#e8b34d]" aria-hidden="true" /> 01375 000 000
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#e8b34d]" aria-hidden="true" /> info@graysparkmasjid.org
                </li>
              </ul>
              <p className="text-xs text-white/40 mt-6">Registered UK Charity No. 1123456</p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
            <p>&copy; {new Date().getFullYear()} Grays Park Masjid. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
