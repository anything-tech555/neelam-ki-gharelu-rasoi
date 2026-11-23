import React from 'react';
import { Plus, Minus, Star, Clock, Eye } from 'lucide-react';
import { FoodItem } from '../types/shared';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface FoodCardProps {
  item: FoodItem;
  onSelect: (item: FoodItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, onSelect }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const { lang, t } = useLanguage();

  const cartEntry = cart.find(i => i.id === item.id);
  const quantity = cartEntry ? cartEntry.quantity : 0;
  const isAvailable = item.isAvailable !== false;

  return (
    <div
      onClick={() => onSelect(item)}
      className={`bg-white rounded-2xl overflow-hidden border border-rasoi-line/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:-translate-y-1 ${!isAvailable ? 'opacity-65' : ''}`}
    >
      <div>
        {/* Dish Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          />

          {/* Hover overlay hint */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
            <span className="px-3 py-1.5 rounded-full bg-white/95 text-gray-900 font-heading font-extrabold text-xs shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
              <Eye className="w-3.5 h-3.5 text-rasoi-green" />
              <span>{lang === 'hi' ? 'बड़ा देखें व फोटो' : 'View Big & Photos'}</span>
            </span>
          </div>

          {/* Badges on Top of Image */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
            <span className="veg-badge shadow-sm" title="Pure Vegetarian"></span>
            {item.isSpecial && (
              <span className="bg-rasoi-gold text-rasoi-dark text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                {lang === 'hi' ? 'विशेष' : 'Special'}
              </span>
            )}
          </div>

          {/* Prep time badge */}
          <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
            <Clock className="w-3 h-3 text-rasoi-gold" />
            <span>{item.prepTimeMinutes || 20}m</span>
          </div>

          {!isAvailable && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
              <span className="bg-rasoi-red text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {lang === 'hi' ? 'समाप्त' : 'Sold Out'}
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-2">
          {/* Rating & Category */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium text-rasoi-mut uppercase tracking-wider text-[11px]">
              {item.categoryName || 'Homemade'}
            </span>
            <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full text-green-800 font-bold">
              <Star className="w-3 h-3 fill-rasoi-gold text-rasoi-gold" />
              <span>{item.rating || 4.8}</span>
              <span className="text-gray-400 font-normal">({item.ratingCount || 120})</span>
            </div>
          </div>

          {/* Title */}
          <div>
            <h3 className="font-heading font-bold text-lg text-gray-900 group-hover:text-rasoi-green transition-colors leading-snug">
              {item.name}
            </h3>
            {item.hindiName && (
              <p className="text-xs text-rasoi-mut font-medium mt-0.5">
                {item.hindiName}
              </p>
            )}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {lang === 'hi' && item.hindiDescription ? item.hindiDescription : item.description}
          </p>
        </div>
      </div>

      {/* Price & Action Row */}
      <div
        className="p-4 pt-0 mt-2 flex items-center justify-between border-t border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-extrabold text-xl text-gray-900">
              ₹{item.discountPrice !== undefined ? item.discountPrice : item.price}
            </span>
            {item.discountPrice !== undefined && item.discountPrice < item.price && (
              <span className="text-xs text-gray-400 line-through">
                ₹{item.price}
              </span>
            )}
          </div>
          <span className="text-[10px] text-rasoi-mut block">Shuddh Shakahari</span>
        </div>

        {/* Add Button or Stepper */}
        {isAvailable ? (
          quantity > 0 ? (
            <div className="flex items-center bg-rasoi-green text-white rounded-lg shadow-sm">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateQuantity(item.id, -1);
                }}
                className="w-8 h-8 flex items-center justify-center hover:bg-rasoi-dark rounded-l-lg transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-heading font-bold text-sm">
                {quantity}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateQuantity(item.id, 1);
                }}
                className="w-8 h-8 flex items-center justify-center hover:bg-rasoi-dark rounded-r-lg transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(item);
              }}
              className="px-5 py-2 rounded-lg bg-rasoi-cream border-2 border-rasoi-green text-rasoi-green font-heading font-bold text-sm hover:bg-rasoi-green hover:text-white transition-all shadow-sm active:scale-95"
            >
              {t('addToCart')} +
            </button>
          )
        ) : (
          <button
            disabled
            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 text-xs font-semibold cursor-not-allowed"
          >
            {lang === 'hi' ? 'अनुपलब्ध' : 'Unavailable'}
          </button>
        )}
      </div>
    </div>
  );
};
