import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Phone, Mail, MapPin, Plus, Trash2, ShoppingBag, Clock, ExternalLink, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Order, ORDER_STATUS_DETAILS } from '../types/shared';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrderToTrack: (order: Order) => void;
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
  onSelectOrderToTrack
}) => {
  const { user, token, logout, addAddress } = useAuth();
  const { lang, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // New address form state
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newTag, setNewTag] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newAddressText, setNewAddressText] = useState('');
  const [newLandmark, setNewLandmark] = useState('');

  useEffect(() => {
    if (isOpen && token) {
      loadMyOrders();
    }
  }, [isOpen, token]);

  const loadMyOrders = async () => {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const res = await api.get('/api/orders/my-orders', token);
      if (res.success && res.orders) {
        setOrders(res.orders);
      }
    } catch (e) {
      console.warn('Failed to load customer orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressText.trim()) return;

    try {
      await addAddress({
        tag: newTag,
        address: newAddressText.trim(),
        landmark: newLandmark.trim() || undefined,
        isDefault: true
      });
      setShowAddAddr(false);
      setNewAddressText('');
      setNewLandmark('');
    } catch (e: any) {
      alert(e.message || 'Failed to save address');
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-rasoi-green text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rasoi-gold/30 flex items-center justify-center text-rasoi-gold font-heading font-extrabold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-heading font-bold text-base leading-tight text-white">
                {user.name}
              </h3>
              <p className="text-xs text-rasoi-gold">{user.phone} • {user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 px-4 bg-gray-50">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 font-heading font-bold text-xs border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'orders'
                ? 'border-rasoi-green text-rasoi-green bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order History ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`py-3 px-4 font-heading font-bold text-xs border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'addresses'
                ? 'border-rasoi-green text-rasoi-green bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses ({user.addresses?.length || 0})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {activeTab === 'orders' && (
            loadingOrders ? (
              <div className="py-12 text-center text-xs text-gray-500">Loading your orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs text-gray-500">You haven't placed any orders yet.</p>
              </div>
            ) : (
              orders.map((ord) => {
                const statusDetails = ORDER_STATUS_DETAILS[ord.status];
                return (
                  <div
                    key={ord.id}
                    className="p-3.5 rounded-xl border border-gray-200 bg-white shadow-sm space-y-2 hover:border-rasoi-green transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        #{ord.orderNumber}
                      </span>
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${statusDetails?.color}15`,
                          color: statusDetails?.color
                        }}
                      >
                        {lang === 'hi' ? statusDetails?.hindiLabel : statusDetails?.label}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-1">
                      {ord.items.map(i => `${i.quantity} × ${i.name}`).join(', ')}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                      <div>
                        <span className="font-heading font-extrabold text-sm text-gray-900">₹{ord.totalAmount}</span>
                        <span className="text-[10px] text-gray-400 ml-1.5">({new Date(ord.createdAt).toLocaleDateString()})</span>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          onSelectOrderToTrack(ord);
                        }}
                        className="px-3 py-1 rounded-lg bg-rasoi-cream border border-rasoi-green text-rasoi-green hover:bg-rasoi-green hover:text-white font-heading font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        <span>Live Track</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-3">
              {user.addresses?.map((addr) => (
                <div
                  key={addr.id}
                  className="p-3 rounded-xl border border-gray-200 bg-white flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                      {addr.tag}
                    </span>
                    <p className="text-gray-700 pt-1 font-medium">{addr.address}</p>
                    {addr.landmark && (
                      <p className="text-gray-500 text-[11px]">Landmark: {addr.landmark}</p>
                    )}
                  </div>
                </div>
              ))}

              {!showAddAddr ? (
                <button
                  onClick={() => setShowAddAddr(true)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-rasoi-green text-rasoi-green font-heading font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-rasoi-cream transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Address</span>
                </button>
              ) : (
                <form onSubmit={handleAddNewAddress} className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5 text-xs">
                  <h5 className="font-heading font-bold text-gray-900">New Address</h5>
                  <div className="flex gap-2">
                    {(['Home', 'Work', 'Other'] as const).map(tag => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => setNewTag(tag)}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] ${
                          newTag === tag ? 'bg-rasoi-green text-white' : 'bg-white border text-gray-700'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <textarea
                    required
                    rows={2}
                    placeholder="Address in Moradabad"
                    value={newAddressText}
                    onChange={e => setNewAddressText(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
                  />
                  <input
                    type="text"
                    placeholder="Landmark (Optional)"
                    value={newLandmark}
                    onChange={e => setNewLandmark(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-rasoi-green text-white font-bold"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddAddr(false)}
                      className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer Logout & Support */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs">
          <div className="text-gray-500 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-rasoi-green" />
            <span>Kitchen Helpline: <strong className="text-gray-800">9997433379 / 8272072057</strong></span>
          </div>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-rasoi-red hover:underline px-3 py-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
