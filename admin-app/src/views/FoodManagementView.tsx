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
  Image as ImageIcon
} from 'lucide-react';
import { FoodItem, Category } from '../types/shared';
import { api } from '../services/api';
import { useAdminAuth } from '../context/AdminAuthContext';

export const FoodManagementView: React.FC = () => {
  const { token } = useAdminAuth();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number>(20);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSpecial, setIsSpecial] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [galleryImagesText, setGalleryImagesText] = useState('');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [foodRes, catRes] = await Promise.all([
        api.get('/api/food/items'),
        api.get('/api/food/categories')
      ]);

      if (foodRes.success && foodRes.foodItems) setItems(foodRes.foodItems);
      if (catRes.success && catRes.categories) setCategories(catRes.categories);
    } catch (e) {
      console.error('Failed to load food menu:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setHindiName('');
    setDescription('');
    setHindiDescription('');
    setPrice(100);
    setDiscountPrice('');
    setCategoryId(categories[0]?.id || '');
    setImageUrl('https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80');
    setPrepTimeMinutes(20);
    setIsFeatured(false);
    setIsSpecial(false);
    setIsAvailable(true);
    setGalleryImagesText('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: FoodItem) => {
    setEditingItem(item);
    setName(item.name);
    setHindiName(item.hindiName || '');
    setDescription(item.description || '');
    setHindiDescription(item.hindiDescription || '');
    setPrice(item.price);
    setDiscountPrice(item.discountPrice !== undefined ? String(item.discountPrice) : '');
    setCategoryId(item.categoryId);
    setImageUrl(item.imageUrl);
    setPrepTimeMinutes(item.prepTimeMinutes || 20);
    setIsFeatured(Boolean(item.isFeatured));
    setIsSpecial(Boolean(item.isSpecial));
    setIsAvailable(item.isAvailable !== false);
    setGalleryImagesText(item.galleryImages && item.galleryImages.length > 0 ? item.galleryImages.join('\n') : item.imageUrl);
    setIsModalOpen(true);
  };

  // Image file upload handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await api.uploadImage(file, token);
      if (res.success && res.imageUrl) {
        setImageUrl(res.imageUrl);
      }
    } catch (err: any) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save (Create or Update)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) {
      alert('Name and category are required.');
      return;
    }

    setSaving(true);
    const galleryImages = galleryImagesText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      name: name.trim(),
      hindiName: hindiName.trim() || undefined,
      description: description.trim(),
      hindiDescription: hindiDescription.trim() || undefined,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      categoryId,
      imageUrl: imageUrl.trim(),
      galleryImages: galleryImages.length > 0 ? galleryImages : [imageUrl.trim()],
      prepTimeMinutes: Number(prepTimeMinutes),
      isFeatured,
      isSpecial,
      isAvailable
    };

    try {
      if (editingItem) {
        const res = await api.put(`/api/food/items/${editingItem.id}`, payload, token);
        if (res.success && res.foodItem) {
          setItems(prev => prev.map(i => (i.id === editingItem.id ? res.foodItem : i)));
        }
      } else {
        const res = await api.post('/api/food/items', payload, token);
        if (res.success && res.foodItem) {
          setItems(prev => [...prev, res.foodItem]);
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  // Quick toggle availability
  const handleToggleAvailability = async (itemId: string) => {
    try {
      const res = await api.patch(`/api/food/items/${itemId}/availability`, {}, token);
      if (res.success) {
        setItems(prev =>
          prev.map(i => (i.id === itemId ? { ...i, isAvailable: res.isAvailable } : i))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to toggle availability');
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to remove "${itemName}" from the menu?`)) return;

    try {
      const res = await api.delete(`/api/food/items/${itemId}`, token);
      if (res.success) {
        setItems(prev => prev.filter(i => i.id !== itemId));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete dish');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-gray-900">
            Menu Dishes Management
          </h2>
          <p className="text-xs text-gray-500">
            Add dishes, upload photos, edit prices, and toggle in-stock status.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-rasoi-green hover:bg-rasoi-dark text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Dishes Table */}
      {loading ? (
        <div className="py-20 text-center text-xs text-gray-500">Loading dishes...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 pl-4">Dish</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Badges</th>
                  <th className="p-3.5 text-center">In-Stock</th>
                  <th className="p-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3.5 pl-4 flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-100"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="veg-badge !w-3 !h-3"></span>
                          <span className="font-heading font-bold text-gray-900 text-sm">{item.name}</span>
                        </div>
                        {item.hindiName && (
                          <p className="text-gray-500 text-[11px]">{item.hindiName}</p>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 font-medium text-gray-600">
                      {item.categoryName || 'General'}
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-baseline gap-1">
                        <span className="font-heading font-extrabold text-sm text-gray-900">
                          ₹{item.discountPrice !== undefined ? item.discountPrice : item.price}
                        </span>
                        {item.discountPrice !== undefined && (
                          <span className="text-[10px] text-gray-400 line-through">
                            ₹{item.price}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 space-x-1">
                      {item.isSpecial && (
                        <span className="px-2 py-0.5 rounded-full bg-rasoi-gold/20 text-rasoi-goldDark font-bold text-[10px]">
                          Special
                        </span>
                      )}
                      {item.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[10px]">
                          Featured
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleToggleAvailability(item.id)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                          item.isAvailable !== false
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {item.isAvailable !== false ? 'Available' : 'Sold Out'}
                      </button>
                    </td>

                    <td className="p-3.5 pr-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg border text-gray-600 hover:bg-gray-100 transition-colors"
                        title="Edit Dish"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Dish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="bg-rasoi-green text-white p-4 flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-white">
                {editingItem ? 'Edit Dish Details' : 'Add New Vegetarian Dish'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-white/20">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 space-y-3.5 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">English Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aloo Paratha"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Hindi Name</label>
                  <input
                    type="text"
                    placeholder="e.g. आलू पराठा"
                    value={hindiName}
                    onChange={(e) => setHindiName(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Category *</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.hindiName})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Optional"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Prep Time (Min)</label>
                  <input
                    type="number"
                    min={5}
                    value={prepTimeMinutes}
                    onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, preparation style..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
                />
              </div>

              {/* Image Upload / URL */}
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">Dish Photograph (Primary)</label>
                <div className="flex items-center gap-3">
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-14 h-14 rounded-lg object-cover border"
                    />
                  )}
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full p-1.5 border rounded-lg text-xs"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 font-semibold cursor-pointer hover:bg-gray-100">
                      <Upload className="w-3.5 h-3.5 text-rasoi-green" />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload Image from PC/Mobile'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileChange}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Additional Photos / Multi-photo Gallery */}
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">
                  Additional Photos Gallery (1 Image URL per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="https://... extra photo 2&#10;https://... extra photo 3"
                  value={galleryImagesText}
                  onChange={(e) => setGalleryImagesText(e.target.value)}
                  className="w-full p-2 border rounded-lg text-xs font-mono"
                />
                <p className="text-[11px] text-gray-500">
                  Customers will see these additional photos when they click on the dish for the big screen view.
                </p>
              </div>

              {/* Toggles */}
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSpecial}
                    onChange={(e) => setIsSpecial(e.target.checked)}
                    className="w-4 h-4 text-rasoi-green rounded"
                  />
                  <span className="font-bold text-gray-700">Today's Special</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-rasoi-green rounded"
                  />
                  <span className="font-bold text-gray-700">Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 text-rasoi-green rounded"
                  />
                  <span className="font-bold text-gray-700">In Stock</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="flex-1 py-2.5 rounded-xl bg-rasoi-green hover:bg-rasoi-dark text-white font-bold"
                >
                  {saving ? 'Saving...' : 'Save Dish to Menu'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
