import React, { useState } from 'react';
import { X, Star, Send } from 'lucide-react';
import { Order } from '../types/shared';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onReviewSubmitted: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  order,
  onReviewSubmitted
}) => {
  const { token, user } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg('Please write a brief feedback note about your meal.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.post(
        '/api/reviews',
        {
          orderId: order.id,
          rating,
          comment: comment.trim()
        },
        token
      );

      if (res.success) {
        alert('Thank you for rating your food! Your review has been saved.');
        onReviewSubmitted();
        onClose();
      } else {
        throw new Error(res.message || 'Failed to submit review');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Could not post review. Ensure order was delivered.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="bg-rasoi-green text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-white">
              Rate Order #{order.orderNumber}
            </h3>
            <p className="text-xs text-rasoi-gold">Neelam Ki Gharelu Rasoi</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* Star selector */}
          <div className="text-center space-y-2">
            <p className="text-xs font-bold text-gray-700">How delicious was your food?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-2xl transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'fill-rasoi-gold text-rasoi-gold'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-rasoi-green">
              {rating === 5 ? 'Delicious & Authentic (5/5) ⭐' : `${rating} Stars`}
            </p>
          </div>

          {/* Written review */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Your Review & Comments
            </label>
            <textarea
              required
              rows={3}
              placeholder="Tell others about the taste, warmth, packing, and Neelam Ji’s recipes..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-rasoi-green"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-rasoi-green hover:bg-rasoi-dark text-white font-heading font-bold text-sm shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
