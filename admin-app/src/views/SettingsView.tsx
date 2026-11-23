import React, { useState, useEffect } from 'react';
import { Sliders, Clock, Bike, ShieldCheck, MapPin, Phone, Save, AlertTriangle } from 'lucide-react';
import { RestaurantSettings } from '../types/shared';
import { api } from '../services/api';
import { useAdminAuth } from '../context/AdminAuthContext';

export const SettingsView: React.FC = () => {
  const { token } = useAdminAuth();
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/api/settings');
      if (res.success && res.settings) setSettings(res.settings);
    } catch (e) {
      console.error('Failed to load settings:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await api.put('/api/settings', settings, token);
      if (res.success && res.settings) {
        setSettings(res.settings);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-xs text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-heading font-extrabold text-2xl text-gray-900">
          Restaurant & Time Controls
        </h2>
        <p className="text-xs text-gray-500">
          Configure default preparation times, delivery fees, operational hours, and order pause.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl font-bold flex items-center gap-2">
          <span>✓ Settings saved successfully and broadcasted to customer app!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Kitchen Status & Pause Controls */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-base text-gray-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-rasoi-green" />
            Kitchen Order Status
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-gray-50">
              <div>
                <p className="font-bold text-gray-800">Store Open / Closed</p>
                <p className="text-gray-500 text-[11px]">Primary operational status</p>
              </div>
              <input
                type="checkbox"
                checked={settings.isOpen}
                onChange={(e) => setSettings({ ...settings, isOpen: e.target.checked })}
                className="w-5 h-5 text-rasoi-green rounded"
              />
            </div>

            <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
              settings.isPaused ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div>
                <p className="font-bold text-gray-800">Temporary Order Pause</p>
                <p className="text-gray-500 text-[11px]">Pause during peak kitchen rush</p>
              </div>
              <input
                type="checkbox"
                checked={settings.isPaused}
                onChange={(e) => setSettings({ ...settings, isPaused: e.target.checked })}
                className="w-5 h-5 text-amber-600 rounded"
              />
            </div>
          </div>

          {settings.isPaused && (
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Pause Notice for Customers
              </label>
              <input
                type="text"
                placeholder="e.g. Kitchen is preparing a large batch of orders. Taking orders again in 15 mins!"
                value={settings.pauseMessage || ''}
                onChange={(e) => setSettings({ ...settings, pauseMessage: e.target.value })}
                className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-rasoi-green text-xs"
              />
            </div>
          )}
        </div>

        {/* Time Estimates & Delivery Fees */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-base text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-rasoi-green" />
            Preparation & Delivery Time Calculations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Default Prep Time (Mins)
              </label>
              <input
                type="number"
                min={5}
                max={90}
                value={settings.defaultPrepTimeMinutes}
                onChange={(e) => setSettings({ ...settings, defaultPrepTimeMinutes: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Default Delivery Time (Mins)
              </label>
              <input
                type="number"
                min={5}
                max={90}
                value={settings.defaultDeliveryTimeMinutes}
                onChange={(e) => setSettings({ ...settings, defaultDeliveryTimeMinutes: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Delivery Charge (₹)
              </label>
              <input
                type="number"
                min={0}
                value={settings.deliveryCharge}
                onChange={(e) => setSettings({ ...settings, deliveryCharge: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Free Delivery Above (₹)
              </label>
              <input
                type="number"
                min={0}
                value={settings.freeDeliveryThreshold}
                onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Minimum Order Amount (₹)
              </label>
              <input
                type="number"
                min={1}
                value={settings.minOrderAmount}
                onChange={(e) => setSettings({ ...settings, minOrderAmount: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Opening Hours
              </label>
              <input
                type="time"
                value={settings.openingTime}
                onChange={(e) => setSettings({ ...settings, openingTime: e.target.value })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Closing Hours
              </label>
              <input
                type="time"
                value={settings.closingTime}
                onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Free Delivery Radius (Kilometers)
              </label>
              <p className="text-[11px] text-gray-500 mb-1">Within this distance, delivery is FREE even on orders like ₹65 or ₹70</p>
              <input
                type="number"
                min={1}
                value={settings.freeDeliveryRadiusKm !== undefined ? settings.freeDeliveryRadiusKm : 5}
                onChange={(e) => setSettings({ ...settings, freeDeliveryRadiusKm: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Delivery Charge Above 5 km (₹)
              </label>
              <p className="text-[11px] text-gray-500 mb-1">Delivery fee charged if distance goes above 5 km</p>
              <input
                type="number"
                min={0}
                value={settings.deliveryChargeAboveRadius !== undefined ? settings.deliveryChargeAboveRadius : 30}
                onChange={(e) => setSettings({ ...settings, deliveryChargeAboveRadius: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>
          </div>
        </div>

        {/* Official Address & Announcement Banner */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-base text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rasoi-green" />
            Official Business Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Hindi Name</label>
              <input
                type="text"
                value={settings.hindiName}
                onChange={(e) => setSettings({ ...settings, hindiName: e.target.value })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Official Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Primary Helpline Phone</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Secondary Helpline Phone</label>
              <input
                type="text"
                placeholder="e.g. 8272072057"
                value={settings.secondaryPhone || ''}
                onChange={(e) => setSettings({ ...settings, secondaryPhone: e.target.value })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Announcement Banner</label>
            <textarea
              rows={2}
              value={settings.announcementBanner || ''}
              onChange={(e) => setSettings({ ...settings, announcementBanner: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-rasoi-green hover:bg-rasoi-dark text-white font-heading font-bold text-sm shadow-md transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Updating Kitchen Settings...' : 'Save All Settings'}</span>
        </button>
      </form>
    </div>
  );
};
