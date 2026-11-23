import React from 'react';
import { Phone, MapPin, Clock, ShieldCheck, Heart, Sparkles, Navigation, Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { lang, t } = useLanguage();

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
              Wholesome home-cooked vegetarian delights prepared daily using handpicked ingredients, desi ghee, and motherly care.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="veg-badge"></span>
              <span className="text-xs font-bold text-green-400">100% PURE VEGETARIAN</span>
            </div>
            <div className="pt-2">
              <a
                href="/Neelam-Ki-Gharelu-Rasoi.apk"
                download="Neelam-Ki-Gharelu-Rasoi.apk"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rasoi-gold text-rasoi-dark font-bold text-xs hover:bg-white transition-all shadow-sm hover:shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                Download Android App (APK)
              </a>
            </div>
          </div>

          {/* Col 2: Business Address */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-rasoi-gold uppercase tracking-wider">
              Our Kitchen Address
            </h4>
            <div className="flex items-start gap-2 text-xs text-white/80">
              <MapPin className="w-4 h-4 text-rasoi-gold shrink-0 mt-0.5" />
              <address className="not-italic leading-relaxed">
                P S 31, Panchsheel Apartment,<br />
                Kanth Road, Moradabad,<br />
                Uttar Pradesh - 244001, India
              </address>
            </div>
            <div className="pt-1">
              <a
                href="https://maps.google.com/?q=Panchsheel+Apartment+Kanth+Road+Moradabad"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-rasoi-gold hover:underline font-semibold"
              >
                <Navigation className="w-3.5 h-3.5" />
                View on Google Maps
              </a>
            </div>
          </div>

          {/* Col 3: Contact & Timings */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-rasoi-gold uppercase tracking-wider">
              Official Helpline
            </h4>
            <div className="space-y-2 text-xs text-white/80">
              <a href="tel:9997433379" className="flex items-center gap-2 hover:text-rasoi-gold transition-colors font-bold text-sm text-white">
                <Phone className="w-4 h-4 text-rasoi-gold" />
                <span>+91 9997433379</span>
              </a>
              <a href="tel:8272072057" className="flex items-center gap-2 hover:text-rasoi-gold transition-colors font-bold text-sm text-white">
                <Phone className="w-4 h-4 text-rasoi-gold" />
                <span>+91 8272072057</span>
              </a>
              <div className="flex items-center gap-2 pt-1">
                <Clock className="w-4 h-4 text-rasoi-gold" />
                <span>Open: 7:00 AM – 10:30 PM (All 7 Days)</span>
              </div>
              <p className="text-[11px] text-white/60">
                Breakfast: 7 AM - 11 AM<br />
                Lunch: 12 PM - 3:30 PM<br />
                Dinner: 7 PM - 10:30 PM
              </p>
            </div>
          </div>

          {/* Col 4: Trust & Guarantee */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-rasoi-gold uppercase tracking-wider">
              Homemade Hygiene Pledge
            </h4>
            <div className="space-y-2 text-xs text-white/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
                <span>No Artificial Colors or Preservatives</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
                <span>Prepared in Clean Domestic Kitchen</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
                <span>Safe Tamper-Proof Thermal Packing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-3">
          <p>
            © {new Date().getFullYear()} Neelam Ki Gharelu Rasoi. All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rasoi-red fill-rasoi-red" /> for food lovers in Moradabad
          </p>
        </div>
      </div>
    </footer>
  );
};
