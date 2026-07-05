import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Clock, ArrowRight, BookOpen, Users, Phone, Mail } from 'lucide-react';

import heroImage from '../../../assets/hero-mosque.png';
import rebuildImage from '../../../assets/rebuild-render.png';
import communityImage from '../../../assets/community.png';
import logoImage from '../../../../../../attached_assets/branding/grayspark_logo.png';

const PRAYERS = [
  { name: 'Fajr', time: '05:12' },
  { name: 'Zuhr', time: '13:05' },
  { name: 'Asr', time: '16:30' },
  { name: 'Maghrib', time: '19:15' },
  { name: 'Isha', time: '20:45' },
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
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#faf8f2]/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'
        }`}
      >
        <div className="mx-auto px-6 max-w-[1320px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Grays Park Masjid logo" className="h-11 w-auto object-contain" />
            <span className={`hidden md:block font-semibold tracking-tight ${scrolled ? 'text-[#1c2a1e]' : 'text-white'}`}>
              Grays Park Masjid
            </span>
          </div>

          <div className={`hidden md:flex items-center gap-8 text-[15px] font-medium ${scrolled ? 'text-[#1c2a1e]/75' : 'text-white/90'}`}>
            <a href="#rebuild" className="hover:opacity-70 transition-opacity">The Rebuild</a>
            <a href="#prayer-times" className="hover:opacity-70 transition-opacity">Prayer Times</a>
            <a href="#programs" className="hover:opacity-70 transition-opacity">Programs</a>
            <a href="#contact" className="hover:opacity-70 transition-opacity">Contact</a>
          </div>

          <button
            aria-label="Donate to Grays Park Masjid"
            className="min-h-[44px] bg-[#4a7856] text-white px-6 rounded-full font-medium text-sm hover:bg-[#3e6549] active:scale-[0.97] transition-all shadow-sm shadow-[#4a7856]/20 flex items-center gap-2"
          >
            <Heart className="w-4 h-4" aria-hidden="true" />
            Donate
          </button>
        </div>
      </nav>

      {/* Hero — organic curved mask, warm earth palette, calm motion */}
      <section className="relative min-h-[100dvh] flex items-center overflow-hidden pt-24">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Interior of Grays Park Masjid prayer hall" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c2a1e]/85 via-[#1c2a1e]/35 to-[#1c2a1e]/10" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1320px] px-6 w-full">
          <div
            className="max-w-xl bg-white/10 backdrop-blur-md border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] p-9 md:p-12"
            style={{ borderRadius: '2.5rem 2.5rem 2.5rem 0.75rem' }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.12] text-white"
            >
              Growing a home for faith, rooted in Thurrock.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="mt-5 text-base md:text-lg text-white/80 leading-relaxed max-w-md"
            >
              Grays Park Masjid nurtures worship, learning, and care for our neighbours — and is rebuilding to welcome even more of our community home.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <button className="min-h-[44px] bg-[#e8b34d] text-[#1c2a1e] px-7 rounded-full font-semibold hover:bg-[#dba53c] active:scale-[0.97] transition-all flex items-center gap-2">
                <Heart className="w-4 h-4" aria-hidden="true" />
                Support the Rebuild
              </button>
              <a href="#prayer-times" className="min-h-[44px] flex items-center text-white font-medium text-sm underline decoration-white/40 underline-offset-4 hover:decoration-white transition-colors">
                See today's prayer times
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Prayer Times — organic soft card, tabular numbers, generous touch spacing */}
      <section id="prayer-times" className="relative z-20 -mt-10 mx-auto max-w-[1200px] px-6">
        <div className="bg-white rounded-[2rem] shadow-xl shadow-black/5 border border-black/5 p-7 md:p-9 flex flex-col md:flex-row items-center gap-7 md:gap-10">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded-full bg-[#4a7856]/10 flex items-center justify-center text-[#4a7856]">
              <Clock className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-sm">Today's Prayers</p>
              <p className="text-xs text-[#1c2a1e]/55 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" aria-hidden="true" /> Grays, Essex
              </p>
            </div>
          </div>

          <div className="flex-1 w-full grid grid-cols-5 gap-2">
            {PRAYERS.map((p) => (
              <div key={p.name} className="text-center rounded-2xl py-2.5 hover:bg-[#4a7856]/5 transition-colors">
                <p className="text-xs text-[#1c2a1e]/55 font-medium">{p.name}</p>
                <p className="text-base md:text-lg font-semibold tabular-nums mt-0.5">{p.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Rebuild Appeal */}
      <section id="rebuild" className="py-24 md:py-28">
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
