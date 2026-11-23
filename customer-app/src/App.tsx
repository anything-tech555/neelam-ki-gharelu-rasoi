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
import { api } from './services/api';
import { localDatabase } from './services/localDatabase';
import { FoodItem, Category, Order, Review } from './types/shared';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import {
  Sparkles,
  UtensilsCrossed,
  Sun,
  Utensils,
  Moon,
  Award,
  Coffee,
  GlassWater,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const App: React.FC = () => {
  const { user, token } = useAuth();
  const { lang, t } = useLanguage();

  // Data states - synchronized with localDatabase & backend
  const [foodItems, setFoodItems] = useState<FoodItem[]>(() => localDatabase.getFoodItems());
  const [categories, setCategories] = useState<Category[]>(() => localDatabase.getCategories());
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter & Search states
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSpecialFilter, setIsSpecialFilter] = useState<boolean>(false);

  // Active / Tracked orders
  const [activeOrders, setActiveOrders] = useState<Order[]>(() => {
    return localDatabase.getOrders().filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  });
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
  const todaysSpecialDish =
    foodItems.find(f => f.isSpecial && f.isAvailable !== false) ||
    foodItems.find(f => f.isSpecial) ||
    foodItems.find(f => f.id === 'food-010') ||
    foodItems[0] ||
    null;

  // Load and synchronize data
  const syncFromSource = () => {
    setFoodItems(localDatabase.getFoodItems());
    setCategories(localDatabase.getCategories());
    const actives = localDatabase.getOrders().filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
    setActiveOrders(actives);
  };

  const fetchBackendData = async () => {
    try {
      const [foodRes, catRes, revRes] = await Promise.all([
        api.get('/api/food/items').catch(() => null),
        api.get('/api/food/categories').catch(() => null),
        api.get('/api/reviews').catch(() => null)
      ]);

      if (foodRes?.success && foodRes.foodItems && foodRes.foodItems.length > 0) {
        setFoodItems(foodRes.foodItems);
        localDatabase.saveFoodItems(foodRes.foodItems);
      }
      if (catRes?.success && catRes.categories && catRes.categories.length > 0) {
        setCategories(catRes.categories);
        localDatabase.saveCategories(catRes.categories);
      }
      if (revRes?.success && revRes.reviews) setReviews(revRes.reviews);
    } catch (e) {
      // quiet fallback
    }
  };

  useEffect(() => {
    syncFromSource();
    fetchBackendData();

    // Cross-tab real-time sync with Admin Dashboard edits
    const unsubscribe = localDatabase.subscribe(event => {
      if (event.type === 'FOOD_ITEMS_CHANGED' || event.type === 'nkg_food_items') {
        setFoodItems(localDatabase.getFoodItems());
      }
      if (event.type === 'CATEGORIES_CHANGED' || event.type === 'nkg_categories') {
        setCategories(localDatabase.getCategories());
      }
      if (event.type === 'ORDER_UPDATED' || event.type === 'ORDER_CREATED') {
        const actives = localDatabase.getOrders().filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
        setActiveOrders(actives);
        if (trackedOrder && event.payload?.id === trackedOrder.id) {
          setTrackedOrder(event.payload);
        }
      }
    });

    return unsubscribe;
  }, []);

  // Fetch user's orders if logged in
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

  // Filtered dishes for search or specific category view
  const isFilteredView = Boolean(selectedCategoryId || isSpecialFilter || searchQuery.trim());

  const filteredItems = foodItems.filter(item => {
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

  // Category Icon helper
  const getCategoryMeta = (cat: Category) => {
    const n = cat.name.toLowerCase();
    if (n.includes('breakfast') || n.includes('नाश्ता')) {
      return {
        icon: <Sun className="w-5 h-5 text-amber-500" />,
        timing: '7:00 AM – 11:30 AM',
        accent: 'border-amber-300 bg-amber-50/50'
      };
    }
    if (n.includes('thali') || n.includes('थाली')) {
      return {
        icon: <Award className="w-5 h-5 text-rasoi-gold" />,
        timing: 'All Day Specialty',
        accent: 'border-rasoi-gold/40 bg-rasoi-goldLight/20'
      };
    }
    if (n.includes('lunch') || n.includes('दोपहर')) {
      return {
        icon: <Utensils className="w-5 h-5 text-emerald-600" />,
        timing: '11:30 AM – 4:00 PM',
        accent: 'border-emerald-300 bg-emerald-50/50'
      };
    }
    if (n.includes('snack') || n.includes('शाम')) {
      return {
        icon: <Coffee className="w-5 h-5 text-amber-600" />,
        timing: '4:00 PM – 7:00 PM',
        accent: 'border-amber-200 bg-orange-50/40'
      };
    }
    if (n.includes('dinner') || n.includes('रात्रि')) {
      return {
        icon: <Moon className="w-5 h-5 text-indigo-500" />,
        timing: '7:00 PM – 10:30 PM',
        accent: 'border-indigo-200 bg-indigo-50/40'
      };
    }
    if (n.includes('beverage') || n.includes('पेय')) {
      return {
        icon: <GlassWater className="w-5 h-5 text-cyan-600" />,
        timing: 'All Day Refreshers',
        accent: 'border-cyan-200 bg-cyan-50/40'
      };
    }
    return {
      icon: <Sparkles className="w-5 h-5 text-rasoi-green" />,
      timing: 'Freshly Prepared',
      accent: 'border-gray-200 bg-white'
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-rasoi-cream font-sans">
      {/* PWA Install Banner (automatically hidden when inside installed app) */}
      <PWAInstallBanner />

      {/* Main Header */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenTracking={() => {
          if (activeOrders.length > 0) {
            setTrackedOrder(activeOrders[0]);
            setIsTrackingOpen(true);
          }
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeOrderCount={activeOrders.length}
      />

      {/* Hero Section */}
      <Hero />

      {/* Upfront "Today's Special" Feature Showcase Card */}
      <TodaysSpecialSpotlight
        specialItem={todaysSpecialDish}
        onOpenDishDetail={(item) => setSelectedDish(item)}
      />

      {/* Category Navigation Bar (Sticky with Meal Icons) */}
      <CategoryNav
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        isSpecialFilter={isSpecialFilter}
        onToggleSpecial={() => {
          setIsSpecialFilter(!isSpecialFilter);
          setSelectedCategoryId('');
        }}
      />

      {/* Active Order Banner if user has order out */}
      {activeOrders.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 w-full pt-4">
          <div
            onClick={() => {
              setTrackedOrder(activeOrders[0]);
              setIsTrackingOpen(true);
            }}
            className="p-3 bg-gradient-to-r from-rasoi-green to-emerald-800 text-white rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rasoi-gold animate-ping"></span>
              <span className="text-xs sm:text-sm font-bold">
                Order #{activeOrders[0].orderNumber} in progress: {activeOrders[0].status.replace(/_/g, ' ')}
              </span>
            </div>
            <span className="text-xs bg-rasoi-gold text-rasoi-dark font-black px-3 py-1 rounded-full shadow-sm">
              Live Track →
            </span>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 space-y-10 w-full">
        {/* CASE 1: Filtered / Search / Single Category View */}
        {isFilteredView ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-rasoi-line/80 pb-3">
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-gray-900">
                  {isSpecialFilter
                    ? (lang === 'hi' ? "आज का विशेष व्यंजन" : "Today's Specials")
                    : selectedCategoryId
                    ? (categories.find(c => c.id === selectedCategoryId)?.name || 'Dishes')
                    : `Search: "${searchQuery}"`}
                </h2>
                <span className="text-xs font-bold text-rasoi-mut bg-white px-2.5 py-0.5 rounded-full border border-gray-200 shadow-sm">
                  {filteredItems.length} items
                </span>
              </div>

              <button
                onClick={() => {
                  setSelectedCategoryId('');
                  setIsSpecialFilter(false);
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-rasoi-green hover:underline"
              >
                View Full Menu (All Meals)
              </button>
            </div>

            {filteredItems.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-dashed border-gray-300 p-8">
                <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="font-heading font-bold text-lg text-gray-800">No dishes matched</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Try searching another homemade delicacy or browse all our pure veg meal categories!
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
                {filteredItems.map(dish => (
                  <FoodCard key={dish.id} item={dish} onSelect={item => setSelectedDish(item)} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* CASE 2: Beautiful Dedicated Meal Sections (Breakfast, Thali, Lunch, Snacks, Dinner, Beverages) */
          <div className="space-y-12">
            {categories
              .filter(cat => cat.id !== 'cat-special')
              .map(category => {
                const categoryDishes = foodItems.filter(item => item.categoryId === category.id);
                if (categoryDishes.length === 0) return null;
                const meta = getCategoryMeta(category);

                return (
                  <section key={category.id} id={category.id} className="space-y-4">
                    {/* Meal Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-rasoi-green/20 gap-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm">
                          {meta.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="font-heading font-black text-xl sm:text-2xl text-gray-900 tracking-tight">
                              {category.name}
                            </h2>
                            {category.hindiName && (
                              <span className="text-base sm:text-lg font-bold text-rasoi-green">
                                • {category.hindiName}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 font-medium">
                            {category.description || 'Piping hot fresh food cooked in pure desi ghee'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-semibold shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-rasoi-gold" />
                          <span>{meta.timing}</span>
                        </div>
                        <span className="text-xs font-bold text-rasoi-green bg-rasoi-lightGreen px-2.5 py-1 rounded-full border border-emerald-200">
                          {categoryDishes.length} dishes
                        </span>
                      </div>
                    </div>

                    {/* Meal Dishes Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {categoryDishes.map(dish => (
                        <FoodCard key={dish.id} item={dish} onSelect={item => setSelectedDish(item)} />
                      ))}
                    </div>
                  </section>
                );
              })}
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
        onOpenReview={ord => setReviewOrder(ord)}
      />

      {/* Customer Account & Order History Modal */}
      <CustomerAccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onSelectOrderToTrack={ord => {
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
        onReviewSubmitted={fetchBackendData}
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
