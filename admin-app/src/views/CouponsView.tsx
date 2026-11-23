import React, { useState, useEffect } from 'react';
import { Plus, Ticket, Trash2, CheckCircle2, XCircle, X } from 'lucide-react';
import { Coupon } from '../types/shared';
import { api } from '../services/api';
import { useAdminAuth } from '../context/AdminAuthContext';

export const CouponsView: React.FC = () => {
  const { token } = useAdminAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(149);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>('100');
  const [isFirstOrderOnly, setIsFirstOrderOnly] = useState(false);
  const [usageLimit, setUsageLimit] = useState<number>(500);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/api/coupons/all', token);
      if (res.success && res.coupons) setCoupons(res.coupons);
    } catch (e) {
      console.error('Failed to load coupons:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setSaving(true);
    try {
      const res = await api.post(
        '/api/coupons',
        {
          code: code.trim(),
          description: description.trim(),
          discountType,
          discountValue: Number(discountValue),
          minOrderAmount: Number(minOrderAmount),
          maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
          isFirstOrderOnly,
          usageLimit: Number(usageLimit)
        },
        token
      );

      if (res.success && res.coupon) {
        setCoupons(prev => [res.coupon, ...prev]);
        setIsModalOpen(false);
        setCode('');
        setDescription('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const res = await api.put(
        `/api/coupons/${coupon.id}`,
        { isActive: !coupon.isActive },
        token
      );
      if (res.success && res.coupon) {
        setCoupons(prev => prev.map(c => (c.id === coupon.id ? res.coupon : c)));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to toggle coupon status');
    }
  };

  const handleDelete = async (id: string, cCode: string) => {
    if (!confirm(`Delete coupon "${cCode}"?`)) return;
    try {
      const res = await api.delete(`/api/coupons/${id}`, token);
      if (res.success) {
        setCoupons(prev => prev.filter(c => c.id !== id));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-gray-900">
            Offers & Discount Coupons
          </h2>
          <p className="text-xs text-gray-500">
            Create percentage or flat discounts validated securely on the backend.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-rasoi-green hover:bg-rasoi-dark text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-gray-500">Loading coupons...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <div
              key={c.id}
              className={`p-5 rounded-2xl border bg-white shadow-sm flex flex-col justify-between space-y-3 ${
                !c.isActive ? 'opacity-60 bg-gray-50' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-sm px-2.5 py-1 bg-rasoi-gold/20 text-rasoi-dark rounded-lg">
                    {c.code}
                  </span>
                  <button
                    onClick={() => handleToggleActive(c)}
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>

                <p className="text-xs text-gray-700 font-semibold mt-2">{c.description}</p>
                <div className="text-[11px] text-gray-500 space-y-0.5 mt-2">
                  <p>Discount: <strong className="text-gray-800">{c.discountValue}{c.discountType === 'PERCENTAGE' ? '%' : '₹'}</strong></p>
                  <p>Min Order Amount: ₹{c.minOrderAmount}</p>
                  {c.maxDiscountAmount && <p>Max Discount Cap: ₹{c.maxDiscountAmount}</p>}
                  <p>Usage: {c.usageCount} / {c.usageLimit}</p>
                  {c.isFirstOrderOnly && <p className="text-rasoi-green font-bold">First Order Only</p>}
                </div>
              </div>

              <div className="pt-2 border-t flex justify-end">
                <button
                  onClick={() => handleDelete(c.id, c.code)}
                  className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs flex items-center gap-1 font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100">
            <div className="bg-rasoi-green text-white p-4 flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-white">Create Promo Coupon</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-white/20">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SWAGAT50"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full p-2 border rounded-lg font-mono font-bold uppercase focus:outline-none focus:border-rasoi-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    placeholder="Optional"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 50% off on your first order"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={isFirstOrderOnly}
                    onChange={(e) => setIsFirstOrderOnly(e.target.checked)}
                    className="w-4 h-4 text-rasoi-green rounded"
                  />
                  <span>First Order Only</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-xl bg-rasoi-green hover:bg-rasoi-dark text-white font-bold"
                >
                  {saving ? 'Creating...' : 'Save Coupon'}
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
