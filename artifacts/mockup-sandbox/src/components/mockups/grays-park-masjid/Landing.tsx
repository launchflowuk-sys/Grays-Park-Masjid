import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Clock, ArrowUpRight, Phone, Mail } from 'lucide-react';

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

export default function GraysParkMasjidLanding() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground selection:bg-primary/20">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
          scrolled ? 'bg-background/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="mx-auto px-6 max-w-[1400px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Grays Park Masjid" className="h-10 w-auto object-contain" />
            <span className={`hidden md:block font-semibold tracking-tight ${scrolled ? 'text-foreground' : 'text-white'}`}>
              Grays Park Masjid
            </span>
          </div>

          <div className={`hidden md:flex items-center gap-9 text-sm font-medium ${scrolled ? 'text-foreground/80' : 'text-white/85'}`}>
            <a href="#rebuild" className="hover:opacity-70 transition-opacity">The Rebuild</a>
            <a href="#prayer-times" className="hover:opacity-70 transition-opacity">Prayer Times</a>
            <a href="#programs" className="hover:opacity-70 transition-opacity">Programs</a>
            <a href="#contact" className="hover:opacity-70 transition-opacity">Contact</a>
          </div>

          <button className="bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold tracking-tight hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2">
            Donate
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero — asymmetric split, no centered pill hero */}
      <section className="relative grid lg:grid-cols-[1.05fr_0.95fr] min-h-[100dvh]">
        <div className="relative bg-[#0d1f13] text-white flex flex-col justify-center px-6 lg:pl-16 lg:pr-14 pt-28 pb-16 lg:pt-24 order-2 lg:order-1">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 0, transparent 45%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.3) 0, transparent 40%)',
            }}
          />
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative text-4xl md:text-5xl lg:text-[3.4rem] font-semibold tracking-tight leading-[1.08] max-w-xl"
          >
            A house of prayer, built by the community it serves.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="relative mt-6 text-base md:text-lg text-white/70 max-w-md leading-relaxed"
          >
            Grays Park Masjid serves Thurrock's Muslim community with daily prayer, education, and welfare — and is now rebuilding to serve the next generation.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="relative mt-9 flex flex-wrap items-center gap-4"
          >
            <button className="bg-primary text-primary-foreground px-7 py-3.5 font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Support the Rebuild
            </button>
            <a href="#prayer-times" className="text-white/80 font-medium text-sm border-b border-white/30 pb-0.5 hover:text-white hover:border-white/70 transition-colors">
              See today's prayer times
            </a>
          </motion.div>

          <div className="relative mt-14 grid grid-cols-3 max-w-md border-t border-white/15 pt-6">
            <div>
              <p className="text-2xl font-semibold">1,500+</p>
              <p className="text-xs text-white/50 mt-1">Worshippers served</p>
            </div>
            <div className="border-l border-white/15 pl-6">
              <p className="text-2xl font-semibold">30+</p>
              <p className="text-xs text-white/50 mt-1">Years in Grays</p>
            </div>
            <div className="border-l border-white/15 pl-6">
              <p className="text-2xl font-semibold">52%</p>
              <p className="text-xs text-white/50 mt-1">Rebuild funded</p>
            </div>
          </div>
        </div>

        <div className="relative order-1 lg:order-2 min-h-[46vh] lg:min-h-0">
          <img src={heroImage} alt="Grays Park Masjid" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f13]/60 via-transparent to-transparent lg:bg-gradient-to-l lg:from-[#0d1f13]/0 lg:via-transparent lg:to-transparent" />
        </div>
      </section>

      {/* Prayer Times — full-width band, tied to hero, not a floating pill card */}
      <section id="prayer-times" className="bg-[#f4f2ec] border-b border-black/5">
        <div className="mx-auto max-w-[1400px] px-6 py-8 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          <div className="flex items-center gap-3 shrink-0">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="font-semibold text-sm leading-none">Today's Prayers</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Grays, Essex
              </p>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-5 divide-x divide-black/10 border-l border-black/10">
            {PRAYERS.map((p) => (
              <div key={p.name} className="text-center px-2">
                <p className="text-xs text-muted-foreground font-medium">{p.name}</p>
                <p className="text-base md:text-lg font-semibold tabular-nums mt-0.5">{p.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Rebuild Appeal */}
      <section id="rebuild" className="py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 grid lg:grid-cols-[0.95fr_1.05fr] gap-14 lg:gap-20 items-center">
          <div className="relative order-2 lg:order-1">
            <img
              src={rebuildImage}
              alt="Architectural render of the rebuilt mosque"
              className="w-full object-cover aspect-[4/3]"
            />
            <div className="absolute -bottom-px left-0 right-0 h-2 bg-primary" />
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-[1.1] mb-6 max-w-lg">
              Phase one is complete. Phase two needs you.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-10 max-w-lg">
              We have raised £1,050,000 toward expanded prayer halls, a dedicated sisters' section, youth classrooms, and a community hub — the final phase of the rebuild.
            </p>

            <div className="border border-border p-7 mb-8">
              <div className="flex justify-between items-baseline mb-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.14em]">Raised</p>
                  <p className="text-2xl font-semibold text-primary mt-1">£1,050,000</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.14em]">Target</p>
                  <p className="text-lg font-semibold mt-1">£2,000,000</p>
                </div>
              </div>
              <div className="w-full bg-secondary h-2">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '52%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="bg-primary h-full"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3">52% of the final goal raised so far.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="bg-foreground text-background px-7 py-3.5 font-semibold hover:bg-foreground/90 active:scale-[0.98] transition-all">
                Donate £100
              </button>
              <button className="border border-foreground px-7 py-3.5 font-semibold hover:bg-foreground hover:text-background active:scale-[0.98] transition-all">
                Choose an amount
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Programs — asymmetric bento, not equal cards */}
      <section id="programs" className="py-24 md:py-28 bg-[#0d1f13] text-white">
        <div className="mx-auto max-w-[1400px] px-6">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-lg mb-14">
            More than a place to pray.
          </h2>

          <div className="grid md:grid-cols-3 gap-px bg-white/10">
            <div className="md:col-span-2 md:row-span-2 relative min-h-[360px] bg-[#0d1f13] group overflow-hidden">
              <img
                src={communityImage}
                alt="Community gathering at Grays Park Masjid"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f13] via-[#0d1f13]/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="text-xl font-semibold mb-2">Join our growing family</h3>
                <p className="text-white/70 text-sm max-w-xs mb-4">
                  Everyone is welcome, from first prayer to lifelong member.
                </p>
                <a href="#" className="inline-flex items-center gap-1.5 text-sm font-medium border-b border-white/40 pb-0.5 hover:border-white transition-colors">
                  View events <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="bg-[#0d1f13] p-8 flex flex-col justify-between min-h-[176px]">
              <h3 className="text-lg font-semibold">Madrassah</h3>
              <p className="text-white/60 text-sm leading-relaxed mt-2">
                Islamic education for ages 5–16: Qur'anic recitation, studies, and character development.
              </p>
            </div>

            <div className="bg-[#0d1f13] p-8 flex flex-col justify-between min-h-[176px]">
              <h3 className="text-lg font-semibold">Community Welfare</h3>
              <p className="text-white/60 text-sm leading-relaxed mt-2">
                A food bank, counselling, and welfare support for families across Thurrock.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#f4f2ec] pt-16 pb-8">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-14">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <img src={logoImage} alt="Grays Park Masjid" className="h-9 w-auto object-contain" />
                <span className="font-semibold tracking-tight">Grays Park Masjid</span>
              </div>
              <p className="text-muted-foreground max-w-sm leading-relaxed mb-5 text-sm">
                A spiritual home serving the Muslim community of Thurrock, Essex, through worship, education, and welfare.
              </p>
              <div className="flex items-start gap-2.5 text-sm text-foreground/80">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Grays Park Masjid, Grays, Essex, United Kingdom</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-5">Quick Links</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#rebuild" className="hover:text-primary transition-colors">The Rebuild</a></li>
                <li><a href="#prayer-times" className="hover:text-primary transition-colors">Prayer Timetable</a></li>
                <li><a href="#programs" className="hover:text-primary transition-colors">Madrassah</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Donate</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-5">Contact</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-primary" /> 01375 000 000
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-primary" /> info@graysparkmasjid.org
                </li>
              </ul>
              <p className="text-xs text-muted-foreground mt-6">Registered UK Charity No. 1123456</p>
            </div>
          </div>

          <div className="border-t border-black/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Grays Park Masjid. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
