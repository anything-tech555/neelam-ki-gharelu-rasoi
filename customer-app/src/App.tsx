import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryNav } from './components/CategoryNav';
import { FoodCard } from './components/FoodCard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { CustomerAccountModal } from './components/CustomerAccountModal';
import { ReviewModal } from './components/ReviewModal';
import { ReviewsSection } from './components/ReviewsSection';
import { Footer } from './components/Footer';
import { FloatingCartBar } from './components/FloatingCartBar';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { AuthModal } from './components/AuthModal';
import { TodaysSpecialSpotlight } from './components/TodaysSpecialSpotlight';
import { DishDetailModal } from './components/DishDetailModal';
import { INITIAL_FOOD_ITEMS, INITIAL_CATEGORIES, INITIAL_REVIEWS } from './data/initialData';
import { api } from './services/api';
import { FoodItem, Category, Order, Review } from './types/shared';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { Sparkles, UtensilsCrossed } from 'lucide-react';

export const App: React.FC = () => {
  const { user, token } = useAuth();
  const { lang, t } = useLanguage();

  // Data states - initialized with pre-seeded rich menu so it is NEVER blank
  const [foodItems, setFoodItems] = useState<FoodItem[]>(INITIAL_FOOD_ITEMS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [loading, setLoading] = useState(false);

  // Filter & Search states
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSpecialFilter, setIsSpecialFilter] = useState<boolean>(false);

  // Active / Tracked orders
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [selectedDish, setSelectedDish] = useState<FoodItem | null>(null);

  // Today's special dish featured upfront
  const todaysSpecialDish = foodItems.find(f => f.isSpecial && f.isAvailable) || foodItems.find(f => f.isSpecial) || foodItems[0] || null;

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [foodRes, catRes, revRes] = await Promise.all([
        api.get('/api/food/items').catch(() => null),
        api.get('/api/food/categories').catch(() => null),
        api.get('/api/reviews').catch(() => null)
      ]);

      if (foodRes?.success && foodRes.foodItems && foodRes.foodItems.length > 0) setFoodItems(foodRes.foodItems);
      if (catRes?.success && catRes.categories && catRes.categories.length > 0) setCategories(catRes.categories);
      if (revRes?.success && revRes.reviews && revRes.reviews.length > 0) setReviews(revRes.reviews);
    } catch (e) {
      console.warn('Network offline / using pre-seeded fresh menu:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch user's active orders if logged in
  useEffect(() => {
    if (token) {
      api.get('/api/orders/my-orders', token).then(res => {
        if (res.success && res.orders) {
          const actives = res.orders.filter((o: Order) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
          setActiveOrders(actives);
          if (actives.length > 0 && !trackedOrder) {
            setTrackedOrder(actives[0]);
          }
        }
      }).catch(() => {});
    }
  }, [token]);

  // Filtered dishes
  const displayedItems = foodItems.filter(item => {
    if (selectedCategoryId && item.categoryId !== selectedCategoryId) return false;
    if (isSpecialFilter && !item.isSpecial) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchHindi = item.hindiName ? item.hindiName.includes(q) : false;
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCategory = item.categoryName ? item.categoryName.toLowerCase().includes(q) : false;
      if (!matchName && !matchHindi && !matchDesc && !matchCategory) return false;
    }
    return true;
  });

  const handleOrderSuccess = (createdOrder: Order) => {
    setActiveOrders(prev => [createdOrder, ...prev]);
    setTrackedOrder(createdOrder);
    setIsTrackingOpen(true);
  };

  const handleOrderUpdated = (updatedOrder: Order) => {
    setTrackedOrder(updatedOrder);
    setActiveOrders(prev =>
      prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o))
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-rasoi-cream">
      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* Main Header */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenTracking={() => {
          if (trackedOrder) {
            setIsTrackingOpen(true);
          } else {
            setIsAccountOpen(true);
          }
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeOrderCount={activeOrders.length}
      />

      {/* Hero Section */}
      <Hero />

      {/* Upfront "Today's Special" Feature Showcase */}
      <TodaysSpecialSpotlight
        specialItem={todaysSpecialDish}
        onOpenDishDetail={(item) => setSelectedDish(item)}
      />

      {/* Sticky Category Navigation */}
      <CategoryNav
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={(id) => setSelectedCategoryId(id)}
        isSpecialFilter={isSpecialFilter}
        onToggleSpecial={() => {
          setIsSpecialFilter(!isSpecialFilter);
          setSelectedCategoryId('');
        }}
      />

      {/* Main Dishes Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-6">
        {/* Section Heading & Result count */}
        <div className="flex items-center justify-between border-b border-rasoi-line/80 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-gray-900">
              {isSpecialFilter
                ? (lang === 'hi' ? 'आज का विशेष व्यंजन' : "Today's Specials")
                : selectedCategoryId
                ? (categories.find(c => c.id === selectedCategoryId)?.name || 'Dishes')
                : (lang === 'hi' ? 'ताज़ा शुद्ध शाकाहारी मेनू' : 'Fresh Homemade Menu')}
            </h2>
            <span className="text-xs font-bold text-rasoi-mut bg-white px-2.5 py-0.5 rounded-full border border-gray-200 shadow-sm">
              {displayedItems.length} items
            </span>
          </div>

          {(selectedCategoryId || isSpecialFilter || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategoryId('');
                setIsSpecialFilter(false);
                setSearchQuery('');
              }}
              className="text-xs font-bold text-rasoi-green hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-rasoi-green border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-gray-500 font-medium">Preparing fresh homemade dishes from our Moradabad kitchen...</p>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-dashed border-gray-300 p-8">
            <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-heading font-bold text-lg text-gray-800">No dishes matched your search</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Try searching with another keyword or browse all our pure veg categories!
            </p>
            <button
              onClick={() => {
                setSelectedCategoryId('');
                setIsSpecialFilter(false);
                setSearchQuery('');
              }}
              className="px-5 py-2 rounded-xl bg-rasoi-green text-white font-heading font-bold text-xs"
            >
              View Full Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {displayedItems.map((dish) => (
              <FoodCard key={dish.id} item={dish} onSelect={(item) => setSelectedDish(item)} />
            ))}
          </div>
        )}
      </main>

      {/* Customer Love Reviews Section */}
      <ReviewsSection reviews={reviews} />

      {/* Footer */}
      <Footer />

      {/* Floating Cart Bar for Mobile */}
      <FloatingCartBar onOpenCart={() => setIsCartOpen(true)} />

      {/* Cart Slide-in Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Real-time Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        order={trackedOrder}
        onOrderUpdated={handleOrderUpdated}
        onOpenReview={(ord) => setReviewOrder(ord)}
      />

      {/* Customer Account & Order History Modal */}
      <CustomerAccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onSelectOrderToTrack={(ord) => {
          setTrackedOrder(ord);
          setIsTrackingOpen(true);
        }}
      />

      {/* Authentication Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Customer Food Review Modal */}
      <ReviewModal
        isOpen={Boolean(reviewOrder)}
        onClose={() => setReviewOrder(null)}
        order={reviewOrder}
        onReviewSubmitted={fetchData}
      />

      {/* Big Screen Food Detail & Gallery Modal */}
      <DishDetailModal
        item={selectedDish}
        isOpen={Boolean(selectedDish)}
        onClose={() => setSelectedDish(null)}
      />
    </div>
  );
};
