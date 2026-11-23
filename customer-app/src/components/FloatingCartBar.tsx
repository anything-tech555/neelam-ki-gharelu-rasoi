import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface FloatingCartBarProps {
  onOpenCart: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({ onOpenCart }) => {
  const { totalCount, subtotal } = useCart();
  const { lang, t } = useLanguage();

  if (totalCount === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-3 sm:hidden bg-gradient-to-t from-black/20 to-transparent pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <button
          onClick={onOpenCart}
          className="w-full py-3.5 px-4 rounded-2xl bg-rasoi-green text-white font-heading font-bold text-sm shadow-xl flex items-center justify-between border-2 border-rasoi-gold/60 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-rasoi-gold text-rasoi-dark flex items-center justify-center font-bold text-xs shadow-sm">
              {totalCount}
            </div>
            <div className="text-left">
              <span className="block text-xs leading-none text-rasoi-gold">Aapka Order</span>
              <span className="text-base font-extrabold leading-tight">₹{subtotal}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-rasoi-gold">
            <span>{t('viewCart')}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
};
