import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, X, CheckCircle2 } from 'lucide-react';
import { Category } from '../types/shared';
import { api } from '../services/api';
import { localDatabase } from '../services/localDatabase';
import { useAdminAuth } from '../context/AdminAuthContext';

export const CategoriesView: React.FC = () => {
  const { token } = useAdminAuth();
  const [categories, setCategories] = useState<Category[]>(() => localDatabase.getCategories());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [hindiName, setHindiName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setCategories(localDatabase.getCategories());
    if (token) {
      api.get('/api/food/categories').then(res => {
        if (res.success && res.categories && res.categories.length > 0) {
          setCategories(res.categories);
          localDatabase.saveCategories(res.categories);
        }
      }).catch(() => {});
    }
  }, [token]);

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
    setHindiName(cat.hindiName || '');
    setDescription(cat.description || '');
    setDisplayOrder(cat.displayOrder || 1);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const catPayload: Category = {
      id: editingCat ? editingCat.id : `cat-${Date.now()}`,
      name: name.trim(),
      hindiName: hindiName.trim() || '',
      description: description.trim() || undefined,
      displayOrder: Number(displayOrder),
      isActive: true
    };

    let updated = [...categories];
    if (editingCat) {
      updated = updated.map(c => (c.id === editingCat.id ? catPayload : c));
    } else {
      updated.push(catPayload);
    }
    setCategories(updated);
    localDatabase.saveCategories(updated);

    if (token) {
      try {
        if (editingCat) {
          await api.put(`/api/food/categories/${editingCat.id}`, catPayload, token).catch(() => {});
        } else {
          await api.post('/api/food/categories', catPayload, token).catch(() => {});
        }
      } catch (e) {}
    }

    setIsModalOpen(false);
    setSuccessMsg(`Category "${catPayload.name}" saved!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    localDatabase.saveCategories(updated);
    if (token) {
      api.delete(`/api/food/categories/${id}`, token).catch(() => {});
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-xl text-gray-900 flex items-center gap-2">
            <span>Meal Categories</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rasoi-green text-white">
              {categories.length} Categories
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Organize dishes into Breakfast, Lunch, Thali, Snacks, Dinner & Beverages.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-xl bg-rasoi-green text-white font-bold text-xs flex items-center gap-2 hover:bg-rasoi-dark shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-extrabold text-sm text-gray-900">{cat.name}</h3>
                <span className="text-[10px] bg-gray-100 font-mono px-2 py-0.5 rounded text-gray-500">
                  Order #{cat.displayOrder}
                </span>
              </div>
              {cat.hindiName && (
                <p className="text-xs text-rasoi-green font-semibold">{cat.hindiName}</p>
              )}
              {cat.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => openEdit(cat)}
                className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-heading font-bold text-sm text-gray-900">
                {editingCat ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Category Name (English)</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Hindi Name (हिंदी)</label>
                <input
                  type="text"
                  value={hindiName}
                  onChange={e => setHindiName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description / Timings</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. 7:00 AM - 11:30 AM"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={e => setDisplayOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border rounded-lg text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rasoi-green text-white font-bold rounded-lg shadow-sm"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
