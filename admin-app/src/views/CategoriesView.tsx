import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, X } from 'lucide-react';
import { Category } from '../types/shared';
import { api } from '../services/api';
import { useAdminAuth } from '../context/AdminAuthContext';

export const CategoriesView: React.FC = () => {
  const { token } = useAdminAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [hindiName, setHindiName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/food/categories');
      if (res.success && res.categories) setCategories(res.categories);
    } catch (e) {
      console.error('Failed to load categories:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAdd = () => {
    setEditingCat(null);
    setName('');
    setHindiName('');
    setDescription('');
    setDisplayOrder(categories.length + 1);
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setHindiName(cat.hindiName);
    setDescription(cat.description || '');
    setDisplayOrder(cat.displayOrder || 1);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !hindiName.trim()) {
      alert('English and Hindi category names are required.');
      return;
    }

    setSaving(true);
    const payload = {
      name: name.trim(),
      hindiName: hindiName.trim(),
      description: description.trim(),
      displayOrder: Number(displayOrder)
    };

    try {
      if (editingCat) {
        const res = await api.put(`/api/food/categories/${editingCat.id}`, payload, token);
        if (res.success && res.category) {
          setCategories(prev => prev.map(c => (c.id === editingCat.id ? res.category : c)));
        }
      } else {
        const res = await api.post('/api/food/categories', payload, token);
        if (res.success && res.category) {
          setCategories(prev => [...prev, res.category]);
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (catId: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;

    try {
      const res = await api.delete(`/api/food/categories/${catId}`, token);
      if (res.success) {
        setCategories(prev => prev.filter(c => c.id !== catId));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-gray-900">
            Menu Categories
          </h2>
          <p className="text-xs text-gray-500">
            Manage food sections: Breakfast, Lunch, Dinner, Special Thali, etc.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2.5 rounded-xl bg-rasoi-green hover:bg-rasoi-dark text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-gray-500">Loading categories...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-rasoi-lightGreen text-rasoi-green flex items-center justify-center font-bold text-xs">
                    {cat.displayOrder}
                  </span>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-gray-900">{cat.name}</h4>
                    <p className="text-xs text-rasoi-green font-medium">{cat.hindiName}</p>
                  </div>
                </div>
                {cat.description && (
                  <p className="text-xs text-gray-500 pt-1 line-clamp-2">{cat.description}</p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-1.5 rounded-lg border text-gray-600 hover:bg-gray-100"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100">
            <div className="bg-rasoi-green text-white p-4 flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-white">
                {editingCat ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-white/20">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Category English Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Thali"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Category Hindi Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. विशेष थाली"
                  value={hindiName}
                  onChange={(e) => setHindiName(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  min={1}
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Category subtitle / description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-xl bg-rasoi-green hover:bg-rasoi-dark text-white font-bold"
                >
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-semibold"
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
