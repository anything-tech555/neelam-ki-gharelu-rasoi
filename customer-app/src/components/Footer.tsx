import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Clock, ShieldCheck, Heart, Sparkles, Navigation, Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { isRunningInApp } from '../utils/platform';

export const Footer: React.FC = () => {
  const { lang, t } = useLanguage();
  const [inApp, setInApp] = useState(false);

  useEffect(() => {
    setInApp(isRunningInApp());
  }, []);

  return (
    <footer className="bg-rasoi-dark text-white border-t border-rasoi-green/40 pt-12 pb-24 sm:pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand & Commitment */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-full bg-rasoi-gold/20 border border-rasoi-gold p-1 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path d="M25 45 C25 72, 75 72, 75 45 Z" fill="#F2B01E"/>
                  <path d="M50 20 C42 28, 42 36, 50 40 C58 36, 58 28, 50 20 Z" fill="#5ac28a"/>
                </svg>
              </span>
              <h3 className="font-heading font-extrabold text-lg text-white">
                Neelam Ki Gharelu Rasoi
              </h3>
            </div>
            <p className="text-xs text-rasoi-gold font-medium">
              नीलम की घरेलू रसोई • शुद्ध शाकाहारी भोजन
            </p>
            <p className="text-xs text-white/70 leading-relaxed">
              Wholesome home-cooked vegetarian delights prepared daily using handpicked ingredients, pure desi ghee, and motherly care.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="veg-badge"></span>
              <span className="text-xs font-bold text-green-400">100% PURE VEGETARIAN</span>
            </div>

            {/* ONLY SHOWN ON WEBSITE, HIDDEN INSIDE INSTALLED APP */}
            {!inApp && (
              <div className="pt-2">
                <a
                  href="./Neelam-Ki-Gharelu-Rasoi.apk"
                  download="Neelam-Ki-Gharelu-Rasoi.apk"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rasoi-gold text-rasoi-dark font-bold text-xs hover:bg-white transition-all shadow-sm hover:shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Android App (APK)
                </a>
              </div>
            )}
          </div>

          {/* Col 2: Business Address */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-rasoi-gold uppercase tracking-wider">
              Kitchen Address
            </h4>
            <div className="space-y-2 text-xs text-white/80">
              <p className="font-medium text-white flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-rasoi-gold shrink-0 mt-0.5" />
                <span>P S 31, Panchsheel Apartment, Kanth Road, Moradabad, Uttar Pradesh, 244001</span>
              </p>
              <p className="text-white/60 pl-5">
                Landmark: Near Main Entrance, Kanth Road corridor
              </p>
              <div className="pt-1 pl-5">
                <span className="text-[11px] bg-emerald-900/60 border border-emerald-500/40 px-2 py-0.5 rounded text-emerald-300 font-bold">
                  FREE Delivery within 5 km!
                </span>
              </div>
            </div>
          </div>

          {/* Col 3: Direct Helplines */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-rasoi-gold uppercase tracking-wider">
              Direct Kitchen Helpline
            </h4>
            <div className="space-y-2.5 text-xs text-white/80">
              <a
                href="tel:9997433379"
                className="flex items-center gap-2 text-white hover:text-rasoi-gold transition-colors font-bold text-sm"
              >
                <div className="p-1.5 rounded-lg bg-white/10 text-rasoi-gold">
                  <Phone className="w-4 h-4" />
                </div>
                <span>+91 9997433379</span>
              </a>

              <a
                href="tel:8272072057"
                className="flex items-center gap-2 text-white hover:text-rasoi-gold transition-colors font-bold text-sm"
              >
                <div className="p-1.5 rounded-lg bg-white/10 text-rasoi-gold">
                  <Phone className="w-4 h-4" />
                </div>
                <span>+91 8272072057</span>
              </a>

              <div className="flex items-center gap-2 pt-1 text-white/70">
                <Clock className="w-4 h-4 text-rasoi-gold shrink-0" />
                <span>7:00 AM – 10:30 PM (7 Days a Week)</span>
              </div>
            </div>
          </div>

          {/* Col 4: Safe Food Promises */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-rasoi-gold uppercase tracking-wider">
              Our Purity Promise
            </h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                <span>100% Desi Ghee Preparation</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                <span>Zero Commercial Preservatives</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                <span>Fresh Vegetables Cooked Daily</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                <span>Hygienic Eco-Friendly Packaging</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/10 text-center text-xs text-white/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Neelam Ki Gharelu Rasoi. All Rights Reserved. Moradabad, UP.</p>
          <p className="flex items-center gap-1 text-rasoi-gold">
            <span>शुद्ध शाकाहारी घरेलू भोजन • स्वाद अपनों जैसा</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
