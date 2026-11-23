import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  Check,
  X,
  Star,
  Sparkles,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Clock,
  Tag,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { FoodItem, Category } from '../types/shared';
import { api } from '../services/api';
import { localDatabase } from '../services/localDatabase';
import { useAdminAuth } from '../context/AdminAuthContext';

export const FoodManagementView: React.FC = () => {
  const { token } = useAdminAuth();
  const [items, setItems] = useState<FoodItem[]>(() => localDatabase.getFoodItems());
  const [categories, setCategories] = useState<Category[]>(() => localDatabase.getCategories());
  const [loading, setLoading] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit / Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [hindiName, setHindiName] = useState('');
  const [description, setDescription] = useState('');
  const [hindiDescription, setHindiDescription] = useState('');
  const [price, setPrice] = useState<number>(100);
  const [discountPrice, setDiscountPrice] = useState<string>('');
  const [categoryId, setCategoryId] = useState('cat-breakfast');
  const [imageUrl, setImageUrl] = useState('');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number>(20);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSpecial, setIsSpecial] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [galleryImagesText, setGalleryImagesText] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const loadData = async () => {
    // 1. Load from local database first so screen is never blank
    const localItems = localDatabase.getFoodItems();
    const localCats = localDatabase.getCategories();
    setItems(localItems);
    setCategories(localCats);

    // 2. Fetch from backend if available
    try {
      const [foodRes, catRes] = await Promise.all([
        api.get('/api/food/items').catch(() => null),
        api.get('/api/food/categories').catch(() => null)
      ]);

      if (foodRes?.success && foodRes.foodItems && foodRes.foodItems.length > 0) {
        setItems(foodRes.foodItems);
        localDatabase.saveFoodItems(foodRes.foodItems);
      }
      if (catRes?.success && catRes.categories && catRes.categories.length > 0) {
        setCategories(catRes.categories);
        localDatabase.saveCategories(catRes.categories);
      }
    } catch (e) {
      // quiet fallback
    }
  };

  useEffect(() => {
    loadData();

    // Listen for cross-tab updates
    const unsubscribe = localDatabase.subscribe(event => {
      if (event.type === 'FOOD_ITEMS_CHANGED') {
        setItems(localDatabase.getFoodItems());
      }
    });
    return unsubscribe;
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setName('');
    setHindiName('');
    setDescription('');
    setHindiDescription('');
    setPrice(100);
    setDiscountPrice('');
    setCategoryId(categories[0]?.id || 'cat-breakfast');
    setImageUrl('https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80');
    setPrepTimeMinutes(20);
    setIsFeatured(false);
    setIsSpecial(false);
    setIsAvailable(true);
    setGalleryImagesText('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dish: FoodItem) => {
    setEditingItem(dish);
    setName(dish.name);
    setHindiName(dish.hindiName || '');
    setDescription(dish.description);
    setHindiDescription(dish.hindiDescription || '');
    setPrice(dish.price);
    setDiscountPrice(dish.discountPrice !== undefined ? String(dish.discountPrice) : '');
    setCategoryId(dish.categoryId);
    setImageUrl(dish.imageUrl);
    setPrepTimeMinutes(dish.prepTimeMinutes || 20);
    setIsFeatured(Boolean(dish.isFeatured));
    setIsSpecial(Boolean(dish.isSpecial));
    setIsAvailable(dish.isAvailable !== false);
    setGalleryImagesText((dish.galleryImages || []).join('\n'));
    setIsModalOpen(true);
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Please enter dish name');

    const catObj = categories.find(c => c.id === categoryId);
    const galleryArray = galleryImagesText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.startsWith('http'));

    const dishPayload: FoodItem = {
      id: editingItem ? editingItem.id : `food-${Date.now()}`,
      name: name.trim(),
      hindiName: hindiName.trim() || undefined,
      description: description.trim(),
      hindiDescription: hindiDescription.trim() || undefined,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      categoryId,
      categoryName: catObj ? catObj.name : 'Homemade Special',
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      galleryImages: galleryArray.length > 0 ? galleryArray : [imageUrl.trim()],
      prepTimeMinutes: Number(prepTimeMinutes) || 20,
      isVeg: true,
      displayOrder: editingItem?.displayOrder || items.length + 1,
      createdAt: editingItem?.createdAt || new Date().toISOString(),
      isFeatured,
      isSpecial,
      isAvailable,
      rating: editingItem?.rating || 4.9,
      ratingCount: editingItem?.ratingCount || 100
    };

    // If marked as Today's Special, unmark others
    let updatedItems = [...items];
    if (isSpecial) {
      updatedItems = updatedItems.map(i => ({
        ...i,
        isSpecial: i.id === dishPayload.id
      }));
    }

    const existingIdx = updatedItems.findIndex(i => i.id === dishPayload.id);
    if (existingIdx !== -1) {
      updatedItems[existingIdx] = dishPayload;
    } else {
      updatedItems.unshift(dishPayload);
    }

    setItems(updatedItems);
    localDatabase.saveFoodItems(updatedItems);

    // Try backend sync if online
    if (token) {
      try {
        if (editingItem) {
          await api.put(`/api/food/items/${editingItem.id}`, dishPayload, token).catch(() => {});
        } else {
          await api.post('/api/food/items', dishPayload, token).catch(() => {});
        }
      } catch (e) {}
    }

    setIsModalOpen(false);
    setSaveSuccessMsg(`Saved "${dishPayload.name}" successfully!`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleToggleSpecial = (dish: FoodItem) => {
    const newSpecial = !dish.isSpecial;
    const updated = items.map(item => ({
      ...item,
      isSpecial: item.id === dish.id ? newSpecial : (newSpecial ? false : item.isSpecial)
    }));
    setItems(updated);
    localDatabase.saveFoodItems(updated);

    if (token) {
      api.patch(`/api/food/items/${dish.id}/special`, { isSpecial: newSpecial }, token).catch(() => {});
    }

    setSaveSuccessMsg(newSpecial ? `⭐ Set "${dish.name}" as Today's Special!` : `Removed "${dish.name}" from Today's Special.`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleToggleAvailability = (dish: FoodItem) => {
    const newAvail = dish.isAvailable === false;
    const updated = items.map(item =>
      item.id === dish.id ? { ...item, isAvailable: newAvail } : item
    );
    setItems(updated);
    localDatabase.saveFoodItems(updated);

    if (token) {
      api.patch(`/api/food/items/${dish.id}/availability`, { isAvailable: newAvail }, token).catch(() => {});
    }
  };

  const handleDeleteDish = (dish: FoodItem) => {
    if (!window.confirm(`Are you sure you want to delete "${dish.name}"?`)) return;

    const updated = items.filter(i => i.id !== dish.id);
    setItems(updated);
    localDatabase.saveFoodItems(updated);

    if (token) {
      api.delete(`/api/food/items/${dish.id}`, token).catch(() => {});
    }
  };

  // Filter items
  const filteredDishes = items.filter(item => {
    if (selectedCategoryFilter === 'special' && !item.isSpecial) return false;
    if (selectedCategoryFilter !== 'all' && selectedCategoryFilter !== 'special' && item.categoryId !== selectedCategoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.hindiName && item.hindiName.includes(q)) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-xl text-gray-900 flex items-center gap-2">
            <span>Menu & Dish Management</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rasoi-green text-white">
              {items.length} Dishes
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your pure veg dishes, meal categories, prices, photos, and Today's Special spotlight.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-rasoi-green hover:bg-rasoi-dark text-white font-heading font-bold text-xs flex items-center gap-2 shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Meal Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar text-xs">
            <button
              onClick={() => setSelectedCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                selectedCategoryFilter === 'all'
                  ? 'bg-rasoi-green text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              All Dishes ({items.length})
            </button>

            <button
              onClick={() => setSelectedCategoryFilter('special')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1 ${
                selectedCategoryFilter === 'special'
                  ? 'bg-rasoi-gold text-rasoi-dark shadow-sm font-extrabold'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              Today's Special ({items.filter(i => i.isSpecial).length})
            </button>

            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                  selectedCategoryFilter === cat.id
                    ? 'bg-rasoi-green text-white shadow-sm'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {cat.name} ({items.filter(i => i.categoryId === cat.id).length})
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search dish name or price..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-rasoi-green"
            />
          </div>
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDishes.map(dish => {
          const isAvailable = dish.isAvailable !== false;
          return (
            <div
              key={dish.id}
              className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                dish.isSpecial
                  ? 'border-2 border-rasoi-gold ring-2 ring-rasoi-gold/20'
                  : 'border-gray-200'
              }`}
            >
              {/* Image & Badges */}
              <div className="relative h-44 overflow-hidden bg-gray-100 group">
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Category & Veg Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="veg-badge shadow-md"></span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/70 text-white backdrop-blur-sm">
                    {dish.categoryName || 'Food'}
                  </span>
                </div>

                {/* Today's Special Badge */}
                {dish.isSpecial && (
                  <div className="absolute top-3 right-3 bg-rasoi-gold text-rasoi-dark text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                    <Sparkles className="w-3 h-3 fill-current" />
                    <span>TODAY'S SPECIAL</span>
                  </div>
                )}

                {/* Stock status pill */}
                <div className="absolute bottom-3 left-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isAvailable ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    }`}
                  >
                    {isAvailable ? 'In Stock' : 'Sold Out Today'}
                  </span>
                </div>

                {/* Prep Time */}
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-sm">
                  <Clock className="w-3 h-3 text-rasoi-gold" />
                  <span>~{dish.prepTimeMinutes || 20}m</span>
                </div>
              </div>

              {/* Dish Info */}
              <div className="p-4 space-y-2 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-heading font-extrabold text-sm text-gray-900 leading-snug">
                      {dish.name}
                    </h3>
                    {dish.hindiName && (
                      <p className="text-xs text-rasoi-green font-semibold">
                        {dish.hindiName}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-heading font-black text-base text-gray-900">
                      ₹{dish.discountPrice !== undefined ? dish.discountPrice : dish.price}
                    </span>
                    {dish.discountPrice !== undefined && (
                      <span className="text-xs text-gray-400 line-through block">
                        ₹{dish.price}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2">
                  {dish.description}
                </p>
              </div>

              {/* Action Buttons Bar */}
              <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                {/* 1-Click Today's Special Toggle */}
                <button
                  onClick={() => handleToggleSpecial(dish)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    dish.isSpecial
                      ? 'bg-rasoi-gold text-rasoi-dark shadow-sm'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-amber-50'
                  }`}
                  title="Make this the spotlight Today's Special dish"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>{dish.isSpecial ? "Today's Special ✓" : "Set Special"}</span>
                </button>

                {/* Stock Toggle */}
                <button
                  onClick={() => handleToggleAvailability(dish)}
                  className={`p-1.5 rounded-lg border text-xs font-semibold ${
                    isAvailable
                      ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                      : 'bg-red-50 border-red-300 text-red-700'
                  }`}
                  title={isAvailable ? 'Mark Sold Out' : 'Mark In Stock'}
                >
                  {isAvailable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>

                {/* Edit & Delete Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(dish)}
                    className="p-1.5 rounded-lg bg-rasoi-green text-white hover:bg-rasoi-dark shadow-sm transition-all"
                    title="Edit Dish Details & Price"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDish(dish)}
                    className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                    title="Delete Dish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-gray-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <h3 className="font-heading font-black text-lg text-gray-900">
                {editingItem ? `Edit Dish: ${editingItem.name}` : 'Add New Dish to Menu'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Dish Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Royal Shahi Paneer Thali"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-rasoi-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Hindi Name (हिंदी नाम)
                  </label>
                  <input
                    type="text"
                    value={hindiName}
                    onChange={e => setHindiName(e.target.value)}
                    placeholder="e.g. रॉयल शाही पनीर थाली"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-rasoi-green"
                  />
                </div>
              </div>

              {/* Category & Prep Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Meal Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-rasoi-green"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.hindiName || ''})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Prep Time (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={prepTimeMinutes}
                    onChange={e => setPrepTimeMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-rasoi-green"
                  />
                </div>
              </div>

              {/* Price & Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Menu Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-rasoi-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Discounted Offer Price (₹ optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Leave empty if no discount"
                    value={discountPrice}
                    onChange={e => setDiscountPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-rasoi-green"
                  />
                </div>
              </div>

              {/* Photo URL */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Main Food Photo URL *
                </label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-rasoi-green"
                />
                {imageUrl && (
                  <div className="mt-2 w-28 h-20 rounded-lg overflow-hidden border border-gray-200">
                    <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Gallery Image URLs */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Additional Photos for Big Screen Gallery (One URL per line)
                </label>
                <textarea
                  rows={2}
                  value={galleryImagesText}
                  onChange={e => setGalleryImagesText(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-1&#10;https://images.unsplash.com/photo-2"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-rasoi-green font-mono"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Description (English)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe pure desi ghee cooking, spices, ingredients..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-rasoi-green"
                />
              </div>

              {/* Hindi Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Description (Hindi / विवरण)
                </label>
                <textarea
                  rows={2}
                  value={hindiDescription}
                  onChange={e => setHindiDescription(e.target.value)}
                  placeholder="देसी घी में निर्मित, मां के हाथ का स्वाद..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-rasoi-green"
                />
              </div>

              {/* Toggles */}
              <div className="p-3 bg-gray-50 rounded-xl space-y-2 border border-gray-200 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800">
                  <input
                    type="checkbox"
                    checked={isSpecial}
                    onChange={e => setIsSpecial(e.target.checked)}
                    className="w-4 h-4 text-rasoi-gold rounded"
                  />
                  <span>⭐ Feature as Today's Special (Spotlight upfront on customer app)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={e => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 text-rasoi-green rounded"
                  />
                  <span>Dish Currently In Stock & Ready to Order</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rasoi-green hover:bg-rasoi-dark text-white font-heading font-bold text-xs shadow-md transition-all"
                >
                  {editingItem ? 'Save Changes' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
