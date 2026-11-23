import React from 'react';
import { Star, CheckCircle, MessageSquareQuote } from 'lucide-react';
import { Review } from '../types/shared';
import { useLanguage } from '../context/LanguageContext';

interface ReviewsSectionProps {
  reviews: Review[];
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
  const { lang, t } = useLanguage();

  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="py-12 px-4 bg-white border-t border-rasoi-line/70">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase font-extrabold text-rasoi-green tracking-wider">
            Verified Customer Reviews
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900">
            {t('reviewsHeading')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Real feedback from pure vegetarian food lovers across Moradabad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.slice(0, 6).map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-rasoi-cream/60 border border-rasoi-line/80 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                {/* Rating stars & verified badge */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= rev.rating ? 'fill-rasoi-gold text-rasoi-gold' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Verified Order
                  </span>
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-gray-700 italic leading-relaxed">
                  "{rev.comment}"
                </p>

                {/* Admin reply if present */}
                {rev.adminReply && (
                  <div className="p-2.5 rounded-lg bg-rasoi-lightGreen/80 border-l-2 border-rasoi-green text-[11px] text-rasoi-green space-y-0.5">
                    <p className="font-bold flex items-center gap-1">
                      <MessageSquareQuote className="w-3 h-3" />
                      Neelam Ji's Reply:
                    </p>
                    <p className="text-gray-700">{rev.adminReply}</p>
                  </div>
                )}
              </div>

              {/* Customer signature */}
              <div className="pt-2 border-t border-rasoi-line/50 flex items-center justify-between text-xs text-gray-500">
                <span className="font-heading font-bold text-gray-900">{rev.customerName}</span>
                <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
