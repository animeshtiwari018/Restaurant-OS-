'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { staffAuth } from '@/services/api';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // If on login page, don't show the staff top navigation bar
  const isLoginPage = pathname === '/staff/login';

  const [isOnDuty, setIsOnDuty] = useState(true);
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    if (!isLoginPage) {
      const current = staffAuth.getUser();
      if (current) {
        setUser(current);
      } else {
        // Fallback default based on route
        if (pathname.includes('kitchen')) {
          setUser({ id: 'chef_01', name: 'Chef Vikram', email: 'chef@restro.com', role: 'KITCHEN' });
        } else if (pathname.includes('admin')) {
          setUser({ id: 'admin_01', name: 'Manager Priya', email: 'manager@restro.com', role: 'ADMIN' });
        } else {
          setUser({ id: 'waiter_01', name: 'Rahul Sharma', email: 'rahul@restro.com', role: 'WAITER' });
        }
      }
    }
  }, [pathname, isLoginPage]);

  const handleLogout = () => {
    staffAuth.clearSession();
    router.push('/staff/login');
  };

  if (isLoginPage) {
    return <main className="min-h-screen bg-[#121312] text-white font-sans">{children}</main>;
  }

  // Admin dashboard uses its dedicated Stitch executive shell
  if (pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  const role = (user?.role || 'WAITER').toUpperCase();

  return (
    <div className="min-h-screen bg-[#141514] text-white flex flex-col font-sans">
      {/* Top Staff Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#1B1C1A] border-b border-white/10 px-4 py-2.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand + Duty Status Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <span className="font-display font-extrabold text-sm tracking-wide text-amber-200">
                RESTRO OS STAFF
              </span>
            </div>

            {/* Duty Status Toggle */}
            <button
              onClick={() => setIsOnDuty(!isOnDuty)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all border ${
                isOnDuty
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                  : 'bg-stone-800 border-stone-600 text-stone-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnDuty ? 'bg-emerald-400 animate-ping' : 'bg-stone-500'
                }`}
              />
              <span>{isOnDuty ? 'ON DUTY' : 'OFF DUTY'}</span>
            </button>
          </div>

          {/* Role Navigation Links */}
          <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-semibold">
            {(role === 'WAITER' || role === 'ADMIN' || role === 'MANAGER') && (
              <Link
                href="/waiter"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  pathname.startsWith('/waiter')
                    ? 'bg-primary text-white shadow-sm font-bold'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">room_service</span>
                <span>Waiter Queue</span>
              </Link>
            )}

            {(role === 'KITCHEN' || role === 'ADMIN' || role === 'MANAGER') && (
              <Link
                href="/kitchen"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  pathname.startsWith('/kitchen')
                    ? 'bg-primary text-white shadow-sm font-bold'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">soup_kitchen</span>
                <span>Kitchen KDS</span>
              </Link>
            )}

            {(role === 'ADMIN' || role === 'MANAGER') && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  pathname.startsWith('/admin')
                    ? 'bg-primary text-white shadow-sm font-bold'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">dashboard</span>
                <span>Floor & Ops</span>
              </Link>
            )}
          </nav>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-xs">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold leading-tight">{user?.name || 'Staff Member'}</span>
                <span className="text-[10px] text-amber-300/80 uppercase font-semibold tracking-wider">
                  {role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out of Staff Portal"
              className="h-8 px-2.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-700/40 text-red-300 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Staff Screen Container */}
      <main className="flex-1 w-full p-4 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
