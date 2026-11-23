import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, Sparkles, ChefHat, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminLoginView: React.FC = () => {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('admin@neelamrasoi.com');
  const [password, setPassword] = useState('Admin@Neelam2026');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid admin credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      await login('admin@neelamrasoi.com', 'Admin@Neelam2026');
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rasoi-green via-rasoi-dark to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        {/* Header */}
        <div className="bg-rasoi-green p-6 text-center text-white relative">
          <div className="w-16 h-16 rounded-full bg-rasoi-gold/20 border-2 border-rasoi-gold p-2 mx-auto mb-3 flex items-center justify-center shadow-inner">
            <ChefHat className="w-8 h-8 text-rasoi-gold" />
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-white">
            Neelam Ki Gharelu Rasoi
          </h2>
          <p className="text-xs text-rasoi-gold font-medium mt-1">
            नीलम की घरेलू रसोई • Private Admin Portal
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          <div>
            <h3 className="font-heading font-bold text-lg text-gray-800">
              Admin Authentication
            </h3>
            <p className="text-xs text-gray-500">
              Kitchen management, live order tracking & menu controls.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@neelamrasoi.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:border-rasoi-green transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Enter secret password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:border-rasoi-green transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-rasoi-green hover:bg-rasoi-dark text-white font-heading font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Log In to Admin Dashboard'}
            </button>
          </form>

          {/* 1-Click Fast Login */}
          <button
            type="button"
            onClick={handleQuickLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-rasoi-gold/15 hover:bg-rasoi-gold/25 border border-rasoi-gold/40 text-rasoi-dark font-heading font-extrabold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-rasoi-dark" />
            <span>1-Click Owner Sign In (Instant Access)</span>
            <ArrowRight className="w-3.5 h-3.5 text-rasoi-dark" />
          </button>

          <div className="p-3 bg-rasoi-cream rounded-xl border border-rasoi-line text-xs text-gray-600 space-y-1">
            <p className="font-bold text-rasoi-green">Owner Credentials:</p>
            <p className="font-mono text-[11px]">Email: admin@neelamrasoi.com</p>
            <p className="font-mono text-[11px]">Password: Admin@Neelam2026</p>
          </div>
        </div>
      </div>
    </div>
  );
};
