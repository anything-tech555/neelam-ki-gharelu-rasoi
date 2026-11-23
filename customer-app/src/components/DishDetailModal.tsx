import React, { useState, useEffect } from 'react';
import { X, Star, Clock, Plus, Minus, ShieldCheck, Heart, Sparkles, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { FoodItem } from '../types/shared';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface DishDetailModalProps {
  item: FoodItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({ item, isOpen, onClose }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const { lang, t } = useLanguage();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Reset selected photo when item changes
  useEffect(() => {
    setSelectedPhotoIndex(0);
  }, [item]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  // Prepare photo gallery: primary image + any gallery images, fallback to duplicates/angles if empty
  const gallery = item.galleryImages && item.galleryImages.length > 0
    ? item.galleryImages
    : [
        item.imageUrl,
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80'
      ];

  const currentPhoto = gallery[selectedPhotoIndex] || item.imageUrl;

  const cartEntry = cart.find(i => i.id === item.id);
  const quantity = cartEntry ? cartEntry.quantity : 0;
  const isAvailable = item.isAvailable !== false;
  const activePrice = item.discountPrice !== undefined ? item.discountPrice : item.price;
  const hasDiscount = item.discountPrice !== undefined && item.discountPrice < item.price;
  const discountPercent = hasDiscount ? Math.round(((item.price - item.discountPrice!) / item.price) * 100) : 0;

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPhotoIndex((prev) => (prev + 1) % gallery.length);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPhotoIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-transform hover:scale-105 active:scale-95"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto">
          {/* Big Photo & Gallery Left Column */}
          <div className="md:col-span-7 bg-neutral-900 flex flex-col justify-between relative group">
            {/* Main Active Photo */}
            <div className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden bg-black flex items-center justify-center">
              <img
                src={currentPhoto}
                alt={item.name}
                className="w-full h-full object-cover transition-all duration-500 ease-out"
              />

              {/* Badges on main image */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                <span className="veg-badge !w-6 !h-6 shadow-md" title="100% Pure Vegetarian"></span>
                {item.isSpecial && (
                  <span className="bg-gradient-to-r from-rasoi-gold to-amber-500 text-rasoi-dark text-xs font-heading font-extrabold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Special Today</span>
                  </span>
                )}
                {hasDiscount && (
                  <span className="bg-rasoi-red text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Photo Navigation Arrows if multiple photos */}
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={handlePrevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Photo index counter */}
              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-rasoi-gold" />
                <span>Photo {selectedPhotoIndex + 1} of {gallery.length}</span>
              </div>
            </div>

            {/* Thumbnail Row */}
            {gallery.length > 1 && (
              <div className="p-3 bg-neutral-950 flex items-center gap-2.5 overflow-x-auto no-scrollbar border-t border-white/10">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      selectedPhotoIndex === idx
                        ? 'border-rasoi-gold scale-105 shadow-md shadow-rasoi-gold/30'
                        : 'border-white/20 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${item.name} angle ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Action Right Column */}
          <div className="md:col-span-5 p-6 flex flex-col justify-between space-y-6 bg-white">
            <div className="space-y-4">
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-heading font-bold text-rasoi-green uppercase tracking-wider text-xs">
                  {item.categoryName || 'Homemade Kitchen'}
                </span>
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-amber-900 font-bold">
                  <Star className="w-3.5 h-3.5 fill-rasoi-gold text-rasoi-gold" />
                  <span>{item.rating || 4.9}</span>
                  <span className="text-gray-400 font-normal">({item.ratingCount || 150}+ orders)</span>
                </div>
              </div>

              {/* Dish Titles */}
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-gray-900 leading-tight">
                  {item.name}
                </h2>
                {item.hindiName && (
                  <p className="text-sm font-semibold text-rasoi-goldDark mt-0.5">
                    {item.hindiName}
                  </p>
                )}
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-2.5 pt-1">
                <span className="font-heading font-extrabold text-3xl text-rasoi-green">
                  ₹{activePrice}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-gray-400 line-through">
                      ₹{item.price}
                    </span>
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                      Save ₹{item.price - item.discountPrice!}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2 border-t border-gray-100 pt-3">
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-500">
                  About This Dish
                </h4>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {item.description}
                </p>
                {item.hindiDescription && (
                  <p className="text-xs text-gray-600 bg-rasoi-cream p-3 rounded-xl border border-rasoi-line/60 leading-relaxed font-medium">
                    {item.hindiDescription}
                  </p>
                )}
              </div>

              {/* Kitchen Badges */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-gray-600">
                <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg border border-gray-100">
                  <Clock className="w-4 h-4 text-rasoi-gold shrink-0" />
                  <span>Fresh Prep: ~{item.prepTimeMinutes || 20} mins</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg border border-gray-100">
                  <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                  <span>100% Desi Ghee & Fresh</span>
                </div>
              </div>
            </div>

            {/* Bottom Add to Cart Section */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              {isAvailable ? (
                <div className="flex items-center gap-3">
                  {quantity > 0 ? (
                    <div className="flex items-center justify-between bg-rasoi-green text-white rounded-xl shadow-md p-1 flex-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-rasoi-dark rounded-lg transition-colors"
                        aria-label="Decrease"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-heading font-extrabold text-base px-4">
                        {quantity} in Cart (₹{quantity * activePrice})
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-rasoi-dark rounded-lg transition-colors"
                        aria-label="Increase"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="w-full py-3.5 px-6 rounded-xl bg-rasoi-green hover:bg-rasoi-dark text-white font-heading font-bold text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-between"
                    >
                      <span>Add to Order</span>
                      <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">₹{activePrice}</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 font-bold text-sm cursor-not-allowed text-center"
                >
                  Currently Sold Out
                </button>
              )}

              <p className="text-[11px] text-gray-500 text-center">
                🛵 Free delivery within 5 km on all orders • Helpline: 9997433379 / 8272072057
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
