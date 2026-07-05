import React, { useEffect, useState } from 'react';
import { Heart, MapPin, Clock, ArrowRight, BookOpen, Users, Sun, Moon, Sparkles, Phone, Mail } from 'lucide-react';

// Using relative imports for the generated assets and provided logo
import heroImage from '../../../assets/hero-mosque.png';
import rebuildImage from '../../../assets/rebuild-render.png';
import communityImage from '../../../assets/community.png';
// Adjusted path to the logo (mockups/grays-park-masjid -> mockups -> components -> src -> mockup-sandbox -> artifacts -> root -> attached_assets)
import logoImage from '../../../../../../attached_assets/branding/grayspark_logo.png';

export default function GraysParkMasjidLanding() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground selection:bg-primary/20">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-md shadow-sm py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Grays Park Masjid Logo" className="h-12 w-auto object-contain" />
            <div className={`hidden md:block font-serif font-medium leading-tight ${scrolled ? 'text-foreground' : 'text-white'}`}>
              <span className="block text-lg">Grays Park</span>
              <span className="block text-sm opacity-80">Masjid</span>
            </div>
          </div>
          
          <div className={`hidden md:flex items-center gap-8 font-medium text-sm ${scrolled ? 'text-foreground' : 'text-white/90'}`}>
            <a href="#about" className="hover:opacity-70 transition-opacity">About Us</a>
            <a href="#prayer-times" className="hover:opacity-70 transition-opacity">Prayer Times</a>
            <a href="#rebuild" className="hover:opacity-70 transition-opacity">The Rebuild</a>
            <a href="#programs" className="hover:opacity-70 transition-opacity">Programs</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full font-medium text-sm transition-all shadow-sm flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Donate Now</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Beautiful mosque interior" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/30 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10 pt-12 pb-24">
          <div className="max-w-2xl animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 backdrop-blur-md text-white border border-primary/30 mb-6 text-sm font-medium">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
              <span>Phase 2 Rebuild in Progress</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif text-white leading-tight mb-6">
              A spiritual home for the <span className="text-primary-foreground italic">Thurrock</span> community.
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-xl leading-relaxed">
              We are building more than just walls. We are building a sanctuary for worship, learning, and connection. Join us in completing Grays Park Masjid.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-medium text-lg transition-all shadow-lg flex items-center justify-center gap-2 group">
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Support the Rebuild</span>
              </button>
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full font-medium text-lg transition-all border border-white/20 flex items-center justify-center gap-2">
                <span>View Prayer Times</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Prayer Times Bar */}
      <section id="prayer-times" className="relative z-20 -mt-16 container mx-auto px-6 max-w-6xl animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="bg-white rounded-[2rem] shadow-xl border border-border/50 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4 min-w-max">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold">Today's Prayers</h3>
              <p className="text-sm text-muted-foreground">Grays, Essex • 12 Rabi' al-Awwal 1446</p>
            </div>
          </div>
          
          <div className="flex-1 w-full flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
            {[
              { name: 'Fajr', time: '05:12 AM', icon: Moon },
              { name: 'Zuhr', time: '01:05 PM', icon: Sun },
              { name: 'Asr', time: '04:30 PM', icon: Sun },
              { name: 'Maghrib', time: '07:15 PM', icon: Sun },
              { name: 'Isha', time: '08:45 PM', icon: Moon },
            ].map((prayer, i) => (
              <div key={prayer.name} className="flex-1 min-w-[100px] text-center p-3 rounded-2xl hover:bg-secondary/50 transition-colors">
                <p className="text-sm text-muted-foreground font-medium mb-1">{prayer.name}</p>
                <p className="font-serif text-lg font-semibold text-foreground">{prayer.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Rebuild Appeal */}
      <section id="rebuild" className="py-24 md:py-32 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary mb-6 text-sm font-medium">
                <BookOpen className="w-4 h-4" />
                <span>The Rebuild Project</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif mb-6 text-foreground leading-tight">
                Help us build a legacy for generations to come.
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Alhamdulillah, we have successfully completed Phase 1 of our major rebuild. Now, we urgently need your support to raise the final £1,000,000 for Phase 2. This will provide expanded prayer halls, educational facilities for our youth, and a welcoming community hub.
              </p>

              {/* Progress Bar */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-border mb-8">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Raised so far</p>
                    <p className="text-3xl font-serif text-primary font-semibold">£1,050,000</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground font-medium mb-1">Target</p>
                    <p className="text-xl font-serif text-foreground font-medium">£2,000,000</p>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-4 mb-3 overflow-hidden">
                  <div className="bg-primary h-full rounded-full w-[52%] relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" style={{
                      backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                      transform: 'skewX(-20deg)'
                    }}></div>
                  </div>
                </div>
                <p className="text-sm text-center text-muted-foreground">We are 52% towards our final goal.</p>
              </div>

              <div className="flex gap-4">
                <button className="bg-foreground hover:bg-foreground/90 text-background px-8 py-4 rounded-full font-medium transition-all shadow-md flex-1 text-center text-lg">
                  Donate £100
                </button>
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-medium transition-all shadow-md flex-1 text-center text-lg flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5" />
                  Other Amount
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] transform rotate-3 scale-105 transition-transform duration-700 hover:rotate-0"></div>
              <img 
                src={rebuildImage} 
                alt="Architectural render of the new mosque" 
                className="relative rounded-[2.5rem] shadow-2xl w-full object-cover aspect-[4/3] transform transition-transform duration-700 hover:scale-[1.02]"
              />
              
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-xl border border-border max-w-xs animate-fade-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-foreground">Capacity</h4>
                    <p className="text-sm text-muted-foreground">Expanded to 1,500+</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Dedicated spaces for sisters, youth classrooms, and community events.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="programs" className="py-24 bg-secondary/30 relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-serif mb-6 text-foreground">More than just a place to pray.</h2>
            <p className="text-lg text-muted-foreground">
              Grays Park Masjid is the beating heart of the local Muslim community. We offer comprehensive services from authentic Islamic education to community support and welfare.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-border/50 hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-3 text-foreground">Madrassah</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Structured Islamic education for children aged 5-16, teaching Quranic recitation, Islamic studies, and character development.
              </p>
              <a href="#" className="text-primary font-medium flex items-center gap-2 hover:gap-3 transition-all">
                Learn more <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-border/50 hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-3 text-foreground">Community Welfare</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Supporting the vulnerable in Thurrock through our food bank, counseling services, and regular community welfare initiatives.
              </p>
              <a href="#" className="text-primary font-medium flex items-center gap-2 hover:gap-3 transition-all">
                Learn more <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="relative rounded-[2rem] overflow-hidden shadow-sm group">
              <img src={communityImage} alt="Community gathering" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="text-2xl font-serif text-white mb-2">Join our growing family.</h3>
                <p className="text-white/80 mb-4 text-sm">Everyone is welcome at Grays Park.</p>
                <button className="bg-white/20 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/30 transition-colors">
                  View Events
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background pt-20 pb-10 border-t-[8px] border-primary">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white p-2 rounded-xl">
                  <img src={logoImage} alt="Grays Park Masjid Logo" className="h-10 w-auto object-contain brightness-0" />
                </div>
                <div className="font-serif font-medium leading-tight text-white">
                  <span className="block text-xl">Grays Park</span>
                  <span className="block text-sm opacity-80 text-primary">Masjid & Islamic Centre</span>
                </div>
              </div>
              <p className="text-white/60 max-w-sm mb-6 leading-relaxed">
                A welcoming spiritual home serving the Muslim community of Thurrock, Essex. Dedicated to worship, education, and community service.
              </p>
              <div className="flex items-start gap-3 text-white/80 mb-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Grays Park Masjid, Grays<br/>Essex, United Kingdom</span>
              </div>
            </div>

            <div>
              <h4 className="font-serif text-lg font-semibold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-white/60 hover:text-primary transition-colors">About the Rebuild</a></li>
                <li><a href="#" className="text-white/60 hover:text-primary transition-colors">Prayer Timetable</a></li>
                <li><a href="#" className="text-white/60 hover:text-primary transition-colors">Madrassah Admissions</a></li>
                <li><a href="#" className="text-white/60 hover:text-primary transition-colors">Make a Donation</a></li>
                <li><a href="#" className="text-white/60 hover:text-primary transition-colors">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-lg font-semibold mb-6 text-white">Contact</h4>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="flex items-center gap-3 text-white/60 hover:text-primary transition-colors">
                    <Phone className="w-5 h-5" />
                    <span>01375 000 000</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-3 text-white/60 hover:text-primary transition-colors">
                    <Mail className="w-5 h-5" />
                    <span>info@graysparkmasjid.org</span>
                  </a>
                </li>
              </ul>
              
              <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-sm text-white/60">Registered UK Charity No.</p>
                <p className="font-mono text-primary font-medium mt-1">1123456</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
            <p>&copy; {new Date().getFullYear()} Grays Park Masjid. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
