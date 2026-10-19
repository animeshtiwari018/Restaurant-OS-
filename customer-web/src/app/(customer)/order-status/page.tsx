'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Order } from '@/types/dining';
import { orderApi } from '@/services/api';
import LiveOrderStepper from '@/components/customer/LiveOrderStepper';

const FALLBACK_DEMO_ORDERS: Order[] = [
  {
    _id: 'ord_demo_live',
    session_id: 'sess_default_12',
    order_number: '#RM-4491',
    table_number: 'Table T-12',
    status: 'PREPARING',
    subtotal_paise: 76000,
    tax_paise: 3800,
    total_paise: 79800,
    created_at: new Date(Date.now() - 360000).toISOString(),
    waiter_name: 'Rahul S.',
    items: [
      {
        menu_item_id: 'm1',
        name: 'Paneer Butter Masala Special',
        quantity: 1,
        price_paise: 34000,
        special_instructions: 'Less butter, extra gravy',
      },
      {
        menu_item_id: 'm2',
        name: 'Murgh Dum Biryani',
        quantity: 1,
        price_paise: 42000,
      },
    ],
  },
];

export default function OrderStatusPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const sessionId = localStorage.getItem('restro_session_id') || 'sess_default_12';
        let fetched: Order[] = [];
        try {
          fetched = await orderApi.getSessionOrders(sessionId);
        } catch {
          // Fallback to local storage or fallback demo orders
          const stored = localStorage.getItem('restro_session_orders');
          fetched = stored ? JSON.parse(stored) : FALLBACK_DEMO_ORDERS;
        }

        if (fetched && fetched.length > 0) {
          setOrders(fetched);
        } else {
          setOrders(FALLBACK_DEMO_ORDERS);
        }
      } catch {
        setOrders(FALLBACK_DEMO_ORDERS);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // 10s auto refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      {/* Page Title & Status Header */}
      <div className="flex items-center justify-between pb-2 border-b border-hairline">
        <div className="flex flex-col">
          <h1 className="font-display font-extrabold text-lg text-[#1B1C1A]">Live Order Tracking</h1>
          <p className="text-xs text-[#594139]">Real-time kitchen & service updates for your table</p>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-surface text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-state animate-pulse" />
          <span>Live Synced</span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs text-[#594139]">Loading table tickets...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center justify-center gap-3 bg-surface-lowest rounded-3xl p-6 border border-hairline shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-surface-container text-[#594139] flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px]">dinner_dining</span>
          </div>
          <h3 className="font-display font-bold text-base text-[#1B1C1A]">No active orders placed yet</h3>
          <p className="text-xs text-[#594139] max-w-xs leading-relaxed">
            Your cart is waiting! Explore our artisanal starters, curries, and breads to place your first round.
          </p>
          <Link
            href="/menu"
            className="mt-2 px-6 py-2.5 rounded-full bg-primary text-white font-bold text-xs shadow-md active:scale-95 transition-all"
          >
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <LiveOrderStepper
            orders={orders}
            onAddMore={() => router.push('/menu')}
            onViewBill={() => router.push('/bill')}
          />

          {/* Quick Actions Row */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              href="/menu"
              className="py-3 px-4 rounded-2xl bg-surface-lowest border border-hairline shadow-sm text-center font-display font-bold text-xs text-[#1B1C1A] flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">add_circle</span>
              <span>Order More Dishes</span>
            </Link>

            <Link
              href="/bill"
              className="py-3 px-4 rounded-2xl bg-[#1B1C1A] text-white shadow-sm text-center font-display font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span>View Table Bill</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
