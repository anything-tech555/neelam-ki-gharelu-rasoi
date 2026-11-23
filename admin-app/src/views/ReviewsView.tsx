import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, MessageSquareQuote, ShieldAlert, Send } from 'lucide-react';
import { Review } from '../types/shared';
import { api } from '../services/api';
import { useAdminAuth } from '../context/AdminAuthContext';

export const ReviewsView: React.FC = () => {
  const { token } = useAdminAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  const fetchReviews = async () => {
    try {
      const res = await api.get('/api/reviews/all', token);
      if (res.success && res.reviews) setReviews(res.reviews);
    } catch (e) {
      console.error('Failed to load reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleModerate = async (reviewId: string, currentStatus: boolean) => {
    try {
      const res = await api.patch(
        `/api/reviews/${reviewId}/moderate`,
        { isApproved: !currentStatus },
        token
      );
      if (res.success && res.review) {
        setReviews(prev => prev.map(r => (r.id === reviewId ? res.review : r)));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to moderate review');
    }
  };

  const handlePostReply = async (reviewId: string) => {
    const reply = replyTextMap[reviewId]?.trim();
    if (!reply) return;

    try {
      const res = await api.post(
        `/api/reviews/${reviewId}/reply`,
        { reply },
        token
      );
      if (res.success && res.review) {
        setReviews(prev => prev.map(r => (r.id === reviewId ? res.review : r)));
        setReplyTextMap(prev => ({ ...prev, [reviewId]: '' }));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to post reply');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-extrabold text-2xl text-gray-900">
          Customer Reviews & Moderation
        </h2>
        <p className="text-xs text-gray-500">
          Only customers who received delivered orders can post ratings. Reply to reviews or hide inappropriate feedback.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-gray-500">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-300 p-8">
          <p className="text-xs text-gray-500">No reviews submitted yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className={`p-5 rounded-2xl border bg-white shadow-sm space-y-3.5 text-xs ${
                !rev.isApproved ? 'border-red-200 bg-red-50/40' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-sm text-gray-900">{rev.customerName}</h4>
                  <p className="text-[11px] text-gray-500">Order Ref: #{rev.orderId}</p>
                </div>

                <div className="flex items-center gap-2">
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
                  <button
                    onClick={() => handleToggleModerate(rev.id, rev.isApproved)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rev.isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {rev.isApproved ? 'Approved' : 'Hidden'}
                  </button>
                </div>
              </div>

              <p className="text-gray-800 italic leading-relaxed text-xs">
                "{rev.comment}"
              </p>

              {/* Existing Reply */}
              {rev.adminReply ? (
                <div className="p-3 rounded-xl bg-rasoi-lightGreen border-l-2 border-rasoi-green space-y-1">
                  <p className="font-bold text-rasoi-green flex items-center gap-1.5">
                    <MessageSquareQuote className="w-3.5 h-3.5" />
                    Kitchen Reply:
                  </p>
                  <p className="text-gray-700">{rev.adminReply}</p>
                </div>
              ) : (
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Write official reply as Neelam Sharma..."
                      value={replyTextMap[rev.id] || ''}
                      onChange={(e) =>
                        setReplyTextMap(prev => ({ ...prev, [rev.id]: e.target.value }))
                      }
                      className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-rasoi-green text-xs"
                    />
                    <button
                      onClick={() => handlePostReply(rev.id)}
                      className="px-3 py-2 rounded-lg bg-rasoi-green text-white font-bold hover:bg-rasoi-dark flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
