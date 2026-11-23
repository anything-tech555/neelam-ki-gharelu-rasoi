import React from 'react';
import { Category } from '../types/shared';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, Sun, Utensils, Moon, Award, Coffee, GlassWater } from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  isSpecialFilter: boolean;
  onToggleSpecial: () => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  isSpecialFilter,
  onToggleSpecial
}) => {
  const { lang, t } = useLanguage();

  const getIcon = (catName: string) => {
    const n = catName.toLowerCase();
    if (n.includes('breakfast') || n.includes('नाश्ता')) return <Sun className="w-4 h-4 text-amber-500" />;
    if (n.includes('thali') || n.includes('थाली')) return <Award className="w-4 h-4 text-rasoi-gold" />;
    if (n.includes('lunch') || n.includes('दोपहर')) return <Utensils className="w-4 h-4 text-emerald-600" />;
    if (n.includes('snack') || n.includes('शाम')) return <Coffee className="w-4 h-4 text-amber-600" />;
    if (n.includes('dinner') || n.includes('रात्रि')) return <Moon className="w-4 h-4 text-indigo-500" />;
    if (n.includes('beverage') || n.includes('पेय')) return <GlassWater className="w-4 h-4 text-cyan-500" />;
    return <Utensils className="w-4 h-4 text-rasoi-green" />;
  };

  return (
    <div className="sticky top-[105px] sm:top-[74px] z-30 bg-rasoi-cream/95 backdrop-blur-md border-b border-rasoi-line/80 py-3 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center gap-2.5 overflow-x-auto no-scrollbar">
        {/* All Items Button */}
        <button
          onClick={() => {
            onSelectCategory('');
            if (isSpecialFilter) onToggleSpecial();
          }}
          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-heading font-bold text-xs sm:text-sm transition-all ${
            selectedCategoryId === '' && !isSpecialFilter
              ? 'bg-rasoi-green text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm'
          }`}
        >
          <span>{lang === 'hi' ? 'सभी व्यंजन' : 'All Dishes'}</span>
        </button>

        {/* Today's Special Filter */}
        <button
          onClick={onToggleSpecial}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-heading font-bold text-xs sm:text-sm transition-all ${
            isSpecialFilter
              ? 'bg-rasoi-gold text-rasoi-dark shadow-md ring-2 ring-rasoi-gold/40'
              : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200 shadow-sm'
          }`}
        >
          <Sparkles className="w-4 h-4 text-rasoi-gold fill-current" />
          <span>{lang === 'hi' ? 'आज का खास' : "Today's Special"}</span>
        </button>

        {/* Categories from Backend / Database */}
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id && !isSpecialFilter;
          return (
            <button
              key={cat.id}
              onClick={() => {
                if (isSpecialFilter) onToggleSpecial();
                onSelectCategory(cat.id);
              }}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-heading font-bold text-xs sm:text-sm transition-all ${
                isSelected
                  ? 'bg-rasoi-green text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm'
              }`}
            >
              {getIcon(cat.name)}
              <span>{lang === 'hi' ? cat.hindiName || cat.name : cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
