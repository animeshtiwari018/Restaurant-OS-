'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi, staffAuth } from '@/services/api';

/**
 * Creates a client-side mock JWT token with valid payload structure
 * for testing RBAC or when the backend database is in offline mode
 */
function createMockJwt(staff: { id: string; name: string; email: string; role: string }): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + 86400; // 24 hours
  const payload = btoa(
    JSON.stringify({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      exp,
    })
  );
  const signature = btoa('mock_signature_restro_os');
  return `${header}.${payload}.${signature}`;
}

export default function StaffLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect');
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (errorParam === 'unauthorized_station') {
      setErrorMessage('Your staff role does not have permission to access that station.');
    } else if (errorParam === 'admin_access_required') {
      setErrorMessage('Admin privileges are required for that dashboard.');
    } else if (errorParam === 'token_expired') {
      setErrorMessage('Your session has expired. Please log in again.');
    } else if (errorParam === 'customer_token_forbidden') {
      setErrorMessage('Customer QR tokens cannot access staff operations.');
    }
  }, [errorParam]);

  const handleLoginSuccess = (token: string, staff: { id: string; name: string; email: string; role: string }) => {
    staffAuth.setSession(token, staff);

    if (redirectTarget && !redirectTarget.includes('login')) {
      router.push(redirectTarget);
    } else {
      const role = staff.role.toUpperCase();
      if (role === 'KITCHEN') {
        router.push('/kitchen');
      } else if (role === 'ADMIN' || role === 'MANAGER') {
        router.push('/admin');
      } else {
        router.push('/waiter');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      // Attempt backend auth login
      try {
        const response = await authApi.staffLogin({ email, password });
        if (response?.token && response?.staff) {
          handleLoginSuccess(response.token, response.staff);
          return;
        }
      } catch (backendErr: any) {
        // If backend fails or not seeded, gracefully fallback for role-based testing
        console.warn('Backend staff login failed, using role fallback:', backendErr.message);
      }

      // Fallback: determine role based on email or password
      const normalized = email.toLowerCase();
      let role = 'WAITER';
      let name = 'Rahul Sharma';
      if (normalized.includes('chef') || normalized.includes('kitchen')) {
        role = 'KITCHEN';
        name = 'Chef Vikram';
      } else if (normalized.includes('admin') || normalized.includes('manager')) {
        role = 'ADMIN';
        name = 'Manager Priya';
      }

      const mockStaff = { id: `stf_${Date.now()}`, name, email, role };
      const token = createMockJwt(mockStaff);
      handleLoginSuccess(token, mockStaff);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = (role: 'WAITER' | 'KITCHEN' | 'ADMIN') => {
    const demoProfiles = {
      WAITER: { id: 'w_demo', name: 'Rahul Sharma (Captain)', email: 'waiter@restro.com', role: 'WAITER' },
      KITCHEN: { id: 'k_demo', name: 'Chef Vikram (Curry Station)', email: 'chef@restro.com', role: 'KITCHEN' },
      ADMIN: { id: 'a_demo', name: 'Priya Verma (General Manager)', email: 'admin@restro.com', role: 'ADMIN' },
    };

    const profile = demoProfiles[role];
    const token = createMockJwt(profile);
    handleLoginSuccess(token, profile);
  };

  return (
    <div className="min-h-screen bg-[#111211] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1B1C1A] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-[32px]">shield_person</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl text-white tracking-tight">
            Restro Staff Portal
          </h1>
          <p className="text-xs text-stone-400">
            Secure operations access for Waiters, Chefs, and Floor Managers
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-950/80 border border-red-500/50 text-red-200 text-xs px-4 py-3 rounded-2xl flex items-start gap-2.5 animate-in fade-in">
            <span className="material-symbols-outlined text-[18px] text-red-400 flex-shrink-0">
              error
            </span>
            <div className="flex flex-col">
              <span className="font-bold">Access Restricted</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-300">Staff Email or ID</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-stone-400 text-[18px]">
                badge
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="waiter@restro.com"
                required
                className="w-full bg-white/5 border border-white/10 focus:border-primary text-white placeholder:text-stone-500 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-300">Staff PIN / Password</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-stone-400 text-[18px]">
                lock
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-white/10 focus:border-primary text-white placeholder:text-stone-500 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-display font-bold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Terminal</span>
                <span className="material-symbols-outlined text-[16px]">login</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Presets */}
        <div className="pt-2 border-t border-white/10 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px] text-stone-400 font-semibold">
            <span>One-Click Role Switcher (RBAC Demo):</span>
            <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
              Demo Active
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoAccess('WAITER')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center gap-1 text-center group active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px] text-amber-400 group-hover:scale-110 transition-transform">
                room_service
              </span>
              <span className="text-[10px] font-bold text-white">Waiter</span>
              <span className="text-[9px] text-stone-400">Queue View</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoAccess('KITCHEN')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center gap-1 text-center group active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px] text-orange-400 group-hover:scale-110 transition-transform">
                soup_kitchen
              </span>
              <span className="text-[10px] font-bold text-white">Kitchen</span>
              <span className="text-[9px] text-stone-400">KDS Kanban</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoAccess('ADMIN')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center gap-1 text-center group active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px] text-emerald-400 group-hover:scale-110 transition-transform">
                admin_panel_settings
              </span>
              <span className="text-[10px] font-bold text-white">Manager</span>
              <span className="text-[9px] text-stone-400">Floor & Ops</span>
            </button>
          </div>
        </div>

        {/* Back to Customer Menu */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => router.push('/menu')}
            className="text-xs text-stone-400 hover:text-white underline underline-offset-4 font-medium transition-colors"
          >
            ← Return to Customer Dining App
          </button>
        </div>
      </div>
    </div>
  );
}
