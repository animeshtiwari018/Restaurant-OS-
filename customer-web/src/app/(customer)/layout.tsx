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
  const isStatus = pathname === '/order-status';
  const isBill = pathname === '/bill';

  return (
    <>
      {/* Floating Cart Pill (Shows on menu when items added) */}
      {totalItems > 0 && isMenu && (
        <div className="fixed bottom-16 left-0 right-0 max-w-[480px] mx-auto z-40 px-3 py-2 pointer-events-none">
          <Link
            href="/menu?cart=open"
            className="pointer-events-auto bg-[#1B1C1A] text-white rounded-2xl p-3 shadow-xl flex items-center justify-between border border-white/10 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-display font-bold text-xs shadow-sm">
                {totalItems}
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xs text-white">
                  {formatRupees(totalPaise)}
                </span>
                <span className="text-[10px] text-stone-300">View Cart & Checkout</span>
              </div>
            </div>

            <div className="h-8 px-3 rounded-xl bg-primary text-white font-display font-bold text-xs flex items-center gap-1 shadow-sm">
              <span>Checkout</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </div>
          </Link>
        </div>
      )}

      {/* Customer Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto z-40 bg-[#FAF8F5]/95 backdrop-blur-lg border-t border-hairline py-1.5 px-4 flex items-center justify-around shadow-md">
        <Link
          href="/menu"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
            isMenu ? 'text-primary font-bold' : 'text-[#594139] hover:text-[#1B1C1A]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
          <span className="text-[10px] tracking-tight">Menu</span>
        </Link>

        <Link
          href="/order-status"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
            isStatus ? 'text-primary font-bold' : 'text-[#594139] hover:text-[#1B1C1A]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">pace</span>
          <span className="text-[10px] tracking-tight">Live Status</span>
        </Link>

        <Link
          href="/bill"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
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
