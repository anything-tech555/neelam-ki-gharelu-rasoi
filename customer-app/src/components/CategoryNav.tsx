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
    switch (catName.toLowerCase()) {
      case 'breakfast': return <Sun className="w-4 h-4" />;
      case 'lunch': return <Utensils className="w-4 h-4" />;
      case 'dinner': return <Moon className="w-4 h-4" />;
      case 'special thali':
      case 'thali': return <Award className="w-4 h-4" />;
      case 'evening snacks':
      case 'snacks': return <Coffee className="w-4 h-4" />;
      case 'beverages': return <GlassWater className="w-4 h-4" />;
      default: return <Utensils className="w-4 h-4" />;
    }
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
          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-heading font-semibold text-sm transition-all ${
            selectedCategoryId === '' && !isSpecialFilter
              ? 'bg-rasoi-green text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <span>{t('allDishes')}</span>
        </button>

        {/* Today's Special Filter */}
        <button
          onClick={onToggleSpecial}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-heading font-semibold text-sm transition-all ${
            isSpecialFilter
              ? 'bg-rasoi-gold text-rasoi-dark font-bold shadow-md'
              : 'bg-white text-gray-700 hover:bg-rasoi-goldLight border border-gray-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-rasoi-gold" />
          <span>{lang === 'hi' ? 'आज का विशेष' : "Today's Special"}</span>
        </button>

        {/* Categories from Backend */}
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id && !isSpecialFilter;
          return (
            <button
              key={cat.id}
              onClick={() => {
                if (isSpecialFilter) onToggleSpecial();
                onSelectCategory(cat.id);
              }}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-heading font-semibold text-sm transition-all ${
                isSelected
                  ? 'bg-rasoi-green text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
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
