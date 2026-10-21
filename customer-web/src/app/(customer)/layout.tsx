'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CartProvider, useCart } from '@/context/CartContext';
import TableSessionHeader from '@/components/customer/TableSessionHeader';

function CustomerBottomNav() {
  const pathname = usePathname();
  const { totalItems, totalPaise, formatRupees } = useCart();

  const isMenu = pathname === '/' || pathname === '/menu' || pathname.startsWith('/t/');
  const isMyOrder = pathname === '/my-order';
  const isStatus = pathname === '/order-status';
  const isBill = pathname === '/bill';

  return (
    <>
      {/* Floating Cart Pill (Shows on menu when items added, links to /my-order) */}
      {totalItems > 0 && isMenu && (
        <div className="fixed bottom-[68px] left-0 right-0 max-w-[480px] mx-auto z-40 px-3.5 pointer-events-none animate-in slide-in-from-bottom-3 duration-200">
          <Link
            href="/my-order"
            className="pointer-events-auto w-full bg-[#232323] text-white rounded-[22px] px-3 py-2.5 shadow-2xl flex items-center justify-between border border-white/10 active:scale-[0.98] transition-all duration-150"
          >
            {/* Left Info: Basket icon + Dishes Count & Total + Green tax disclaimer */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#342823] flex items-center justify-center text-[#E6C3B1] flex-shrink-0 shadow-inner">
                <span className="material-symbols-outlined text-[19px]">shopping_basket</span>
              </div>
              <div className="flex flex-col min-w-0 leading-tight">
                <div className="flex items-baseline gap-1.5 tracking-tight truncate">
                  <span className="text-stone-300 font-medium text-xs">
                    {totalItems} {totalItems === 1 ? 'Dish' : 'Dishes'}
                  </span>
                  <span className="text-stone-500 text-[11px]">•</span>
                  <span className="font-display font-black text-[15px] text-white tracking-tight drop-shadow-sm">
                    {formatRupees(totalPaise)}
                  </span>
                </div>
                <span className="text-[10.5px] font-semibold text-[#22C55E] tracking-tight mt-0.5">
                  Taxes &amp; Table Cover Incl.
                </span>
              </div>
            </div>

            {/* Right Action: Terracotta CTA Button */}
            <div className="h-9 px-3.5 rounded-xl bg-[#B3390B] hover:bg-[#9E320A] text-white font-display font-bold text-xs flex items-center gap-1.5 shadow-md flex-shrink-0 active:scale-95 transition-transform">
              <span>Review Order</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </div>
          </Link>
        </div>
      )}

      {/* Customer Bottom Navigation Bar with 4 Tabs */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto z-40 bg-[#FAF8F5]/95 backdrop-blur-lg border-t border-hairline py-1.5 px-2 flex items-center justify-around shadow-md">
        <Link
          href="/menu"
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all ${
            isMenu ? 'text-primary font-bold' : 'text-[#594139] hover:text-[#1B1C1A]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
          <span className="text-[10px] tracking-tight">Menu</span>
        </Link>

        <Link
          href="/my-order"
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all relative ${
            isMyOrder ? 'text-primary font-bold' : 'text-[#594139] hover:text-[#1B1C1A]'
          }`}
        >
          <div className="relative">
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-primary text-white font-display text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none shadow-sm">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Your Order</span>
        </Link>

        <Link
          href="/order-status"
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all ${
            isStatus ? 'text-primary font-bold' : 'text-[#594139] hover:text-[#1B1C1A]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">soup_kitchen</span>
          <span className="text-[10px] tracking-tight">Live Status</span>
        </Link>

        <Link
          href="/bill"
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all ${
            isBill ? 'text-primary font-bold' : 'text-[#594139] hover:text-[#1B1C1A]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          <span className="text-[10px] tracking-tight">Bill & Pay</span>
        </Link>
      </nav>
    </>
  );
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="w-full max-w-[480px] mx-auto min-h-screen bg-surface flex flex-col font-sans pb-20 relative shadow-sm">
        {/* Authoritative Customer Session Header */}
        <TableSessionHeader />

        {/* Customer Content */}
        <main className="flex-1 w-full">{children}</main>

        {/* Customer Bottom Navigation & Float Cart */}
        <CustomerBottomNav />
      </div>
    </CartProvider>
  );
}
