'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Order, OrderStatus } from '@/types/dining';
import { orderApi, sessionApi } from '@/services/api';
import { formatRupees } from '@/context/CartContext';

const DEFAULT_DEMO_ORDER: Order = {
  _id: 'ord_9842',
  session_id: 'sess_12',
  order_number: '#RM-9842',
  table_number: 'T-12',
  status: 'PENDING_VERIFICATION',
  subtotal_paise: 110500,
  tax_paise: 2375,
  total_paise: 112875,
  created_at: new Date(Date.now() - 180000).toISOString(),
  waiter_name: 'Rahul S.',
  items: [
    {
      menu_item_id: 'm1',
      name: 'Paneer Butter Masala Special',
      quantity: 2,
      price_paise: 38500,
      special_instructions: 'Less butter, Medium spice',
      status: 'QUEUED',
    },
    {
      menu_item_id: 'm2',
      name: 'Garlic Butter Naan',
      quantity: 3,
      price_paise: 7500,
      special_instructions: 'Crisp tandoor baked',
      status: 'QUEUED',
    },
    {
      menu_item_id: 'm3',
      name: 'Masala Chaas',
      quantity: 2,
      price_paise: 5500,
      special_instructions: 'Chilled roasted cumin blend',
      status: 'QUEUED',
    },
  ],
};

export default function OrderStatusPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([DEFAULT_DEMO_ORDER]);
  const [loading, setLoading] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(true);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [nudgeSent, setNudgeSent] = useState(false);
  const [serviceToast, setServiceToast] = useState<string | null>(null);

  const [tableNumber, setTableNumber] = useState('T-12');
  const [sessionId, setSessionId] = useState('sess_12');

  // Load orders and sync table/session
  useEffect(() => {
    try {
      const storedTable = localStorage.getItem('restro_table_number');
      if (storedTable) setTableNumber(storedTable);

      const storedSession = localStorage.getItem('restro_session_id');
      if (storedSession) setSessionId(storedSession);
    } catch {
      // fallback
    }

    const fetchOrders = async () => {
      try {
        const curSession = localStorage.getItem('restro_session_id') || sessionId;
        let fetched: Order[] = [];
        try {
          fetched = await orderApi.getSessionOrders(curSession);
        } catch {
          const stored = localStorage.getItem('restro_session_orders');
          if (stored) {
            fetched = JSON.parse(stored);
          }
        }

        if (fetched && fetched.length > 0) {
          setOrders(fetched);
        } else {
          setOrders([DEFAULT_DEMO_ORDER]);
        }
      } catch {
        setOrders([DEFAULT_DEMO_ORDER]);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const latestOrder: Order = orders[orders.length - 1] || DEFAULT_DEMO_ORDER;
  const status: OrderStatus = latestOrder.status || 'PENDING_VERIFICATION';

  // Status mapping to 5 stages (0-4)
  const getStageIndex = (st: OrderStatus): number => {
    switch (st) {
      case 'PENDING_VERIFICATION':
      case 'CLAIMED':
        return 1; // Waiter Verification active
      case 'CONFIRMED':
      case 'PREPARING':
        return 2; // Kitchen Preparing
      case 'READY':
        return 3; // Ready to serve
      case 'SERVED':
        return 4; // Served
      default:
        return 1;
    }
  };

  const currentStageIndex = getStageIndex(status);

  const handleTriggerNudge = () => {
    setNudgeSent(true);
    setTimeout(() => {
      setNudgeSent(false);
    }, 4000);
  };

  const handleSendQuickHelp = (type: string) => {
    try {
      sessionApi.pingWaiter(
        sessionId,
        type === 'Cold Drinking Water' ? 'WATER' : type === 'Clean Table Surface' ? 'CLEANING' : 'ASSISTANCE'
      );
    } catch {
      // ignore
    }
    setServiceToast(`Requested: ${type}`);
    setTimeout(() => {
      setIsServiceModalOpen(false);
      setServiceToast(null);
    }, 1500);
  };

  const orderTimeStr = new Date(latestOrder.created_at || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalBatchPaise = latestOrder.total_paise || 112875;
  const itemsList = latestOrder.items || [];

  return (
    <div className="flex flex-col w-full px-4 pb-24 space-y-4 text-on-surface">
      {/* 1. Live Status Hero Card */}
      <div className="relative overflow-hidden bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/20 mt-3">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-secondary-container/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[14px]">table_restaurant</span>
              </span>
              <span className="font-display font-bold text-[10px] text-on-surface-variant uppercase tracking-wider">
                Active Dine-in Session
              </span>
            </div>
            <h2 className="font-display font-extrabold text-lg text-on-surface tracking-tight leading-tight">
              Table {latestOrder.table_number || tableNumber} • Ground Floor
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Order ID:{' '}
              <span className="font-mono font-semibold text-on-surface">
                {latestOrder.order_number || '#RM-9842'}
              </span>
            </p>
          </div>

          <div className="flex flex-col items-end flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container/15 text-secondary font-display font-bold text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
              </span>
              {status === 'PENDING_VERIFICATION'
                ? 'Awaiting Waiter Check'
                : status === 'PREPARING'
                ? 'In Kitchen Prep'
                : status === 'READY'
                ? 'Ready to Serve'
                : 'Served to Table'}
            </span>

            <div className="flex flex-col items-end mt-2 px-2.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-1 text-on-surface-variant">
                <span className="material-symbols-outlined text-[13px] text-primary">schedule</span>
                <span className="font-display font-bold text-[10px] uppercase tracking-wider text-on-surface-variant">
                  Prep Time
                </span>
              </div>
              <span className="font-display font-extrabold text-base text-primary leading-tight">
                ~18–22 mins
              </span>
            </div>
          </div>
        </div>

        {/* Micro Session Table Steward Bar */}
        <div className="mt-3.5 bg-surface-container-low rounded-xl p-2.5 flex items-center justify-between gap-2.5 border border-outline-variant/30">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">support_agent</span>
              </div>
              <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary border border-surface-container-lowest" />
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-display font-bold text-xs text-on-surface truncate">
                  {latestOrder.waiter_name || 'Rahul S.'}
                </p>
                <span className="px-1.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-display font-bold text-[10px] leading-none">
                  On Duty
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant truncate">
                Dedicated Table Captain & Steward
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsServiceModalOpen(true)}
            aria-label="Call Steward Rahul"
            className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-lowest hover:bg-primary hover:text-white text-primary font-display font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[15px]">notifications_active</span>
            <span>Call Steward</span>
          </button>
        </div>
      </div>

      {/* 2. State Machine Timeline (5 Stepper Stages) */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/20">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[20px]">timeline</span>
            <h3 className="font-display font-bold text-sm text-on-surface">Order Progress</h3>
          </div>
          <span className="text-[11px] font-display font-semibold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006B2C] animate-pulse" />
            Live Sync
          </span>
        </div>

        <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E4E2DF] before:z-0">
          {/* Stage 1: Order Placed */}
          <div className="relative flex items-start gap-3">
            <div
              className={`absolute -left-6 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shadow-sm z-10 text-white ${
                currentStageIndex >= 0 ? 'bg-[#006B2C]' : 'bg-[#EAE8E5] text-[#594139]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] font-bold">check</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-1">
                <h4 className="font-display font-bold text-xs text-on-surface">
                  Order Placed & Submitted
                </h4>
                <span className="text-[11px] text-on-surface-variant">{orderTimeStr}</span>
              </div>
              <p className="text-xs text-on-surface-variant">Sent digitally from Table T-12 device.</p>
            </div>
          </div>

          {/* Stage 2: Waiter Verification */}
          <div className="relative flex items-start gap-3">
            <div
              className={`absolute -left-6 mt-1 w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                currentStageIndex > 1
                  ? 'bg-[#006B2C] text-white shadow-sm'
                  : currentStageIndex === 1
                  ? 'bg-[#FD8A42] text-[#682C00] shadow-md animate-bounce ring-4 ring-[#FD8A42]/20'
                  : 'bg-[#EAE8E5] text-[#594139]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {currentStageIndex > 1 ? 'check' : 'person_check'}
              </span>
            </div>

            {currentStageIndex === 1 ? (
              <div className="flex-1 min-w-0 bg-[#FFDBCF]/30 rounded-xl p-3 -ml-1 border border-[#A33215]/20">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h4 className="font-display font-bold text-xs text-primary flex items-center gap-1.5">
                    <span>Waiter Verification</span>
                    <span className="w-2 h-2 rounded-full bg-[#9B4500] animate-ping" />
                  </h4>
                  <span className="text-[10px] font-display font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary text-on-primary">
                    In Action
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Waiter <span className="font-semibold text-on-surface">Rahul S.</span> notified to verify Table T-12 and punch KOT.
                </p>

                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={nudgeSent}
                    onClick={handleTriggerNudge}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-lowest text-primary text-xs font-display font-bold shadow-sm active:scale-95 transition-transform cursor-pointer border border-outline-variant/30"
                    id="nudge-btn"
                  >
                    <span className="material-symbols-outlined text-[14px] text-primary">notifications_active</span>
                    <span>Friendly Wave</span>
                  </button>
                  {nudgeSent && (
                    <span className="text-xs text-[#006B2C] font-semibold animate-in fade-in">
                      Rahul notified!
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={`flex-1 min-w-0 ${
                  currentStageIndex < 1 ? 'opacity-60' : ''
                }`}
              >
                <h4 className="font-display font-bold text-xs text-on-surface">Waiter Verification</h4>
                <p className="text-xs text-on-surface-variant">Steward confirmed requests & fired KOT.</p>
              </div>
            )}
          </div>

          {/* Stage 3: Kitchen & Preparing */}
          <div
            className={`relative flex items-start gap-3 ${
              currentStageIndex < 2 ? 'opacity-60' : ''
            }`}
          >
            <div
              className={`absolute -left-6 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                currentStageIndex > 2
                  ? 'bg-[#006B2C] text-white shadow-sm'
                  : currentStageIndex === 2
                  ? 'bg-[#FD8A42] text-[#682C00] shadow-md animate-pulse ring-4 ring-[#FD8A42]/20'
                  : 'bg-[#EAE8E5] text-[#594139]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {currentStageIndex > 2 ? 'check' : 'soup_kitchen'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-1">
                <h4 className="font-display font-bold text-xs text-on-surface">
                  Sent to Kitchen & Preparing
                </h4>
                <span className="text-[11px] text-on-surface-variant">Est. ~15m</span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Routing to KDS Station 2 (Curry & Tandoor).
              </p>
            </div>
          </div>

          {/* Stage 4: Ready to Serve */}
          <div
            className={`relative flex items-start gap-3 ${
              currentStageIndex < 3 ? 'opacity-60' : ''
            }`}
          >
            <div
              className={`absolute -left-6 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                currentStageIndex > 3
                  ? 'bg-[#006B2C] text-white shadow-sm'
                  : currentStageIndex === 3
                  ? 'bg-[#FD8A42] text-[#682C00] shadow-md animate-pulse ring-4 ring-[#FD8A42]/20'
                  : 'bg-[#EAE8E5] text-[#594139]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">room_service</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-display font-bold text-xs text-on-surface">Ready to Serve</h4>
              <p className="text-xs text-on-surface-variant">
                Plated and awaiting pickup at service counter.
              </p>
            </div>
          </div>

          {/* Stage 5: Served */}
          <div
            className={`relative flex items-start gap-3 ${
              currentStageIndex < 4 ? 'opacity-40' : ''
            }`}
          >
            <div
              className={`absolute -left-6 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                currentStageIndex >= 4
                  ? 'bg-[#006B2C] text-white shadow-sm'
                  : 'bg-[#EAE8E5] text-[#594139]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">flatware</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-display font-bold text-xs text-on-surface">
                Served to Table {tableNumber}
              </h4>
              <p className="text-xs text-on-surface-variant">Enjoy your fresh artisanal meal!</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Active Items in this Batch (Interactive Accordion) */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/20">
        <button
          type="button"
          onClick={() => setIsBatchOpen((v) => !v)}
          className="w-full flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
            <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-bold text-sm text-on-surface whitespace-nowrap">
                  Active Batch #1
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-display font-bold text-[10px] whitespace-nowrap flex-shrink-0">
                  {itemsList.length} Items
                </span>
              </div>
              <p className="text-xs text-on-surface-variant truncate">Table T-12 Unbilled Balance</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-display font-extrabold text-sm text-primary">
              {formatRupees(totalBatchPaise)}
            </span>
            <span
              className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${
                isBatchOpen ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </div>
        </button>

        {isBatchOpen && (
          <div className="mt-3.5 pt-3 border-t border-outline-variant/20 space-y-3 animate-in fade-in duration-200">
            {itemsList.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <span
                    className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-surface-container mt-0.5 flex-shrink-0 border border-outline-variant/30"
                    title="Veg"
                  >
                    <span className="w-2 h-2 rounded-full bg-tertiary" />
                  </span>
                  <div className="min-w-0">
                    <h5 className="font-display font-bold text-xs text-on-surface leading-snug">
                      {item.name}
                    </h5>
                    {item.special_instructions && (
                      <p className="text-[11px] text-primary mt-0.5 flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[13px]">tune</span>
                        Custom: {item.special_instructions}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[11px] text-on-surface-variant">
                    {item.quantity} × {formatRupees(item.price_paise)}
                  </span>
                  <p className="font-display font-bold text-xs text-on-surface">
                    {formatRupees(item.price_paise * item.quantity)}
                  </p>
                </div>
              </div>
            ))}

            {/* Subtotal & Tax Breakdown */}
            <div className="bg-surface-container-low rounded-xl p-2.5 mt-2 space-y-1 text-xs border border-outline-variant/20">
              <div className="flex justify-between text-on-surface-variant">
                <span>Taxes & GST (5%)</span>
                <span>{formatRupees(latestOrder.tax_paise || 2375)}</span>
              </div>
              <div className="flex justify-between font-display font-bold text-on-surface pt-1 border-t border-outline-variant/20">
                <span>Batch Total</span>
                <span className="text-primary">{formatRupees(totalBatchPaise)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Quick Waiter & Table Service Actions */}
      <div className="grid grid-cols-2 gap-3">
        {/* Call Waiter */}
        <button
          type="button"
          onClick={() => setIsServiceModalOpen(true)}
          className="flex flex-col items-start p-3.5 rounded-2xl bg-surface-container-lowest text-left shadow-sm hover:bg-surface-container-low active:scale-[0.98] transition-all min-h-[104px] justify-between border border-outline-variant/20 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-2">
            <span className="material-symbols-outlined text-[22px]">room_service</span>
          </div>
          <div>
            <span className="font-display font-bold text-xs text-on-surface block leading-tight">
              Call Waiter
            </span>
            <span className="text-[11px] text-on-surface-variant">Water, cutlery & help</span>
          </div>
        </button>

        {/* View Session Bill */}
        <Link
          href="/bill"
          className="flex flex-col items-start p-3.5 rounded-2xl bg-surface-container-lowest text-left shadow-sm hover:bg-surface-container-low active:scale-[0.98] transition-all min-h-[104px] justify-between border border-outline-variant/20 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary mb-2">
            <span className="material-symbols-outlined text-[22px]">receipt</span>
          </div>
          <div>
            <span className="font-display font-bold text-xs text-on-surface block leading-tight">
              Session Bill
            </span>
            <span className="text-[11px] text-on-surface-variant">Running total & split</span>
          </div>
        </Link>
      </div>

      {/* 5. Service Request Modal Drawer (Toggled dynamically) */}
      {isServiceModalOpen && (
        <div
          onClick={() => setIsServiceModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-0 transition-opacity animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[480px] bg-surface-container-lowest rounded-t-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200 border-t border-outline-variant/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  notifications
                </span>
                <h3 className="font-display font-bold text-base text-on-surface">
                  Table Service Request
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant cursor-pointer active:scale-90"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              What can we bring to Table {tableNumber}?
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleSendQuickHelp('Cold Drinking Water')}
                className="p-3 bg-surface-container-low hover:bg-primary-fixed/40 rounded-xl text-left active:bg-primary-fixed transition-colors flex items-center gap-2 min-h-[48px] border border-outline-variant/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">water_drop</span>
                <span className="font-display font-bold text-xs text-on-surface">Drinking Water</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendQuickHelp('Extra Cutlery & Plates')}
                className="p-3 bg-surface-container-low hover:bg-primary-fixed/40 rounded-xl text-left active:bg-primary-fixed transition-colors flex items-center gap-2 min-h-[48px] border border-outline-variant/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">fork_spoon</span>
                <span className="font-display font-bold text-xs text-on-surface">Extra Cutlery</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendQuickHelp('Clean Table Surface')}
                className="p-3 bg-surface-container-low hover:bg-primary-fixed/40 rounded-xl text-left active:bg-primary-fixed transition-colors flex items-center gap-2 min-h-[48px] border border-outline-variant/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">
                  cleaning_services
                </span>
                <span className="font-display font-bold text-xs text-on-surface">Clean Table</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendQuickHelp('Special Cooking Query')}
                className="p-3 bg-surface-container-low hover:bg-primary-fixed/40 rounded-xl text-left active:bg-primary-fixed transition-colors flex items-center gap-2 min-h-[48px] border border-outline-variant/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">chat</span>
                <span className="font-display font-bold text-xs text-on-surface">Chef Question</span>
              </button>
            </div>

            {serviceToast && (
              <div className="p-2.5 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed font-display font-bold text-xs flex items-center gap-2 animate-in fade-in">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>{serviceToast}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Hospitality Reassurance & Order Addendum Card */}
      <div className="bg-surface-container-low rounded-2xl p-4 flex items-start gap-3 border border-outline-variant/20">
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-[18px]">restaurant</span>
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-display font-bold text-xs text-on-surface">Craving something else?</h4>
          <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
            You can place additional rounds anytime without closing your active table session.
          </p>
          <div className="mt-3">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-white font-display font-bold text-xs shadow-sm active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>+ Add More Dishes from Menu</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 7. Chef's Note / Live Kitchen Snapshot Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm border border-outline-variant/20 flex items-center gap-3">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3clq-DVhT7mRZN_qOimwFeWzGk7X8jGO-6D4_G7qXOMzgvtxA7T20QjwFdSAIjRRMMNlRfDDz9O7sU4SN1rWHSTT_r9del-oBOH50XfGGM2rAUHvTK8b9okxLhlUT4_n7zv4K6NC4tW0z-znlxbE8L35AJCh7ad_eSlNEDj5sHbt0TGR-YaOxRLz1XpuivdNL_Lc_3WV0R_sg-639T1wXuXbDWkOOY04mjycXClL0O8HFZM_AHxGkug"
          alt="Freshly baked tandoori naans"
          className="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow-sm border border-outline-variant/20"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-tertiary text-[11px] font-display font-semibold">
            <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
            <span>Kitchen Warmth</span>
          </div>
          <p className="font-display font-bold text-xs text-on-surface mt-0.5 truncate">
            Freshly Kneaded Naans
          </p>
          <p className="text-[11px] text-on-surface-variant line-clamp-1">
            Baked live in traditional clay tandoor oven.
          </p>
        </div>
      </div>
    </div>
  );
}
