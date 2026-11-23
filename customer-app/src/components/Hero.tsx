import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Clock, Award, Tag, Heart, Smartphone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { isRunningInApp } from '../utils/platform';

export const Hero: React.FC = () => {
  const { lang, t } = useLanguage();
  const [inApp, setInApp] = useState(false);

  useEffect(() => {
    setInApp(isRunningInApp());
  }, []);

  return (
    <section className="relative bg-gradient-to-b from-rasoi-green via-rasoi-green to-rasoi-cream pt-6 pb-12 px-4 overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rasoi-gold/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 text-white space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rasoi-gold/20 border border-rasoi-gold/40 text-rasoi-gold text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
              <Sparkles className="w-4 h-4 text-rasoi-gold" />
              <span>{lang === 'hi' ? 'मुरादाबाद का सबसे विश्वसनीय घरेलू खाना' : 'Moradabad’s Most Trusted Pure Veg Kitchen'}</span>
            </div>

            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl leading-tight text-white drop-shadow-sm">
              {lang === 'hi' ? (
                <>
                  घर का बना <span className="text-rasoi-gold">शुद्ध शाकाहारी</span> भोजन, सीधे आपकी थाली में
                </>
              ) : (
                <>
                  Wholesome <span className="text-rasoi-gold">Pure Vegetarian</span> Homemade Food, Crafted with Love
                </>
              )}
            </h2>

            <p className="text-white/85 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              {lang === 'hi'
                ? 'नीलम शर्मा जी के हाथों का बना पारंपरिक स्वाद। शुद्ध देसी घी, ताज़ा मसाले और 100% हाइजीनिक घरेलू रसोई। कांठ रोड, मुरादाबाद।'
                : 'Experience the authentic warmth of motherly cooking by Neelam Sharma. Prepared with pure desi ghee, freshly ground spices, and zero commercial preservatives.'}
            </p>

            {/* Badges Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-3 flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rasoi-gold/20 text-rasoi-gold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">100% Pure Veg</h4>
                  <p className="text-[11px] text-white/70">Desi Ghee & Fresh Veg</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-3 flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rasoi-gold/20 text-rasoi-gold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">20-30 Mins</h4>
                  <p className="text-[11px] text-white/70">Piping Hot Delivery</p>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-3 flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rasoi-gold/20 text-rasoi-gold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Panchsheel Apt</h4>
                  <p className="text-[11px] text-white/70">Kanth Rd, Moradabad</p>
                </div>
              </div>
            </div>

            {/* Free Delivery Zone Highlight */}
            <div className="bg-emerald-950/40 border border-emerald-400/40 rounded-xl p-3 flex items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Free Delivery Area</p>
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    FREE Delivery within 5 km (even on small orders like ₹65 or ₹70)! Above 5 km: ₹30.
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex flex-col text-right text-[11px] text-white/80 shrink-0">
                <span>Kitchen Helpline:</span>
                <span className="font-bold text-rasoi-gold">9997433379 / 8272072057</span>
              </div>
            </div>

            {/* Active Coupon Banner */}
            <div className="bg-rasoi-gold/15 border border-rasoi-gold/40 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-2.5">
                <Tag className="w-5 h-5 text-rasoi-gold shrink-0" />
                <div>
                  <p className="text-xs text-rasoi-gold font-bold uppercase tracking-wider">Welcome Offer</p>
                  <p className="text-xs sm:text-sm font-semibold">
                    Use code <span className="bg-rasoi-gold text-rasoi-dark px-2 py-0.5 rounded font-mono font-bold">SWAGAT50</span> for 50% off
                  </p>
                </div>
              </div>
              <span className="text-xs text-white/80 bg-white/10 px-2.5 py-1 rounded-full">
                Valid on first order
              </span>
            </div>

            {/* Android App Download Banner - ONLY SHOWN ON WEBSITE, HIDDEN INSIDE APP */}
            {!inApp && (
              <div className="pt-1 flex items-center gap-3">
                <a
                  href="https://github.com/anything-tech555/neelam-ki-gharelu-rasoi/releases/download/v1.0.1/Neelam-Ki-Gharelu-Rasoi.apk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-rasoi-dark font-bold text-xs sm:text-sm hover:bg-rasoi-gold transition-colors shadow-md group"
                >
                  <Smartphone className="w-4 h-4 text-rasoi-green group-hover:text-rasoi-dark transition-colors" />
                  <span>Download Android App</span>
                  <span className="text-[10px] bg-rasoi-gold/30 text-rasoi-dark px-1.5 py-0.5 rounded font-mono font-semibold">APK</span>
                </a>
                <span className="text-xs text-white/70 hidden sm:inline">
                  Install on mobile for fast ordering
                </span>
              </div>
            )}
          </div>

          {/* Right Visual Image Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 group">
              <img
                src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80"
                alt="Royal Shahi Paneer Thali"
                className="w-full h-72 sm:h-80 object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="veg-badge"></span>
                  <span className="bg-rasoi-gold text-rasoi-dark font-bold text-xs px-2 py-0.5 rounded-full">
                    Customer Favorite
                  </span>
                </div>
                <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
                  Royal Shahi Paneer Thali
                </h3>
                <p className="text-xs sm:text-sm text-gray-200 mt-1 line-clamp-2">
                  Slow-simmered shahi paneer in pure desi ghee, dal makhani, butter rotis, jeera rice & gulab jamun.
                </p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/20">
                  <span className="font-heading font-bold text-rasoi-gold text-xl">₹149 <span className="text-xs line-through text-white/60 font-normal">₹160</span></span>
                  <span className="text-xs bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rasoi-red fill-rasoi-red" />
                    420+ Ordered
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
