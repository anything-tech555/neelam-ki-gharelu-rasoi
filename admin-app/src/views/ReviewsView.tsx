import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Check, X, ShieldAlert } from 'lucide-react';
import { Review } from '../types/shared';
import { api } from '../services/api';
import { INITIAL_REVIEWS } from '../data/initialData';
import { useAdminAuth } from '../context/AdminAuthContext';

export const ReviewsView: React.FC = () => {
  const { token } = useAdminAuth();
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const raw = localStorage.getItem('nkg_reviews');
      return raw ? JSON.parse(raw) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  useEffect(() => {
    if (token) {
      api.get('/api/reviews').then(res => {
        if (res.success && res.reviews && res.reviews.length > 0) {
          setReviews(res.reviews);
          localStorage.setItem('nkg_reviews', JSON.stringify(res.reviews));
        }
      }).catch(() => {});
    }
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="font-heading font-black text-xl text-gray-900 flex items-center gap-2">
          <span>Customer Feedback & Ratings</span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rasoi-green text-white">
            {reviews.length} Verified Reviews
          </span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Reviews from customers who received delivered orders in Moradabad.
        </p>
      </div>

      <div className="space-y-4">
        {reviews.map(rev => (
          <div key={rev.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-heading font-bold text-sm text-gray-900">{rev.customerName}</h4>
                <p className="text-xs text-rasoi-green font-semibold">Verified Customer Order</p>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <span className="font-bold text-xs text-amber-900">{rev.rating}</span>
                <Star className="w-3.5 h-3.5 fill-rasoi-gold text-rasoi-gold" />
              </div>
            </div>

            <p className="text-xs text-gray-700 italic bg-gray-50 p-3 rounded-xl border border-gray-100">
              "{rev.comment}"
            </p>

            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
              <span>Order #{rev.orderId}</span>
              <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
