'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface StockItem {
  id: string;
  name: string;
  price: string;
  calories: string;
  inStock: boolean;
}

export default function AdminDashboardPage() {
  const [activeNav, setActiveNav] = useState('live-floor-map');
  const [activeFloor, setActiveFloor] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'spatial'>('grid');
  const [rightTab, setRightTab] = useState<'live' | 'cms'>('live');

  // Interactive 86'd Stock items
  const [stockItems, setStockItems] = useState<StockItem[]>([
    {
      id: 'item_1',
      name: 'Paneer Butter Masala Special',
      price: '₹340.00',
      calories: '440 kcal',
      inStock: true,
    },
    {
      id: 'item_2',
      name: 'Dal Makhani Bukhara',
      price: '₹280.00',
      calories: '360 kcal',
      inStock: true,
    },
    {
      id: 'item_3',
      name: 'Tandoori Roti',
      price: '₹45.00',
      calories: '120 kcal',
      inStock: false,
    },
    {
      id: 'item_4',
      name: 'Hawaiian Teriyaki Slider',
      price: '₹340.00',
      calories: '510 kcal',
      inStock: true,
    },
  ]);

  const toggleStock = (id: string) => {
    setStockItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, inStock: !item.inStock } : item
      )
    );
  };

  return (
    <div className="bg-[#FAF8F5] text-[#1B1C1A] min-h-screen font-sans antialiased selection:bg-[#A33215]/20 selection:text-[#A33215]">
      {/* Sidebar - Stitch Executive Operations Sidebar (Visible on desktop) */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-[#1C1D1B] text-[#F2F0ED] z-50 flex flex-col justify-between shadow-xl border-r border-white/10 select-none">
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="p-4 flex items-center gap-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-[#A33215] flex items-center justify-center text-white shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[22px]">restaurant</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-display font-extrabold text-base tracking-tight text-white truncate">
                Restro Manage
              </span>
              <div className="inline-flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-semibold text-stone-400 truncate">
                  Flagship (Main Floor)
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 p-3">
            <button
              onClick={() => setActiveNav('live-floor-map')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left text-xs font-bold ${
                activeNav === 'live-floor-map'
                  ? 'bg-[#A33215] text-white shadow-sm'
                  : 'text-stone-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined shrink-0 text-[20px]">table_restaurant</span>
              <span>Live Floor Map</span>
            </button>

            <Link
              href="/menu"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-300 hover:bg-white/10 hover:text-white transition-colors text-xs font-semibold"
            >
              <span className="material-symbols-outlined shrink-0 text-[20px]">menu_book</span>
              <span>Menu &amp; Nutrition CMS</span>
            </Link>

            <button
              onClick={() => setActiveNav('advance-reservations')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left text-xs font-semibold ${
                activeNav === 'advance-reservations'
                  ? 'bg-[#A33215] text-white font-bold shadow-sm'
                  : 'text-stone-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined shrink-0 text-[20px]">calendar_month</span>
              <span>Advance Reservations</span>
            </button>

            <Link
              href="/kitchen"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-300 hover:bg-white/10 hover:text-white transition-colors text-xs font-semibold"
            >
              <span className="material-symbols-outlined shrink-0 text-[20px]">soup_kitchen</span>
              <span>Live Orders &amp; KDS Feed</span>
            </Link>

            <Link
              href="/bill"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-300 hover:bg-white/10 hover:text-white transition-colors text-xs font-semibold"
            >
              <span className="material-symbols-outlined shrink-0 text-[20px]">receipt_long</span>
              <span>Billing &amp; Settlement Audit</span>
            </Link>

            <Link
              href="/waiter"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-300 hover:bg-white/10 hover:text-white transition-colors text-xs font-semibold"
            >
              <span className="material-symbols-outlined shrink-0 text-[20px]">badge</span>
              <span>Staff &amp; Role Permissions</span>
            </Link>
          </nav>
        </div>

        {/* User Card at Footer of Sidebar */}
        <div className="p-3 m-3 rounded-2xl bg-white/5 flex items-center justify-between border border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#CB4914] text-white flex items-center justify-center font-display font-extrabold text-xs shrink-0 shadow-inner">
              VM
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-display font-bold text-xs text-white truncate">
                Vikram M.
              </span>
              <span className="text-[10px] text-stone-400 font-medium truncate">
                General Manager
              </span>
            </div>
          </div>
          <button
            title="Switch Profile / Status"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">sync_alt</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area Offset by Sidebar (72 = 18rem = 288px) */}
      <div className="pl-72">
        {/* Sticky Top Bar */}
        <header className="fixed top-0 left-72 right-0 h-16 bg-[#FAF8F5]/95 backdrop-blur-xl shadow-sm z-40 px-6 flex items-center justify-between border-b border-[#EAE8E5]">
          <div className="flex items-center gap-6">
            {/* Live Sync Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center shrink-0 whitespace-nowrap gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping shrink-0" />
                Live Sync Connected
              </span>
            </div>

            {/* Floor Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#F4EFE6] p-1 rounded-xl border border-[#EAE8E5]">
              <button
                onClick={() => setActiveFloor('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeFloor === 'all'
                    ? 'bg-white text-[#1B1C1A] shadow-sm'
                    : 'text-[#594139] hover:text-[#1B1C1A]'
                }`}
                type="button"
              >
                All Floors (18)
              </button>
              <button
                onClick={() => setActiveFloor('ground')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeFloor === 'ground'
                    ? 'bg-white text-[#1B1C1A] shadow-sm'
                    : 'text-[#594139] hover:text-[#1B1C1A]'
                }`}
                type="button"
              >
                Ground Floor (8)
              </button>
              <button
                onClick={() => setActiveFloor('balcony')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeFloor === 'balcony'
                    ? 'bg-white text-[#1B1C1A] shadow-sm'
                    : 'text-[#594139] hover:text-[#1B1C1A]'
                }`}
                type="button"
              >
                Balcony (6)
              </button>
              <button
                onClick={() => setActiveFloor('rooftop')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeFloor === 'rooftop'
                    ? 'bg-white text-[#1B1C1A] shadow-sm'
                    : 'text-[#594139] hover:text-[#1B1C1A]'
                }`}
                type="button"
              >
                Rooftop Terrace (4)
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center whitespace-nowrap gap-1.5 px-3.5 py-2 rounded-xl bg-[#A33215] text-white text-xs font-bold hover:bg-[#822700] transition-colors shadow-sm active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[17px]">person_add</span>
              <span>+ Quick Walk-in Table</span>
            </button>
            <Link
              href="/menu"
              className="inline-flex items-center whitespace-nowrap gap-1.5 px-3.5 py-2 rounded-xl bg-[#F5F3F0] text-[#1B1C1A] text-xs font-bold hover:bg-[#EAE8E5] transition-colors border border-[#EAE8E5] active:scale-95"
            >
              <span className="material-symbols-outlined text-[17px]">add</span>
              <span>+ Add Menu Item</span>
            </Link>

            <div className="flex items-center gap-1">
              <button
                aria-label="Notifications"
                className="relative w-9 h-9 rounded-xl flex items-center justify-center text-[#594139] hover:bg-[#F4EFE6] transition-colors shrink-0"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#A33215] ring-2 ring-white" />
              </button>
              <button
                aria-label="Refresh live data"
                onClick={() => window.location.reload()}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#594139] hover:bg-[#F4EFE6] transition-colors shrink-0 active:rotate-180 duration-300"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">refresh</span>
              </button>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#A33215] flex items-center justify-center shrink-0 text-white font-bold shadow-sm">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </header>

        {/* Main Dashboard Canvas */}
        <main className="pt-20 pb-16 w-full min-h-screen bg-[#FAF8F5] px-6">
          <div className="flex flex-col w-full max-w-[1600px] mx-auto">
            {/* Top KPI Metric Cards (5-Column Ribbon) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6 w-full">
              {/* Metric 1 */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#EAE8E5] flex flex-col justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-[#594139] uppercase tracking-wider truncate">
                      Total Sales Today
                    </span>
                    <span className="inline-flex items-center shrink-0 whitespace-nowrap gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                      <span className="material-symbols-outlined text-[13px]">trending_up</span>
                      +18.4%
                    </span>
                  </div>
                  <span className="font-display font-black text-2xl text-[#1B1C1A] tracking-tight my-0.5 block whitespace-nowrap">
                    ₹64,280.00
                  </span>
                </div>
                <div className="mt-3 pt-2 flex items-center justify-between gap-2 border-t border-[#F0ECE4]">
                  <p className="text-xs text-[#594139] truncate font-medium">
                    42 Settled Orders Today
                  </p>
                  <span className="text-xs text-emerald-700 font-bold flex items-center shrink-0 whitespace-nowrap">
                    Audited
                    <span className="material-symbols-outlined text-[15px] ml-0.5">verified</span>
                  </span>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#EAE8E5] flex flex-col justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-[#594139] uppercase tracking-wider truncate">
                      Total Floor Occupancy
                    </span>
                    <span className="inline-flex items-center shrink-0 whitespace-nowrap gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                      <span className="material-symbols-outlined text-[13px]">trending_up</span>
                      +12% vs last eve
                    </span>
                  </div>
                  <span className="font-display font-black text-2xl text-[#1B1C1A] tracking-tight my-0.5 block whitespace-nowrap">
                    78%
                  </span>
                </div>
                <div className="mt-3 pt-2 border-t border-[#F0ECE4]">
                  <div className="w-full bg-[#F4EFE6] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#A33215] h-full rounded-full transition-all duration-500" style={{ width: '78%' }} />
                  </div>
                  <p className="text-xs text-[#594139] mt-1.5 truncate font-medium">
                    14 of 18 Tables in Active Service
                  </p>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#EAE8E5] flex flex-col justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-[#594139] uppercase tracking-wider truncate">
                      Live Unbilled Revenue
                    </span>
                    <span className="inline-flex items-center shrink-0 whitespace-nowrap gap-1 px-2 py-0.5 rounded-full bg-[#F4EFE6] text-[#594139] text-[11px] font-bold">
                      <span className="material-symbols-outlined text-[13px]">receipt</span>
                      ₹1,317 avg/table
                    </span>
                  </div>
                  <span className="font-display font-black text-2xl text-[#1B1C1A] tracking-tight my-0.5 block whitespace-nowrap">
                    ₹18,450.00
                  </span>
                </div>
                <div className="mt-3 pt-2 flex items-center justify-between gap-2 border-t border-[#F0ECE4]">
                  <p className="text-xs text-[#594139] truncate font-medium">
                    Across 14 active dining sessions
                  </p>
                  <span className="text-xs text-[#A33215] font-bold flex items-center shrink-0 whitespace-nowrap">
                    Live Sync
                    <span className="material-symbols-outlined text-[15px] ml-0.5">bolt</span>
                  </span>
                </div>
              </div>

              {/* Metric 4 */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#EAE8E5] flex flex-col justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-[#594139] uppercase tracking-wider truncate">
                      Orders in Pipeline
                    </span>
                    <span className="inline-flex items-center shrink-0 whitespace-nowrap gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                      KDS Nominal
                    </span>
                  </div>
                  <span className="font-display font-black text-2xl text-[#1B1C1A] tracking-tight my-0.5 block whitespace-nowrap">
                    7 Orders
                  </span>
                </div>
                <div className="mt-3 pt-2 border-t border-[#F0ECE4]">
                  <div className="flex items-center gap-1.5 text-xs text-[#594139] font-medium flex-wrap">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#CB4914] shrink-0" />
                    <span>3 Awaiting Check</span>
                    <span className="text-stone-300 mx-0.5">•</span>
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    <span>4 In Prep</span>
                  </div>
                </div>
              </div>

              {/* Metric 5 */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#EAE8E5] flex flex-col justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-[#594139] uppercase tracking-wider truncate">
                      Today&apos;s Reservations
                    </span>
                    <span className="inline-flex items-center shrink-0 whitespace-nowrap gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 text-[11px] font-bold">
                      <span className="material-symbols-outlined text-[13px]">event_seat</span>
                      8 Covers Confirmed
                    </span>
                  </div>
                  <span className="font-display font-black text-2xl text-[#1B1C1A] tracking-tight my-0.5 block whitespace-nowrap">
                    12 Bookings
                  </span>
                </div>
                <div className="mt-3 pt-2 flex items-center justify-between gap-2 border-t border-[#F0ECE4]">
                  <p className="text-xs text-[#594139] truncate font-medium">
                    Next in 25 mins • T-06
                  </p>
                  <span className="material-symbols-outlined text-orange-700 text-[18px] shrink-0">
                    calendar_today
                  </span>
                </div>
              </div>
            </div>

            {/* Main Working Canvas (Split 2-Column Grid: 65% Left Column | 35% Right Column) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
              {/* LEFT COLUMN (65%) - Interactive Physical Floor Grid */}
              <div className="xl:col-span-8 flex flex-col gap-5">
                {/* Floor Grid Header & Interactive Control Bar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4 border border-[#EAE8E5]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#A33215]/10 text-[#A33215] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">grid_view</span>
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-base text-[#1B1C1A] leading-tight">
                        Ground Floor Layout • 8 Tables
                      </h2>
                      <span className="text-xs text-[#594139]">
                        Real-time occupancy and guest service floorplan
                      </span>
                    </div>
                  </div>

                  {/* Legend and Mode Toggle */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="hidden sm:flex items-center gap-3 text-xs font-semibold text-[#594139] flex-wrap">
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                        Available
                      </span>
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#A33215]" />
                        Occupied
                      </span>
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#9B4500]" />
                        Reserved
                      </span>
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        Awaiting Settle
                      </span>
                    </div>

                    <div className="inline-flex p-0.5 bg-[#F4EFE6] rounded-xl shrink-0 border border-[#EAE8E5]">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          viewMode === 'grid'
                            ? 'bg-white shadow-sm text-[#1B1C1A]'
                            : 'text-[#594139] hover:text-[#1B1C1A]'
                        }`}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[15px]">grid_4x4</span> Grid
                      </button>
                      <button
                        onClick={() => setViewMode('spatial')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          viewMode === 'spatial'
                            ? 'bg-white shadow-sm text-[#1B1C1A]'
                            : 'text-[#594139] hover:text-[#1B1C1A]'
                        }`}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[15px]">apartment</span> Spatial
                      </button>
                    </div>
                  </div>
                </div>

                {/* Realistic Physical Dining Table Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Table T-12 (Occupied - Main Featured Session) */}
                  <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col justify-between relative overflow-hidden border-2 border-[#A33215]">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#A33215]" />
                    <div>
                      <div className="flex items-start justify-between mb-3 gap-2 flex-wrap">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-10 h-10 rounded-xl bg-[#CB4914] text-white font-display font-extrabold text-base flex items-center justify-center shrink-0 shadow-sm">
                            12
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-display font-bold text-base text-[#1B1C1A] truncate">
                              Table T-12
                            </h3>
                            <span className="text-[11px] font-semibold text-[#594139] block truncate">
                              4-Seater Booth
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center shrink-0 px-2.5 py-1 rounded-full bg-[#FFDBCF] text-[#822700] text-[10px] uppercase tracking-wide font-extrabold whitespace-nowrap">
                          ACTIVE SESSION #RM-9842
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 py-2 bg-[#F5F3F0] rounded-xl px-3 my-2 text-xs">
                        <div>
                          <span className="text-[#594139] block text-[10px] font-bold uppercase">
                            CAPTAIN
                          </span>
                          <span className="font-bold text-[#1B1C1A] truncate block">
                            Rahul S. • Floor 1
                          </span>
                        </div>
                        <div>
                          <span className="text-[#594139] block text-[10px] font-bold uppercase">
                            OCCUPANTS
                          </span>
                          <span className="font-bold text-[#1B1C1A] truncate block">
                            4 Guests • 1h 14m
                          </span>
                        </div>
                      </div>
                      <div className="my-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#594139] font-semibold">
                            Live Bill Counter
                          </span>
                          <span className="font-display font-black text-lg text-[#A33215]">
                            ₹1,128.75
                          </span>
                        </div>
                        <p className="text-xs text-[#594139] mt-0.5 truncate">
                          2x Paneer Butter Masala, 3x Garlic Naan, 2x Chaas
                        </p>
                      </div>
                      {/* Live Alert Badge */}
                      <div className="p-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1.5 text-xs my-2">
                        <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0">priority_high</span>
                        <span className="font-semibold truncate">Special Note: Less butter / light oil requested</span>
                      </div>
                    </div>
                    {/* Quick Action Footer */}
                    <div className="flex items-center gap-2 mt-3 pt-3 bg-[#F5F3F0] -mx-4 -mb-4 p-3 rounded-b-2xl border-t border-[#EAE8E5]">
                      <button
                        className="flex-1 bg-[#A33215] text-white text-xs font-bold py-2 px-3 rounded-xl hover:bg-[#822700] transition-colors flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap active:scale-95"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">restaurant_menu</span>
                        <span>View KOT &amp; Order</span>
                      </button>
                      <button
                        className="bg-white text-[#1B1C1A] text-xs font-bold py-2 px-3 rounded-xl hover:bg-[#EAE8E5] transition-colors shadow-sm flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap border border-[#EAE8E5]"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">print</span>
                        <span>Print Bill</span>
                      </button>
                      <button
                        aria-label="More options"
                        className="w-8 h-8 flex items-center justify-center bg-white text-[#594139] rounded-xl hover:bg-[#EAE8E5] transition-colors shrink-0 border border-[#EAE8E5]"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                      </button>
                    </div>
                  </div>

                  {/* Table T-04 (Occupied - Approaching Prep Completion) */}
                  <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col justify-between relative overflow-hidden border border-[#EAE8E5]">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#9B4500]" />
                    <div>
                      <div className="flex items-start justify-between mb-3 gap-2 flex-wrap">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-10 h-10 rounded-xl bg-[#FD8A42] text-white font-display font-extrabold text-base flex items-center justify-center shrink-0 shadow-sm">
                            04
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-display font-bold text-base text-[#1B1C1A] truncate">
                              Table T-04
                            </h3>
                            <span className="text-[11px] font-semibold text-[#594139] block truncate">
                              2-Seater High Top
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center shrink-0 px-2.5 py-1 rounded-full bg-[#FFDBCA] text-[#682C00] text-[10px] uppercase tracking-wide font-extrabold whitespace-nowrap">
                          ACTIVE SESSION #RM-9845
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 py-2 bg-[#F5F3F0] rounded-xl px-3 my-2 text-xs">
                        <div>
                          <span className="text-[#594139] block text-[10px] font-bold uppercase">
                            CAPTAIN
                          </span>
                          <span className="font-bold text-[#1B1C1A] truncate block">
                            Amit K.
                          </span>
                        </div>
                        <div>
                          <span className="text-[#594139] block text-[10px] font-bold uppercase">
                            GUESTS
                          </span>
                          <span className="font-bold text-[#1B1C1A] truncate block">
                            2 Diners
                          </span>
                        </div>
                      </div>
                      <div className="my-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#594139] font-semibold">
                            Current Bill
                          </span>
                          <span className="font-display font-black text-lg text-[#1B1C1A]">
                            ₹580.00
                          </span>
                        </div>
                        <p className="text-xs text-[#594139] mt-0.5 truncate">
                          Dal Makhani simmering (85%), Dum Biryani Ready
                        </p>
                      </div>
                      {/* Prep completion indicator */}
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-[#594139] mb-1 font-semibold">
                          <span>Plating Status</span>
                          <span className="text-[#9B4500] font-bold">1 of 2 dishes plated</span>
                        </div>
                        <div className="w-full bg-[#F4EFE6] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#9B4500] h-full rounded-full transition-all duration-300" style={{ width: '50%' }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#F0ECE4]">
                      <button
                        className="flex-1 bg-[#EAE8E5] text-[#1B1C1A] text-xs font-bold py-2 px-2.5 rounded-xl hover:bg-[#DBD7CE] transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                        Notify Runner
                      </button>
                      <Link
                        href="/kitchen"
                        className="flex-1 bg-[#F5F3F0] text-[#1B1C1A] text-xs font-bold py-2 px-2.5 rounded-xl hover:bg-[#EAE8E5] transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap border border-[#EAE8E5]"
                      >
                        <span className="material-symbols-outlined text-[16px]">soup_kitchen</span>
                        View KDS
                      </Link>
                    </div>
                  </div>

                  {/* Table T-06 (Reserved) */}
                  <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col justify-between relative overflow-hidden border border-[#EAE8E5]">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#A33215]" />
                    <div>
                      <div className="flex items-start justify-between mb-3 gap-2 flex-wrap">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-10 h-10 rounded-xl bg-[#EAE8E5] text-[#A33215] font-display font-extrabold text-base flex items-center justify-center shrink-0 shadow-sm">
                            06
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-display font-bold text-base text-[#1B1C1A] truncate">
                              Table T-06
                            </h3>
                            <span className="text-[11px] font-semibold text-[#594139] block truncate">
                              4-Seater Window Table
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center shrink-0 px-2.5 py-1 rounded-full bg-red-50 text-[#A33215] text-[10px] uppercase tracking-wide font-extrabold whitespace-nowrap">
                          RESERVED • 19:30 PM
                        </span>
                      </div>
                      <div className="py-2.5 bg-[#F5F3F0] rounded-xl px-3 my-2 text-xs">
                        <span className="text-[#594139] block text-[10px] font-bold uppercase">
                          RESERVATION CONTACT
                        </span>
                        <span className="font-bold text-[#1B1C1A] truncate block mt-0.5">
                          Party of 4 • Guest: Vikram M. (+91 98765-XXXXX)
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#F4EFE6] text-[#594139] flex items-center gap-1.5 text-xs my-2">
                        <span className="material-symbols-outlined text-[16px] text-[#A33215] shrink-0">lock_clock</span>
                        <span className="truncate font-semibold">Table locked for arrival (25m remaining)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#F0ECE4]">
                      <button
                        className="flex-1 bg-[#A33215] text-white text-xs font-bold py-2 px-2.5 rounded-xl hover:bg-[#822700] transition-colors flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap active:scale-95"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Check-in Guests
                      </button>
                      <button
                        className="bg-[#F5F3F0] text-[#1B1C1A] text-xs font-bold py-2 px-3 rounded-xl hover:bg-[#EAE8E5] transition-colors shrink-0 whitespace-nowrap border border-[#EAE8E5]"
                        type="button"
                      >
                        Reassign
                      </button>
                    </div>
                  </div>

                  {/* Table T-08 (Occupied - Plated & Ready) */}
                  <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col justify-between relative overflow-hidden border border-[#EAE8E5]">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-600" />
                    <div>
                      <div className="flex items-start justify-between mb-3 gap-2 flex-wrap">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-display font-extrabold text-base flex items-center justify-center shrink-0 shadow-sm">
                            08
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-display font-bold text-base text-[#1B1C1A] truncate">
                              Table T-08
                            </h3>
                            <span className="text-[11px] font-semibold text-[#594139] block truncate">
                              6-Seater Family Round
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center shrink-0 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] uppercase tracking-wide font-extrabold whitespace-nowrap">
                          READY FOR PICKUP
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 py-2 bg-[#F5F3F0] rounded-xl px-3 my-2 text-xs">
                        <div>
                          <span className="text-[#594139] block text-[10px] font-bold uppercase">
                            CAPTAIN
                          </span>
                          <span className="font-bold text-[#1B1C1A] truncate block">
                            Priya M.
                          </span>
                        </div>
                        <div>
                          <span className="text-[#594139] block text-[10px] font-bold uppercase">
                            RUNNING BILL
                          </span>
                          <span className="font-bold text-[#1B1C1A] truncate block">
                            ₹2,450.00
                          </span>
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 text-xs my-2">
                        <span className="material-symbols-outlined text-[16px] shrink-0 text-emerald-600">inventory</span>
                        <span className="font-bold truncate">All 3 dishes hot &amp; ready at Pass 2</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#F0ECE4]">
                      <button
                        className="flex-1 bg-emerald-700 text-white text-xs font-bold py-2 px-2.5 rounded-xl hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap active:scale-95"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">done_all</span>
                        Mark Served
                      </button>
                      <button
                        className="bg-[#F5F3F0] text-[#1B1C1A] text-xs font-bold py-2 px-3 rounded-xl hover:bg-[#EAE8E5] transition-colors shrink-0 whitespace-nowrap border border-[#EAE8E5]"
                        type="button"
                      >
                        View Bill
                      </button>
                    </div>
                  </div>

                  {/* Table T-01 (Available) */}
                  <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col justify-between border-2 border-dashed border-emerald-600/30">
                    <div>
                      <div className="flex items-start justify-between mb-3 gap-2 flex-wrap">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-10 h-10 rounded-xl bg-[#F4EFE6] text-[#1B1C1A] font-display font-extrabold text-base flex items-center justify-center shrink-0">
                            01
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-display font-bold text-base text-[#1B1C1A] truncate">
                              Table T-01
                            </h3>
                            <span className="text-[11px] font-semibold text-[#594139] block truncate">
                              4-Seater Standard
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center shrink-0 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold whitespace-nowrap">
                          AVAILABLE • QR ACTIVE
                        </span>
                      </div>
                      <div className="my-3 py-2.5 px-3 bg-[#F5F3F0] rounded-xl text-xs text-[#594139] flex items-center gap-2 font-medium">
                        <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0">cleaning_services</span>
                        <span>Sanitized &amp; inspected by housekeeping. Table is ready for seating.</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2">
                      <button
                        className="w-full bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-extrabold py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap border border-emerald-600/30 active:scale-95"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[17px]">person_add</span>
                        Assign Walk-in Guests +
                      </button>
                    </div>
                  </div>

                  {/* Table T-02 (Available) */}
                  <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col justify-between border-2 border-dashed border-emerald-600/30">
                    <div>
                      <div className="flex items-start justify-between mb-3 gap-2 flex-wrap">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-10 h-10 rounded-xl bg-[#F4EFE6] text-[#1B1C1A] font-display font-extrabold text-base flex items-center justify-center shrink-0">
                            02
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-display font-bold text-base text-[#1B1C1A] truncate">
                              Table T-02
                            </h3>
                            <span className="text-[11px] font-semibold text-[#594139] block truncate">
                              4-Seater Standard
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center shrink-0 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold whitespace-nowrap">
                          AVAILABLE • QR ACTIVE
                        </span>
                      </div>
                      <div className="my-3 py-2.5 px-3 bg-[#F5F3F0] rounded-xl text-xs text-[#594139] flex items-center gap-2 font-medium">
                        <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0">cleaning_services</span>
                        <span>Sanitized &amp; inspected by housekeeping. Table is ready for seating.</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2">
                      <button
                        className="w-full bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-extrabold py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap border border-emerald-600/30 active:scale-95"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[17px]">person_add</span>
                        Assign Walk-in Guests +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN (35%) - Live Operational Stream & CMS Preview */}
              <div className="xl:col-span-4 flex flex-col gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col border border-[#EAE8E5]">
                  {/* Interactive Segmented Tab Header */}
                  <div className="flex items-center p-1 bg-[#F4EFE6] rounded-xl w-full mb-4 text-xs font-bold border border-[#EAE8E5] gap-1">
                    <button
                      onClick={() => setRightTab('live')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                        rightTab === 'live'
                          ? 'bg-white text-[#1B1C1A] font-extrabold shadow-sm'
                          : 'text-[#594139] hover:text-[#1B1C1A]'
                      }`}
                      type="button"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#A33215] shrink-0 animate-pulse" />
                      Live Stream
                    </button>
                    <button
                      onClick={() => setRightTab('cms')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                        rightTab === 'cms'
                          ? 'bg-white text-[#1B1C1A] font-extrabold shadow-sm'
                          : 'text-[#594139] hover:text-[#1B1C1A]'
                      }`}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px] shrink-0">edit_note</span>
                      Menu CMS Quick-Edit
                    </button>
                  </div>

                  {/* Section A: Live Waiter Verification Alerts (Tab Content) */}
                  {rightTab === 'live' && (
                    <div className="flex flex-col gap-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between pb-1">
                        <span className="font-display font-bold text-sm text-[#1B1C1A]">
                          Kitchen &amp; Floor Events
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping shrink-0" />
                      </div>

                      {/* Feed Item 1 */}
                      <div className="p-3 rounded-xl bg-[#F5F3F0] flex flex-col gap-1 transition-all hover:bg-[#EAE8E5] border border-[#EAE8E5]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#A33215] truncate">
                            <span className="material-symbols-outlined text-[16px] shrink-0">verified</span>
                            Order Verified • Table T-12
                          </span>
                          <span className="text-[11px] text-[#594139] shrink-0 whitespace-nowrap">
                            2 mins ago
                          </span>
                        </div>
                        <p className="text-xs text-[#1B1C1A]">
                          Waiter <strong>Rahul S.</strong> verified physical seating and punched KOT #K-1082 (
                          <span className="font-bold text-[#A33215]">₹1,128.75</span>).
                        </p>
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-[#EAE8E5] text-[#594139] font-mono text-[10px] font-bold">
                            KOT #1082
                          </span>
                          <span className="px-2 py-0.5 rounded bg-red-100 text-[#A33215] font-mono text-[10px] font-extrabold">
                            PUNCHED
                          </span>
                        </div>
                      </div>

                      {/* Feed Item 2 */}
                      <div className="p-3 rounded-xl bg-[#F5F3F0] flex flex-col gap-1 transition-all hover:bg-[#EAE8E5] border border-[#EAE8E5]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#9B4500] truncate">
                            <span className="material-symbols-outlined text-[16px] shrink-0">notifications</span>
                            Service Buzzer
                          </span>
                          <span className="text-[11px] text-[#594139] shrink-0 whitespace-nowrap">
                            8 mins ago
                          </span>
                        </div>
                        <p className="text-xs text-[#1B1C1A]">
                          <strong>Table T-04</strong> requested water refill via QR app. Waiter <strong>Amit K.</strong> acknowledged.
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#EAE8E5] text-[#594139] font-mono text-[10px] font-bold">
                            DISPATCHED
                          </span>
                        </div>
                      </div>

                      {/* Feed Item 3 */}
                      <div className="p-3 rounded-xl bg-[#F5F3F0] flex flex-col gap-1 transition-all hover:bg-[#EAE8E5] border border-[#EAE8E5]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 truncate">
                            <span className="material-symbols-outlined text-[16px] shrink-0">receipt_long</span>
                            Bill Generated
                          </span>
                          <span className="text-[11px] text-[#594139] shrink-0 whitespace-nowrap">
                            14 mins ago
                          </span>
                        </div>
                        <p className="text-xs text-[#1B1C1A]">
                          <strong>Table T-08</strong> requested UPI settlement (
                          <span className="font-bold text-emerald-700">₹2,450.00</span>). Terminal 02 dispatching receipt.
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-extrabold">
                            PAYMENT PENDING
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section B: Nutritional Transparency Compliance & 86/Stock Widget */}
                  {rightTab === 'cms' && (
                    <div className="flex flex-col gap-3 animate-in fade-in duration-200">
                      <div className="p-3 bg-[#F5F3F0] rounded-xl border border-[#EAE8E5]">
                        <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                          <h4 className="font-display font-bold text-xs text-[#1B1C1A]">
                            Nutritional Transparency
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shrink-0 whitespace-nowrap">
                            Score: 94%
                          </span>
                        </div>
                        <p className="text-[11px] text-[#594139]">
                          Regulatory allergen, macro, and calorie accuracy verified for customer table QR display.
                        </p>
                      </div>

                      {/* 86 & Realtime Stock List */}
                      <div className="flex flex-col gap-2 mt-1">
                        <span className="text-[10px] uppercase tracking-wider text-[#594139] font-bold">
                          Live 86 Stock Toggles
                        </span>

                        {stockItems.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl gap-2 border transition-all ${
                              item.inStock
                                ? 'bg-[#F5F3F0] border-[#EAE8E5]'
                                : 'bg-red-50 border-red-200'
                            }`}
                          >
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-xs font-bold truncate ${
                                    item.inStock ? 'text-[#1B1C1A]' : 'line-through text-[#594139]'
                                  }`}
                                >
                                  {item.name}
                                </span>
                                {!item.inStock && (
                                  <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] uppercase font-black shrink-0 leading-none">
                                    86&apos;D
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-[#594139]">
                                {item.price} • {item.calories}
                              </span>
                            </div>

                            {/* Toggle Switch */}
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                              <input
                                type="checkbox"
                                checked={item.inStock}
                                onChange={() => toggleStock(item.id)}
                                className="sr-only peer"
                              />
                              <div className="w-10 h-5 bg-[#DBD7CE] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
                            </label>
                          </div>
                        ))}
                      </div>

                      {/* CMS Action Bar */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          className="flex-1 bg-[#F5F3F0] text-[#1B1C1A] text-xs font-bold py-2 rounded-xl hover:bg-[#EAE8E5] transition-colors flex items-center justify-center gap-1 whitespace-nowrap border border-[#EAE8E5]"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[15px]">add_box</span>
                          <span>+ Quick 86</span>
                        </button>
                        <Link
                          href="/menu"
                          className="flex-1 bg-[#A33215] text-white text-xs font-bold py-2 rounded-xl hover:bg-[#822700] transition-colors flex items-center justify-center gap-1 whitespace-nowrap shadow-sm text-center"
                        >
                          <span>Full Menu CMS →</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Persistent Audit Ribbon */}
            <div className="p-3 px-4 rounded-2xl bg-[#F5F3F0] flex items-center justify-between shadow-sm relative z-10 border border-[#EAE8E5]">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                <span className="font-mono text-xs text-[#594139] truncate">
                  <strong>Audit Ledger #9842:</strong> Waiter Rahul S. validated physical presence &amp; punched KOT for Table T-12 at 19:42:10 IST • Hash: 0x8f2a...c391
                </span>
              </div>
              <span className="shrink-0 text-xs text-emerald-700 font-extrabold pl-4 whitespace-nowrap">
                SECURITY VERIFIED
              </span>
            </div>
          </div>
        </main>

        {/* Fixed Footer Ticker */}
        <footer className="fixed bottom-0 left-72 right-0 h-10 bg-[#EAE8E5] backdrop-blur-md px-6 z-40 flex items-center justify-between text-[#594139] font-mono text-[11px] shadow-sm border-t border-[#DBD7CE] select-none">
          <div className="flex items-center gap-3 overflow-hidden min-w-0 mr-4">
            <span className="inline-flex items-center gap-1 font-bold uppercase text-[#A33215] shrink-0 whitespace-nowrap">
              <span className="material-symbols-outlined text-[13px]">stream</span>
              Audit Stream
            </span>
            <div className="truncate text-[#594139] min-w-0">
              [20:14:02] Table G-04 settled ₹1,425.00 via Terminal 02 • [20:13:48] Kitchen firing Order #1084 (Mains: Salmon, Ribeye) • [20:11:15] Resv #209 checked-in Floor 1
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0 font-sans text-xs whitespace-nowrap">
            <span className="text-emerald-700 font-bold">LATENCY: 24ms</span>
            <span className="font-semibold text-stone-500">TERM-01 ONLINE</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
