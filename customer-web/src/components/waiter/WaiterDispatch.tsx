'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/types/dining';
import { formatRupees } from '@/context/CartContext';
import { waiterApi } from '@/services/api';
import VerificationModal from './VerificationModal';

const MOCK_WAIT_ORDERS: Order[] = [
  {
    _id: 'ord_9842',
    session_id: 'sess_12',
    order_number: '#RM-9842',
    table_number: 'T-12',
    status: 'PENDING_VERIFICATION',
    subtotal_paise: 112875,
    tax_paise: 5644,
    total_paise: 118519,
    created_at: new Date(Date.now() - 90000).toISOString(),
    items: [
      {
        menu_item_id: 'm1',
        name: 'Paneer Butter Masala Special',
        quantity: 2,
        price_paise: 37000,
        special_instructions: 'Less butter, light oil, piping hot',
      },
      {
        menu_item_id: 'm2',
        name: 'Garlic Butter Naan',
        quantity: 3,
        price_paise: 8000,
      },
      {
        menu_item_id: 'm3',
        name: 'Spiced Masala Chaas',
        quantity: 2,
        price_paise: 7437,
      },
    ],
  },
  {
    _id: 'ord_9845',
    session_id: 'sess_04',
    order_number: '#RM-9845',
    table_number: 'T-04',
    status: 'PENDING_VERIFICATION',
    subtotal_paise: 68000,
    tax_paise: 3400,
    total_paise: 71400,
    created_at: new Date(Date.now() - 240000).toISOString(),
    items: [
      {
        menu_item_id: 'm4',
        name: 'Tandoori Malai Broccoli',
        quantity: 1,
        price_paise: 38000,
      },
      {
        menu_item_id: 'm5',
        name: 'Rumali Roti',
        quantity: 2,
        price_paise: 6000,
      },
      {
        menu_item_id: 'm6',
        name: 'Fresh Lime Soda',
        quantity: 1,
        price_paise: 18000,
      },
    ],
  },
  {
    _id: 'ord_9840',
    session_id: 'sess_08',
    order_number: '#RM-9840',
    table_number: 'T-08',
    status: 'READY',
    subtotal_paise: 92000,
    tax_paise: 4600,
    total_paise: 96600,
    created_at: new Date(Date.now() - 900000).toISOString(),
    waiter_name: 'Rahul S.',
    items: [
      {
        menu_item_id: 'm7',
        name: 'Murgh Dum Biryani',
        quantity: 2,
        price_paise: 42000,
      },
      {
        menu_item_id: 'm8',
        name: 'Burani Raita',
        quantity: 1,
        price_paise: 8000,
      },
    ],
  },
];

type ActiveTab = 'UNASSIGNED' | 'MY_TABLES' | 'READY_SERVE';

export const WaiterDispatch: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('UNASSIGNED');
  const [orders, setOrders] = useState<Order[]>(MOCK_WAIT_ORDERS);
  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);
  const [claimedOrderIds, setClaimedOrderIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Poll or fetch queue orders
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const queue = await waiterApi.getQueueOrders();
        if (queue && queue.length > 0) {
          setOrders(queue);
        }
      } catch {
        // Fallback to initial mock orders
      }
    };
    fetchQueue();
  }, []);

  const handleClaim = (order: Order) => {
    // Atomic first-come lock simulation
    setClaimedOrderIds((prev) => [...prev, order._id]);
    setVerifyingOrder(order);
  };

  const handleConfirmKOT = async (orderId: string, checks: any) => {
    try {
      await waiterApi.verifyOrder(orderId, 'CONFIRM', checks);
    } catch {
      // Offline fallback
    }

    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId
          ? { ...o, status: 'PREPARING' as OrderStatus, waiter_name: 'Rahul S.' }
          : o
      )
    );

    setNotification(`KOT Ticket punched for Table ${verifyingOrder?.table_number}! Dispatched to Kitchen.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRejectOrder = async (orderId: string, reason: string) => {
    try {
      await waiterApi.verifyOrder(orderId, 'REJECT', { rejectionReason: reason, customerPresent: false, allergensReviewed: false });
    } catch {
      // Offline fallback
    }

    setOrders((prev) => prev.filter((o) => o._id !== orderId));
    setClaimedOrderIds((prev) => prev.filter((id) => id !== orderId));
    setNotification(`Order rejected: ${reason}`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleMarkServed = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId ? { ...o, status: 'SERVED' as OrderStatus } : o
      )
    );
    setNotification('Order marked as SERVED at Table.');
    setTimeout(() => setNotification(null), 3000);
  };

  const unassignedOrders = orders.filter((o) => o.status === 'PENDING_VERIFICATION');
  const myTablesOrders = orders.filter(
    (o) => o.status === 'CLAIMED' || o.status === 'CONFIRMED' || o.status === 'PREPARING'
  );
  const readyOrders = orders.filter((o) => o.status === 'READY');

  return (
    <div className="w-full max-w-[540px] mx-auto flex flex-col font-sans pb-16">
      {/* Waiter Shift Header Card */}
      <div className="bg-surface-lowest rounded-3xl border border-hairline p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-bold shadow-sm">
              <span className="material-symbols-outlined text-[22px]">badge</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-base text-[#1B1C1A]">Rahul S.</span>
                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
                  Captain #04
                </span>
              </div>
              <span className="text-xs text-[#594139]">Ground Floor Dining Room</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-surface text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-state animate-pulse" />
            <span>On Duty</span>
          </div>
        </div>

        {/* Quick Shift Metrics Strip */}
        <div className="mt-3 bg-surface-container rounded-2xl p-3 border border-hairline flex items-center justify-between text-center">
          <div className="flex-1">
            <span className="font-display font-extrabold text-lg text-[#1B1C1A]">4</span>
            <p className="text-[10px] text-[#594139] uppercase font-bold">My Tables</p>
          </div>
          <div className="w-px h-6 bg-hairline" />
          <div className="flex-1">
            <span className="font-display font-extrabold text-lg text-primary">{unassignedOrders.length}</span>
            <p className="text-[10px] text-primary uppercase font-bold">Pending Claims</p>
          </div>
          <div className="w-px h-6 bg-hairline" />
          <div className="flex-1">
            <span className="font-display font-extrabold text-lg text-emerald-state">{readyOrders.length}</span>
            <p className="text-[10px] text-emerald-800 uppercase font-bold">Ready Pickup</p>
          </div>
        </div>
      </div>

      {/* Floating Alert Banner */}
      {notification && (
        <div className="mx-4 mt-3 bg-emerald-surface border border-emerald-300 text-emerald-900 p-3 rounded-2xl text-xs font-semibold shadow-md flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[18px] text-emerald-state">check_circle</span>
          <span>{notification}</span>
        </div>
      )}

      {/* Segmented Queue Tabs */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 bg-surface-container p-1 rounded-2xl border border-hairline">
          <button
            onClick={() => setActiveTab('UNASSIGNED')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'UNASSIGNED'
                ? 'bg-primary text-white shadow-sm'
                : 'text-[#594139] hover:text-[#1B1C1A]'
            }`}
          >
            <span>Unassigned Queue</span>
            {unassignedOrders.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === 'UNASSIGNED' ? 'bg-white text-primary' : 'bg-primary text-white'
              }`}>
                {unassignedOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('MY_TABLES')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'MY_TABLES'
                ? 'bg-primary text-white shadow-sm'
                : 'text-[#594139] hover:text-[#1B1C1A]'
            }`}
          >
            <span>My Tables</span>
            {myTablesOrders.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-surface-lowest text-[#1B1C1A]">
                {myTablesOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('READY_SERVE')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'READY_SERVE'
                ? 'bg-primary text-white shadow-sm'
                : 'text-[#594139] hover:text-[#1B1C1A]'
            }`}
          >
            <span>Ready ({readyOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Orders List View */}
      <main className="p-4 flex flex-col gap-3">
        {/* TAB 1: UNASSIGNED QUEUE */}
        {activeTab === 'UNASSIGNED' && (
          <>
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                Immediate Action • FIFO Dispatch
              </span>
              <span className="text-[11px] text-[#594139] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-state animate-pulse" />
                Live Synced
              </span>
            </div>

            {unassignedOrders.length === 0 ? (
              <div className="py-12 bg-surface-lowest rounded-3xl p-6 text-center border border-hairline flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[32px] text-emerald-state">check_circle</span>
                <p className="font-display font-bold text-sm text-[#1B1C1A]">Queue is Clear</p>
                <p className="text-xs text-[#594139]">No pending customer scans. All tables are handled.</p>
              </div>
            ) : (
              unassignedOrders.map((order) => {
                const totalPortions = order.items.reduce((s, i) => s + i.quantity, 0);

                return (
                  <article
                    key={order._id}
                    className="bg-surface-lowest rounded-3xl p-4 shadow-sm border border-hairline flex flex-col gap-3 hover:border-outline-subtle transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-hairline">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-surface text-[#822700] text-[10px] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-state animate-ping" />
                          AWAITING CLAIM
                        </span>
                        <span className="font-mono text-xs text-[#594139] font-bold">
                          {order.order_number}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#594139] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">schedule</span>
                        <span>1m ago</span>
                      </span>
                    </div>

                    {/* Table Info */}
                    <div className="flex items-baseline justify-between">
                      <div>
                        <h2 className="font-display font-extrabold text-lg text-[#1B1C1A]">
                          Table {order.table_number}
                        </h2>
                        <span className="text-xs text-[#594139]">Ground Floor • Active QR Order</span>
                      </div>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Priority
                      </span>
                    </div>

                    {/* Dishes Breakdown */}
                    <div className="flex flex-col gap-1.5 bg-surface-container rounded-2xl p-2.5 border border-hairline">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex flex-col text-xs">
                          <div className="flex justify-between font-semibold text-[#1B1C1A]">
                            <span>{item.quantity}x {item.name}</span>
                            <span>{formatRupees(item.price_paise * item.quantity)}</span>
                          </div>
                          {item.special_instructions && (
                            <span className="text-[10px] text-primary flex items-center gap-1 mt-0.5">
                              <span className="material-symbols-outlined text-[12px]">edit_note</span>
                              <span>Note: {item.special_instructions}</span>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Total & Summary */}
                    <div className="flex items-center justify-between text-xs text-[#594139] px-1">
                      <span>{order.items.length} dishes • {totalPortions} portions</span>
                      <span className="font-display font-extrabold text-sm text-primary">
                        Total {formatRupees(order.total_paise)}
                      </span>
                    </div>

                    {/* Primary Claim CTA */}
                    <button
                      onClick={() => handleClaim(order)}
                      className="w-full h-12 rounded-2xl bg-primary hover:bg-primary-dark text-white font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">bolt</span>
                      <span>⚡ Claim Order (First-Come Lock)</span>
                    </button>
                  </article>
                );
              })
            )}
          </>
        )}

        {/* TAB 2: MY TABLES */}
        {activeTab === 'MY_TABLES' && (
          <div className="flex flex-col gap-3">
            {myTablesOrders.length === 0 ? (
              <div className="py-12 bg-surface-lowest rounded-3xl p-6 text-center border border-hairline flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[32px] text-[#594139]">table_restaurant</span>
                <p className="font-display font-bold text-sm text-[#1B1C1A]">No In-Progress Orders</p>
                <p className="text-xs text-[#594139]">Claim orders from the unassigned queue to manage them.</p>
              </div>
            ) : (
              myTablesOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-surface-lowest rounded-3xl p-4 shadow-sm border border-hairline flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-base text-[#1B1C1A]">
                        Table {order.table_number}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-surface text-emerald-800 text-[10px] font-bold">
                        {order.status}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-[#594139]">{order.order_number}</span>
                  </div>

                  <div className="flex flex-col gap-1 text-xs text-[#594139]">
                    {order.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{i.quantity}x {i.name}</span>
                        <span>{formatRupees(i.price_paise * i.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-hairline flex justify-between items-center text-xs">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">soup_kitchen</span>
                      <span>Dispatched to Kitchen</span>
                    </span>
                    <span className="font-display font-bold text-[#1B1C1A]">
                      {formatRupees(order.total_paise)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: READY TO SERVE */}
        {activeTab === 'READY_SERVE' && (
          <div className="flex flex-col gap-3">
            {readyOrders.length === 0 ? (
              <div className="py-12 bg-surface-lowest rounded-3xl p-6 text-center border border-hairline flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[32px] text-emerald-state">done_all</span>
                <p className="font-display font-bold text-sm text-[#1B1C1A]">No Orders Awaiting Pickup</p>
                <p className="text-xs text-[#594139]">Kitchen will notify here when dishes are hot and plated.</p>
              </div>
            ) : (
              readyOrders.map((order) => (
                <article
                  key={order._id}
                  className="bg-surface-lowest rounded-3xl p-4 shadow-sm border border-emerald-300 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-hairline">
                    <span className="bg-emerald-state text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">dinner_dining</span>
                      <span>READY FOR TABLE</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-[#1B1C1A]">{order.order_number}</span>
                  </div>

                  <div>
                    <h3 className="font-display font-extrabold text-lg text-[#1B1C1A]">
                      Table {order.table_number}
                    </h3>
                    <p className="text-xs text-[#594139]">Plated at Curry Station. Pickup immediately.</p>
                  </div>

                  <div className="bg-surface-container rounded-2xl p-2.5 text-xs flex flex-col gap-1">
                    {order.items.map((i, idx) => (
                      <span key={idx} className="font-semibold text-[#1B1C1A]">
                        {i.quantity}x {i.name}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleMarkServed(order._id)}
                    className="w-full h-11 rounded-2xl bg-emerald-state hover:bg-emerald-700 text-white font-display font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">task_alt</span>
                    <span>Delivered & Mark Served</span>
                  </button>
                </article>
              ))
            )}
          </div>
        )}
      </main>

      {/* Verification Modal for Claimed Orders */}
      <VerificationModal
        order={verifyingOrder}
        isOpen={!!verifyingOrder}
        onClose={() => setVerifyingOrder(null)}
        onConfirmKOT={handleConfirmKOT}
        onReject={handleRejectOrder}
      />
    </div>
  );
};

export default WaiterDispatch;
