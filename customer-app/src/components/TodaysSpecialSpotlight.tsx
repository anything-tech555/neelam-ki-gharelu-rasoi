import React from 'react';
import { Sparkles, Star, Clock, Plus, Minus, ArrowRight, Eye, ShieldCheck, Heart } from 'lucide-react';
import { FoodItem } from '../types/shared';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface TodaysSpecialSpotlightProps {
  specialItem: FoodItem | null;
  onOpenDishDetail: (item: FoodItem) => void;
}

export const TodaysSpecialSpotlight: React.FC<TodaysSpecialSpotlightProps> = ({ specialItem, onOpenDishDetail }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const { lang, t } = useLanguage();

  if (!specialItem) return null;

  const cartEntry = cart.find(i => i.id === specialItem.id);
  const quantity = cartEntry ? cartEntry.quantity : 0;
  const isAvailable = specialItem.isAvailable !== false;
  const activePrice = specialItem.discountPrice !== undefined ? specialItem.discountPrice : specialItem.price;

  const gallery = specialItem.galleryImages && specialItem.galleryImages.length > 0
    ? specialItem.galleryImages
    : [specialItem.imageUrl];

  return (
    <section className="max-w-7xl mx-auto px-4 pt-6 pb-4">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rasoi-green via-emerald-800 to-teal-900 text-white shadow-2xl border-2 border-rasoi-gold/40">
        {/* Decorative background blurs */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-rasoi-gold/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-green-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text / Info (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rasoi-gold text-rasoi-dark font-heading font-extrabold text-xs sm:text-sm tracking-wide shadow-md animate-pulse">
              <Sparkles className="w-4 h-4 fill-rasoi-dark text-rasoi-dark" />
              <span>{lang === 'hi' ? 'आज की खास पेशकश • TODAY’S SPECIAL' : 'TODAY’S SPECIAL • आज की खास पेशकश'}</span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="veg-badge !w-4 !h-4" title="Pure Veg"></span>
                <span className="text-xs uppercase tracking-wider text-rasoi-gold font-bold">
                  {specialItem.categoryName || 'Chef’s Special Recipe'}
                </span>
              </div>
              <h3 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight">
                {specialItem.name}
              </h3>
              {specialItem.hindiName && (
                <p className="text-base sm:text-lg text-rasoi-gold font-medium mt-0.5">
                  {specialItem.hindiName}
                </p>
              )}
            </div>

            <p className="text-white/85 text-xs sm:text-sm leading-relaxed max-w-xl">
              {lang === 'hi' && specialItem.hindiDescription ? specialItem.hindiDescription : specialItem.description}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/90 pt-1">
              <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
                <Clock className="w-4 h-4 text-rasoi-gold" />
                <span>Prep: ~{specialItem.prepTimeMinutes || 25} mins</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
                <Star className="w-4 h-4 fill-rasoi-gold text-rasoi-gold" />
                <span>{specialItem.rating || 4.9} ({specialItem.ratingCount || 420}+ Reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span>Pure Desi Ghee</span>
              </div>
            </div>

            {/* Price & Call-To-Action Row */}
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-white/20">
              <div className="flex items-baseline gap-2">
                <span className="font-heading font-black text-3xl text-rasoi-gold">
                  ₹{activePrice}
                </span>
                {specialItem.discountPrice !== undefined && specialItem.discountPrice < specialItem.price && (
                  <span className="text-sm text-white/60 line-through">
                    ₹{specialItem.price}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {/* Click to open Big Screen view */}
                <button
                  type="button"
                  onClick={() => onOpenDishDetail(specialItem)}
                  className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold text-xs sm:text-sm flex items-center gap-2 backdrop-blur-sm transition-all hover:scale-105 active:scale-95 shadow-md"
                >
                  <Eye className="w-4 h-4 text-rasoi-gold" />
                  <span>View Photos & Details</span>
                </button>

                {/* Add to Cart button */}
                {isAvailable ? (
                  quantity > 0 ? (
                    <div className="flex items-center bg-rasoi-gold text-rasoi-dark rounded-xl font-bold shadow-md">
                      <button
                        type="button"
                        onClick={() => updateQuantity(specialItem.id, -1)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-black/10 rounded-l-xl transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 font-heading font-black text-sm">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(specialItem.id, 1)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-black/10 rounded-r-xl transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addToCart(specialItem)}
                      className="px-5 py-2.5 rounded-xl bg-rasoi-gold hover:bg-white text-rasoi-dark font-heading font-extrabold text-xs sm:text-sm shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                    >
                      <span>Order Today's Special</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )
                ) : (
                  <span className="text-xs bg-white/20 px-3 py-1.5 rounded-lg text-white font-bold">Sold Out Today</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Visual Image Card (5 Cols) with Click to Big Screen */}
          <div className="lg:col-span-5 relative">
            <div
              onClick={() => onOpenDishDetail(specialItem)}
              className="relative mx-auto max-w-sm rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30 cursor-pointer group transition-transform duration-300 hover:scale-[1.02]"
            >
              <img
                src={specialItem.imageUrl}
                alt={specialItem.name}
                className="w-full h-64 sm:h-72 object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />

              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <span className="px-4 py-2 rounded-xl bg-rasoi-gold text-rasoi-dark font-heading font-extrabold text-xs shadow-xl flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <Eye className="w-4 h-4" />
                  <span>Click to Open Big Screen</span>
                </span>
              </div>

              {/* Photo count pill */}
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-rasoi-gold" />
                <span>{gallery.length > 1 ? `${gallery.length} Photos (Click to Zoom)` : 'Click for Big View'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
