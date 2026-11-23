import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/storage';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { Review, OrderItem } from '../types/shared';

export const reviewRouter = Router();

// GET public approved reviews
reviewRouter.get('/', (_req, res: Response) => {
  const reviews = db.get('reviews') || [];
  const approved = reviews.filter(r => r.isApproved);
  return res.json({ success: true, count: approved.length, reviews: approved });
});

// SUBMIT REVIEW (Only eligible customers who received their order)
reviewRouter.post('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId, rating, comment, reviewPhotos } = req.body;
    const userId = req.user?.id;

    if (!orderId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Order ID, rating (1-5), and written review are required.' });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
    }

    const orders = db.get('orders') || [];
    const targetOrder = orders.find(
      o => (o.id === orderId || o.orderNumber === orderId) && (o.customerId === userId || o.customerPhone === req.user?.phone)
    );

    if (!targetOrder) {
      return res.status(403).json({
        success: false,
        message: 'Only customers who placed this order can review it.'
      });
    }

    if (targetOrder.status !== 'DELIVERED') {
      return res.status(400).json({
        success: false,
        message: 'You can submit a review once your food has been delivered. Enjoy your meal!'
      });
    }

    // Check if already reviewed
    const existingReviews = db.get('reviews') || [];
    const alreadyReviewed = existingReviews.some(r => r.orderId === targetOrder.id && r.customerId === userId);
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this order. Thank you!' });
    }

    const newReview: Review = {
      id: `rev-${uuidv4().substring(0, 8)}`,
      orderId: targetOrder.id,
      customerId: userId || 'cust-user',
      customerName: req.user?.name || targetOrder.customerName,
      rating: Math.round(numRating),
      comment: comment.trim(),
      reviewPhotos: Array.isArray(reviewPhotos) ? reviewPhotos : undefined,
      isApproved: true, // auto-approve standard reviews, admin can moderate
      createdAt: new Date().toISOString()
    };

    db.mutate(data => {
      data.reviews.unshift(newReview);

      // Recompute average ratings for ordered food items
      targetOrder.items.forEach((ordItem: OrderItem) => {
        const food = data.foodItems.find(f => f.id === ordItem.foodItemId);
        if (food) {
          const currentCount = food.ratingCount || 1;
          const currentAvg = food.rating || 5.0;
          const newCount = currentCount + 1;
          const newAvg = Number(((currentAvg * currentCount + numRating) / newCount).toFixed(1));
          food.rating = newAvg;
          food.ratingCount = newCount;
        }
      });
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for your valuable review! नीलम की घरेलू रसोई appreciates your feedback.',
      review: newReview
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

// ADMIN: GET all reviews (including pending/moderated)
reviewRouter.get('/all', authenticateToken, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const reviews = db.get('reviews') || [];
  return res.json({ success: true, count: reviews.length, reviews });
});

// ADMIN: Moderate review (Approve / Hide)
reviewRouter.patch('/:id/moderate', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const reviewId = req.params.id;
  const { isApproved } = req.body;

  let updated: Review | null = null;

  db.mutate(data => {
    const r = data.reviews.find(rev => rev.id === reviewId);
    if (r) {
      r.isApproved = Boolean(isApproved);
      updated = r;
    }
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Review not found.' });
  }

  return res.json({ success: true, message: `Review ${isApproved ? 'approved' : 'hidden'}.`, review: updated });
});

// ADMIN: Reply to customer review
reviewRouter.post('/:id/reply', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const reviewId = req.params.id;
  const { reply } = req.body;

  if (!reply) {
    return res.status(400).json({ success: false, message: 'Reply text is required.' });
  }

  let updated: Review | null = null;

  db.mutate(data => {
    const r = data.reviews.find(rev => rev.id === reviewId);
    if (r) {
      r.adminReply = reply.trim();
      r.adminReplyAt = new Date().toISOString();
      updated = r;
    }
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Review not found.' });
  }

  return res.json({ success: true, message: 'Reply posted.', review: updated });
});
