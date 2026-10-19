'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Order } from '@/types/dining';
import { orderApi } from '@/services/api';
import BillSettlementCard from '@/components/customer/BillSettlementCard';

const DEMO_BILL_ORDERS: Order[] = [
  {
    _id: 'ord_bill_demo_1',
    session_id: 'sess_default_12',
    order_number: '#RM-4491',
    table_number: 'Table T-12',
    status: 'SERVED',
    subtotal_paise: 76000,
    tax_paise: 3800,
    total_paise: 79800,
    created_at: new Date(Date.now() - 1800000).toISOString(),
    items: [
      {
        menu_item_id: 'm1',
        name: 'Paneer Butter Masala Special',
        quantity: 1,
        price_paise: 34000,
      },
      {
        menu_item_id: 'm2',
        name: 'Murgh Dum Biryani',
        quantity: 1,
        price_paise: 42000,
      },
    ],
  },
  {
    _id: 'ord_bill_demo_2',
    session_id: 'sess_default_12',
    order_number: '#RM-4502',
    table_number: 'Table T-12',
    status: 'SERVED',
    subtotal_paise: 25000,
    tax_paise: 1250,
    total_paise: 26250,
    created_at: new Date(Date.now() - 900000).toISOString(),
    items: [
      {
        menu_item_id: 'm5',
        name: 'Garlic Butter Naan',
        quantity: 2,
        price_paise: 8000,
      },
      {
        menu_item_id: 'm6',
        name: 'Spiced Masala Chaas',
        quantity: 1,
        price_paise: 9000,
      },
    ],
  },
];

export default function CustomerBillPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionBill = async () => {
      try {
        const sessionId = localStorage.getItem('restro_session_id') || 'sess_default_12';
        let fetched: Order[] = [];
        try {
          fetched = await orderApi.getSessionOrders(sessionId);
        } catch {
          const stored = localStorage.getItem('restro_session_orders');
          fetched = stored ? JSON.parse(stored) : DEMO_BILL_ORDERS;
        }

        if (fetched && fetched.length > 0) {
          setOrders(fetched);
        } else {
          setOrders(DEMO_BILL_ORDERS);
        }
      } catch {
        setOrders(DEMO_BILL_ORDERS);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionBill();
  }, []);

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center justify-between pb-2 border-b border-hairline">
        <div className="flex items-center gap-2">
          <Link
            href="/menu"
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-[#594139] active:scale-90"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </Link>
          <div className="flex flex-col">
            <h1 className="font-display font-extrabold text-lg text-[#1B1C1A]">Table Settlement</h1>
            <p className="text-xs text-[#594139]">Official GST invoice & digital checkout</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-amber-surface text-[#822700] px-2.5 py-1 rounded-full text-xs font-bold">
          <span className="material-symbols-outlined text-[14px]">table_restaurant</span>
          <span>T-12</span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs text-[#594139]">Calculating invoice summary...</p>
        </div>
      ) : (
        <div className="w-full">
          <BillSettlementCard
            orders={orders}
            onClose={() => router.push('/menu')}
            onSettled={() => {
              // Wait 2.5 seconds after settled animation and return to menu
              setTimeout(() => {
                localStorage.removeItem('restro_session_orders');
                router.push('/menu');
              }, 2500);
            }}
          />
        </div>
      )}
    </div>
  );
}
