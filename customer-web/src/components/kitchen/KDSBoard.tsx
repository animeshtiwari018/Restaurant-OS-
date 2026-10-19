'use client';

import React, { useState, useEffect } from 'react';
import { KitchenTicket, KitchenTicketItem, KitchenItemStatus } from '@/types/dining';
import { kitchenApi } from '@/services/api';

const INITIAL_KDS_TICKETS: KitchenTicket[] = [
  {
    id: 'kot_101',
    order_id: 'ord_9842',
    table_number: 'T-12',
    station: 'Curry',
    created_at: new Date(Date.now() - 360000).toISOString(), // 6m ago
    elapsed_minutes: 6,
    status: 'PREPARING',
    items: [
      {
        id: 'ki_1',
        name: 'Paneer Butter Masala Special',
        quantity: 2,
        special_instructions: 'Less butter, light oil, piping hot',
        status: 'PREPARING',
      },
    ],
  },
  {
    id: 'kot_102',
    order_id: 'ord_9842',
    table_number: 'T-12',
    station: 'Tandoor & Breads',
    created_at: new Date(Date.now() - 360000).toISOString(),
    elapsed_minutes: 6,
    status: 'QUEUED',
    items: [
      {
        id: 'ki_2',
        name: 'Garlic Butter Naan',
        quantity: 3,
        status: 'QUEUED',
      },
    ],
  },
  {
    id: 'kot_103',
    order_id: 'ord_9831',
    table_number: 'T-06',
    station: 'Curry',
    created_at: new Date(Date.now() - 1380000).toISOString(), // 23 mins ago (DELAYED > 20m)
    elapsed_minutes: 23,
    status: 'PREPARING',
    items: [
      {
        id: 'ki_3',
        name: 'Dal Makhani Bukhara Style',
        quantity: 1,
        special_instructions: 'Extra creamy',
        status: 'PREPARING',
      },
      {
        id: 'ki_4',
        name: 'Murgh Lababdar',
        quantity: 1,
        status: 'QUEUED',
      },
    ],
  },
  {
    id: 'kot_104',
    order_id: 'ord_9845',
    table_number: 'T-04',
    station: 'Tandoor & Breads',
    created_at: new Date(Date.now() - 480000).toISOString(),
    elapsed_minutes: 8,
    status: 'PREPARING',
    items: [
      {
        id: 'ki_5',
        name: 'Tandoori Malai Broccoli',
        quantity: 1,
        status: 'PREPARING',
      },
      {
        id: 'ki_6',
        name: 'Rumali Roti',
        quantity: 2,
        status: 'READY',
      },
    ],
  },
  {
    id: 'kot_105',
    order_id: 'ord_9842',
    table_number: 'T-12',
    station: 'Beverages',
    created_at: new Date(Date.now() - 200000).toISOString(),
    elapsed_minutes: 3,
    status: 'READY',
    items: [
      {
        id: 'ki_7',
        name: 'Spiced Masala Chaas',
        quantity: 2,
        status: 'READY',
      },
    ],
  },
];

type StationFilter = 'ALL' | 'Curry' | 'Tandoor & Breads' | 'Beverages';

export const KDSBoard: React.FC = () => {
  const [stationFilter, setStationFilter] = useState<StationFilter>('ALL');
  const [tickets, setTickets] = useState<KitchenTicket[]>(INITIAL_KDS_TICKETS);
  const [buzzerActive, setBuzzerActive] = useState(true);

  // Poll kitchen tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const fetched = await kitchenApi.getTickets(stationFilter === 'ALL' ? undefined : stationFilter);
        if (fetched && fetched.length > 0) {
          setTickets(fetched);
        }
      } catch {
        // Fallback to mock tickets
      }
    };
    fetchTickets();
  }, [stationFilter]);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTickets((prev) =>
        prev.map((t) => ({
          ...t,
          elapsed_minutes: t.elapsed_minutes + 1,
        }))
      );
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const toggleItemStatus = async (ticketId: string, itemId: string) => {
    const nextStatusMap: Record<KitchenItemStatus, KitchenItemStatus> = {
      QUEUED: 'PREPARING',
      PREPARING: 'READY',
      READY: 'QUEUED',
    };

    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id === ticketId) {
          const updatedItems = ticket.items.map((item) => {
            if (item.id === itemId) {
              const newStatus = nextStatusMap[item.status];
              // Fire async API call
              kitchenApi.updateItemStatus(ticketId, itemId, newStatus).catch(() => {});
              return { ...item, status: newStatus };
            }
            return item;
          });

          // Check if all items in ticket are ready
          const allReady = updatedItems.every((i) => i.status === 'READY');
          return {
            ...ticket,
            items: updatedItems,
            status: allReady ? 'READY' : 'PREPARING',
          };
        }
        return ticket;
      })
    );
  };

  const bumpTicket = (ticketId: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
  };

  const filteredTickets = tickets.filter(
    (t) => stationFilter === 'ALL' || t.station === stationFilter
  );

  const delayedCount = tickets.filter((t) => t.elapsed_minutes >= 20).length;

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col font-sans selection:bg-primary/20">
      {/* Top KDS Control Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-hairline px-6 py-3.5 shadow-sm">
        <div className="max-w-[1920px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-4">
          {/* Brand & Chef Badge */}
          <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-bold shadow-sm">
                <span className="material-symbols-outlined text-[24px]">soup_kitchen</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-lg text-[#1C1917]">
                    Restro Manage
                  </span>
                  <span className="text-stone-300">•</span>
                  <span className="font-display font-bold text-[11px] uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    Kitchen Display (KDS)
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-semibold text-[#594139]">
                    Head Chef Sanjeev • Station Lead
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Metric Indicator */}
            <div className="flex xl:hidden items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-stone-100 text-stone-800 text-xs font-bold">
                {tickets.length} Active
              </span>
              {delayedCount > 0 && (
                <span className="px-2.5 py-1 rounded-xl bg-amber-surface text-primary text-xs font-bold animate-pulse">
                  {delayedCount} Delayed
                </span>
              )}
            </div>
          </div>

          {/* Desktop Center Metrics Strip */}
          <div className="hidden xl:flex items-center gap-3">
            {/* Active Tickets */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-hairline shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-[#1C1917]">
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-wider text-[#594139] uppercase">
                  Active KOTs
                </span>
                <span className="font-display font-bold text-base leading-none text-[#1B1C1A]">
                  {tickets.length} orders
                </span>
              </div>
            </div>

            {/* Avg Prep Time */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-hairline shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-surface text-emerald-state flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">schedule</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-wider text-emerald-800 uppercase">
                  Avg Prep Time
                </span>
                <span className="font-display font-bold text-base leading-none text-emerald-700">
                  14 mins
                </span>
              </div>
            </div>

            {/* Delayed Terracotta Alert (>20m) */}
            <div
              className={`flex items-center gap-3 px-4 py-2 rounded-2xl border shadow-sm transition-all ${
                delayedCount > 0
                  ? 'bg-amber-surface border-primary animate-pulse'
                  : 'bg-white border-hairline opacity-60'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  delayedCount > 0 ? 'bg-primary text-white' : 'bg-stone-200 text-stone-600'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-wider text-primary uppercase">
                  Delayed (&gt;20m)
                </span>
                <span className="font-display font-extrabold text-base leading-none text-primary">
                  {delayedCount} {delayedCount === 1 ? 'Action Required' : 'Tickets'}
                </span>
              </div>
            </div>
          </div>

          {/* Station Filters & Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto justify-between xl:justify-end">
            <nav className="flex items-center bg-stone-100 p-1 rounded-2xl border border-hairline text-xs font-bold">
              {(['ALL', 'Curry', 'Tandoor & Breads', 'Beverages'] as StationFilter[]).map(
                (station) => (
                  <button
                    key={station}
                    onClick={() => setStationFilter(station)}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      stationFilter === station
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-[#594139] hover:text-[#1B1C1A]'
                    }`}
                  >
                    {station === 'ALL' ? 'All Stations' : station}
                  </button>
                )
              )}
            </nav>

            <button
              onClick={() => setBuzzerActive(!buzzerActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-bold transition-colors ${
                buzzerActive
                  ? 'bg-amber-surface text-primary border-primary'
                  : 'bg-stone-100 text-[#594139] border-hairline'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {buzzerActive ? 'notifications_active' : 'notifications_off'}
              </span>
              <span>{buzzerActive ? 'Buzzer On' : 'Muted'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main KOT Kanban Board Grid */}
      <main className="flex-1 p-4 md:p-6 max-w-[1920px] mx-auto w-full">
        {filteredTickets.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-emerald-state">
              <span className="material-symbols-outlined text-[36px]">done_all</span>
            </div>
            <h3 className="font-display font-extrabold text-xl text-[#1B1C1A]">All KOTs Completed</h3>
            <p className="text-xs text-[#594139] max-w-[320px]">
              No pending tickets for station: {stationFilter}. Enjoy the break!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
            {filteredTickets.map((ticket) => {
              const isDelayed = ticket.elapsed_minutes >= 20;

              return (
                <article
                  key={ticket.id}
                  className={`bg-white rounded-3xl border shadow-sm flex flex-col justify-between overflow-hidden transition-all ${
                    isDelayed
                      ? 'border-primary ring-2 ring-primary/30 shadow-md'
                      : ticket.status === 'READY'
                      ? 'border-emerald-state'
                      : 'border-hairline'
                  }`}
                >
                  {/* Top Color Accent Line */}
                  <div
                    className={`h-2.5 w-full ${
                      isDelayed
                        ? 'bg-primary'
                        : ticket.status === 'READY'
                        ? 'bg-emerald-state'
                        : ticket.station === 'Curry'
                        ? 'bg-amber-state'
                        : 'bg-stone-700'
                    }`}
                  />

                  <div className="p-4 flex-1 flex flex-col gap-3">
                    {/* Ticket Header */}
                    <div className="flex items-start justify-between pb-3 border-b border-hairline">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-extrabold text-2xl text-[#1B1C1A] tracking-tight">
                            Table {ticket.table_number}
                          </h3>
                        </div>
                        <span className="text-[11px] font-bold text-[#594139] bg-stone-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                          Station: {ticket.station}
                        </span>
                      </div>

                      {/* Live Prep Stopwatch */}
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-mono text-xs font-extrabold shadow-sm ${
                          isDelayed
                            ? 'bg-primary text-white animate-pulse'
                            : 'bg-stone-100 text-[#1B1C1A]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">timer</span>
                        <span>{ticket.elapsed_minutes}m</span>
                      </div>
                    </div>

                    {/* Dish-Level Interactive Status Rows */}
                    <div className="flex-1 flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-[#594139] uppercase tracking-wider">
                        Tap dish to toggle state
                      </span>

                      {ticket.items.map((item) => {
                        const statusColors: Record<KitchenItemStatus, string> = {
                          QUEUED: 'bg-stone-100 text-stone-800 border-hairline',
                          PREPARING: 'bg-amber-surface text-[#822700] border-amber-300 font-bold',
                          READY: 'bg-emerald-surface text-emerald-900 border-emerald-300 font-bold',
                        };

                        const statusBadgeText: Record<KitchenItemStatus, string> = {
                          QUEUED: 'Queued',
                          PREPARING: '🔥 In Prep',
                          READY: '✓ Ready',
                        };

                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleItemStatus(ticket.id, item.id)}
                            className="p-3 rounded-2xl bg-[#FAF8F5] border border-hairline hover:border-primary/50 cursor-pointer active:scale-[0.99] transition-all flex flex-col gap-1.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-display font-extrabold text-base text-primary">
                                  {item.quantity}x
                                </span>
                                <span className="font-display font-bold text-sm text-[#1B1C1A] leading-tight">
                                  {item.name}
                                </span>
                              </div>

                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] border whitespace-nowrap ${
                                  statusColors[item.status]
                                }`}
                              >
                                {statusBadgeText[item.status]}
                              </span>
                            </div>

                            {item.special_instructions && (
                              <div className="bg-amber-surface/70 px-2 py-1 rounded-lg text-[11px] text-primary font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[13px]">note_alt</span>
                                <span>Note: {item.special_instructions}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ticket Bump / Mark Done Footer */}
                  <div className="p-3 bg-stone-50 border-t border-hairline flex items-center gap-2">
                    <button
                      onClick={() => bumpTicket(ticket.id)}
                      className="w-full h-10 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-display font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>Bump KOT Ticket</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default KDSBoard;
