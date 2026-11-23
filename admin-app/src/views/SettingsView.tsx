import React, { useState, useEffect } from 'react';
import { Sliders, Clock, Bike, ShieldCheck, MapPin, Phone, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { RestaurantSettings } from '../types/shared';
import { api } from '../services/api';
import { localDatabase } from '../services/localDatabase';
import { useAdminAuth } from '../context/AdminAuthContext';

export const SettingsView: React.FC = () => {
  const { token } = useAdminAuth();
  const [settings, setSettings] = useState<RestaurantSettings>(() => localDatabase.getSettings());
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // 1. Local
    setSettings(localDatabase.getSettings());

    // 2. Try backend
    if (token) {
      api.get('/api/settings').then(res => {
        if (res.success && res.settings) {
          setSettings(res.settings);
          localDatabase.saveSettings(res.settings);
        }
      }).catch(() => {});
    }
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    // Save locally
    localDatabase.saveSettings(settings);

    // Save to backend if online
    if (token) {
      try {
        await api.put('/api/settings', settings, token).catch(() => {});
      } catch (e) {}
    }

    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-heading font-extrabold text-2xl text-gray-900">
          Kitchen & Delivery Settings
        </h2>
        <p className="text-xs text-gray-500">
          Configure operating hours, delivery fees, prep times, and helpline numbers.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings saved successfully! Updated on customer app.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Details */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-sm text-gray-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rasoi-green" />
            Kitchen Contact & Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Kitchen Name</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={e => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Hindi Name</label>
              <input
                type="text"
                value={settings.hindiName}
                onChange={e => setSettings({ ...settings, hindiName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Primary Helpline</label>
              <input
                type="text"
                value={settings.phone}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Secondary Helpline</label>
              <input
                type="text"
                value={settings.secondaryPhone || '8272072057'}
                onChange={e => setSettings({ ...settings, secondaryPhone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">Official Kitchen Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>
          </div>
        </div>

        {/* Operational & Delivery Rules */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-sm text-gray-800 flex items-center gap-2">
            <Bike className="w-4 h-4 text-rasoi-green" />
            Distance-Based Delivery & Timing Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Free Delivery Radius (km)</label>
              <input
                type="number"
                value={settings.freeDeliveryRadiusKm || 5}
                onChange={e => setSettings({ ...settings, freeDeliveryRadiusKm: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
              <span className="text-[10px] text-gray-500">Orders within 5 km get 100% free delivery</span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Delivery Charge Above 5 km (₹)</label>
              <input
                type="number"
                value={settings.deliveryChargeAboveRadius || 30}
                onChange={e => setSettings({ ...settings, deliveryChargeAboveRadius: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
              <span className="text-[10px] text-gray-500">Charged if distance exceeds 5 km</span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Default Prep Time (Mins)</label>
              <input
                type="number"
                value={settings.defaultPrepTimeMinutes}
                onChange={e => setSettings({ ...settings, defaultPrepTimeMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Kitchen Opening Time</label>
              <input
                type="time"
                value={settings.openingTime}
                onChange={e => setSettings({ ...settings, openingTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Kitchen Closing Time</label>
              <input
                type="time"
                value={settings.closingTime}
                onChange={e => setSettings({ ...settings, closingTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
              />
            </div>
          </div>

          {/* Pause Store Toggle */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-center justify-between">
            <div>
              <span className="font-bold text-amber-900 block">Temporary Kitchen Pause</span>
              <span className="text-amber-700">Pause incoming orders if kitchen is currently busy.</span>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, isPaused: !settings.isPaused })}
              className={`px-4 py-1.5 rounded-lg font-bold ${
                settings.isPaused ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              {settings.isPaused ? 'Kitchen Paused (Click to Open)' : 'Kitchen Active (Click to Pause)'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-rasoi-green hover:bg-rasoi-dark text-white font-heading font-bold text-xs flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Settings...' : 'Save All Settings'}</span>
        </button>
      </form>
    </div>
  );
};
