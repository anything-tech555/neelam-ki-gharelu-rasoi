import React, { useState, useEffect } from 'react';
import { Plus, Ticket, Trash2, CheckCircle2, XCircle, X } from 'lucide-react';
import { Coupon } from '../types/shared';
import { api } from '../services/api';
import { useAdminAuth } from '../context/AdminAuthContext';

const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'coup-001',
    code: 'SWAGAT50',
    description: '50% discount for all new customers in Moradabad',
    discountType: 'PERCENTAGE',
    discountValue: 50,
    minOrderAmount: 99,
    maxDiscountAmount: 100,
    isFirstOrderOnly: true,
    isActive: true,
    usageLimit: 500,
    usageCount: 142,
    expiryDate: '2027-12-31'
  },
  {
    id: 'coup-002',
    code: 'GHARELU30',
    description: 'Flat ₹30 off on orders above ₹149',
    discountType: 'FIXED',
    discountValue: 30,
    minOrderAmount: 149,
    isFirstOrderOnly: false,
    isActive: true,
    usageLimit: 1000,
    usageCount: 285,
    expiryDate: '2027-12-31'
  }
];

export const CouponsView: React.FC = () => {
  const { token } = useAdminAuth();
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const raw = localStorage.getItem('nkg_coupons');
      return raw ? JSON.parse(raw) : DEFAULT_COUPONS;
    } catch {
      return DEFAULT_COUPONS;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(149);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>('100');
  const [isFirstOrderOnly, setIsFirstOrderOnly] = useState(false);

  useEffect(() => {
    if (token) {
      api.get('/api/coupons/all', token).then(res => {
        if (res.success && res.coupons && res.coupons.length > 0) {
          setCoupons(res.coupons);
          localStorage.setItem('nkg_coupons', JSON.stringify(res.coupons));
        }
      }).catch(() => {});
    }
  }, [token]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: code.trim().toUpperCase(),
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount),
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
      isFirstOrderOnly,
      isActive: true,
      usageLimit: 1000,
      usageCount: 0,
      expiryDate: '2027-12-31'
    };

    const updated = [newCoupon, ...coupons];
    setCoupons(updated);
    localStorage.setItem('nkg_coupons', JSON.stringify(updated));

    if (token) {
      api.post('/api/coupons', newCoupon, token).catch(() => {});
    }
    setIsModalOpen(false);
  };

  const handleToggleActive = (cId: string) => {
    const updated = coupons.map(c => (c.id === cId ? { ...c, isActive: !c.isActive } : c));
    setCoupons(updated);
    localStorage.setItem('nkg_coupons', JSON.stringify(updated));
  };

  const handleDelete = (cId: string) => {
    if (!window.confirm('Delete this coupon?')) return;
    const updated = coupons.filter(c => c.id !== cId);
    setCoupons(updated);
    localStorage.setItem('nkg_coupons', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-xl text-gray-900 flex items-center gap-2">
            <span>Special Offers & Coupons</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rasoi-green text-white">
              {coupons.length} Active
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Create discount promo codes for new and repeat customers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-rasoi-green text-white font-bold text-xs flex items-center gap-2 hover:bg-rasoi-dark shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.map(coupon => (
          <div key={coupon.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-base text-rasoi-green bg-rasoi-lightGreen px-3 py-1 rounded-xl border border-emerald-300">
                {coupon.code}
              </span>
              <button
                onClick={() => handleToggleActive(coupon.id)}
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  coupon.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {coupon.isActive ? 'Active' : 'Disabled'}
              </button>
            </div>

            <p className="text-xs text-gray-700 font-medium">{coupon.description}</p>

            <div className="text-[11px] text-gray-500 space-y-0.5 pt-1 border-t">
              <p>
                Discount: <strong>{coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue} Flat`}</strong>
              </p>
              <p>Min Order: ₹{coupon.minOrderAmount} {coupon.isFirstOrderOnly ? '• First Order Only' : ''}</p>
              <p>Times Claimed: {coupon.usageCount || 0}</p>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button onClick={() => handleDelete(coupon.id)} className="text-xs text-red-600 hover:underline">
                Delete Coupon
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-heading font-bold text-sm text-gray-900">Create New Coupon</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MORADABAD20"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg uppercase font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 20% off on all dinners"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Type</label>
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Value</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={e => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={e => setMinOrderAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Max Discount (₹)</label>
                  <input
                    type="number"
                    value={maxDiscountAmount}
                    onChange={e => setMaxDiscountAmount(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border rounded-lg text-gray-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-rasoi-green text-white font-bold rounded-lg shadow-sm">
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
