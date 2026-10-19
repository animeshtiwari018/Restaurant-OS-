'use client';

import React, { useState } from 'react';
import { formatRupees } from '@/context/CartContext';

interface TableNode {
  id: string;
  number: string;
  floor: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'BILLING' | 'CLEANING';
  waiter?: string;
  activeOrderTotalPaise?: number;
  timeSeatedMinutes?: number;
}

const INITIAL_TABLES: TableNode[] = [
  { id: 't1', number: 'T-01', floor: 'Ground Floor', capacity: 2, status: 'AVAILABLE' },
  { id: 't2', number: 'T-02', floor: 'Ground Floor', capacity: 4, status: 'OCCUPIED', waiter: 'Rahul S.', activeOrderTotalPaise: 118500, timeSeatedMinutes: 34 },
  { id: 't3', number: 'T-03', floor: 'Ground Floor', capacity: 4, status: 'OCCUPIED', waiter: 'Aman K.', activeOrderTotalPaise: 76000, timeSeatedMinutes: 18 },
  { id: 't4', number: 'T-04', floor: 'Ground Floor', capacity: 6, status: 'BILLING', waiter: 'Rahul S.', activeOrderTotalPaise: 184000, timeSeatedMinutes: 62 },
  { id: 't5', number: 'T-05', floor: 'Ground Floor', capacity: 2, status: 'CLEANING' },
  { id: 't6', number: 'T-06', floor: 'Ground Floor', capacity: 4, status: 'AVAILABLE' },
  { id: 't7', number: 'T-07', floor: 'First Floor Mezzanine', capacity: 8, status: 'OCCUPIED', waiter: 'Simran D.', activeOrderTotalPaise: 312000, timeSeatedMinutes: 45 },
  { id: 't8', number: 'T-08', floor: 'First Floor Mezzanine', capacity: 4, status: 'AVAILABLE' },
  { id: 't9', number: 'T-09', floor: 'First Floor Mezzanine', capacity: 2, status: 'OCCUPIED', waiter: 'Aman K.', activeOrderTotalPaise: 54000, timeSeatedMinutes: 12 },
  { id: 't10', number: 'T-10', floor: 'First Floor Mezzanine', capacity: 4, status: 'AVAILABLE' },
  { id: 't11', number: 'T-11', floor: 'First Floor Mezzanine', capacity: 6, status: 'AVAILABLE' },
  { id: 't12', number: 'T-12', floor: 'Ground Floor', capacity: 4, status: 'OCCUPIED', waiter: 'Rahul S.', activeOrderTotalPaise: 106050, timeSeatedMinutes: 28 },
];

export default function AdminOperationsPage() {
  const [tables, setTables] = useState<TableNode[]>(INITIAL_TABLES);
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');
  const [selectedTable, setSelectedTable] = useState<TableNode | null>(null);

  const filteredTables = tables.filter((t) =>
    selectedFloor === 'ALL' ? true : t.floor.includes(selectedFloor)
  );

  const stats = {
    totalRevenue: tables
      .filter((t) => t.activeOrderTotalPaise)
      .reduce((sum, t) => sum + (t.activeOrderTotalPaise || 0), 458000), // Today demo cumulative
    occupiedCount: tables.filter((t) => t.status === 'OCCUPIED' || t.status === 'BILLING').length,
    availableCount: tables.filter((t) => t.status === 'AVAILABLE').length,
    billingCount: tables.filter((t) => t.status === 'BILLING').length,
  };

  const handleUpdateStatus = (tableId: string, newStatus: TableNode['status']) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status: newStatus } : t))
    );
    if (selectedTable && selectedTable.id === tableId) {
      setSelectedTable((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-[#1B1C1A] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold">Today's Revenue</span>
            <span className="material-symbols-outlined text-emerald-400 text-[20px]">payments</span>
          </div>
          <div className="mt-2">
            <span className="font-display font-black text-xl text-white">
              {formatRupees(stats.totalRevenue)}
            </span>
            <span className="block text-[10px] text-emerald-400 font-bold mt-0.5">+14% vs yesterday</span>
          </div>
        </div>

        <div className="bg-[#1B1C1A] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold">Occupancy Rate</span>
            <span className="material-symbols-outlined text-amber-400 text-[20px]">table_bar</span>
          </div>
          <div className="mt-2">
            <span className="font-display font-black text-xl text-white">
              {Math.round((stats.occupiedCount / tables.length) * 100)}%
            </span>
            <span className="block text-[10px] text-stone-400 mt-0.5">
              {stats.occupiedCount} of {tables.length} tables active
            </span>
          </div>
        </div>

        <div className="bg-[#1B1C1A] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold">Tables Available</span>
            <span className="material-symbols-outlined text-sky-400 text-[20px]">check_circle</span>
          </div>
          <div className="mt-2">
            <span className="font-display font-black text-xl text-white">
              {stats.availableCount} Ready
            </span>
            <span className="block text-[10px] text-sky-400 mt-0.5">Instant guest seating</span>
          </div>
        </div>

        <div className="bg-[#1B1C1A] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold">Staff on Duty</span>
            <span className="material-symbols-outlined text-purple-400 text-[20px]">group</span>
          </div>
          <div className="mt-2">
            <span className="font-display font-black text-xl text-white">8 Active</span>
            <span className="block text-[10px] text-stone-400 mt-0.5">4 Waiters • 3 Kitchen • 1 Mgr</span>
          </div>
        </div>
      </div>

      {/* Main Floor Plan Grid */}
      <div className="bg-[#1B1C1A] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-md flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">map</span>
            <h2 className="font-display font-extrabold text-base text-white">Interactive Floor Map</h2>
          </div>

          {/* Floor Tabs */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl text-xs font-semibold">
            {['ALL', 'Ground', 'First'].map((floor) => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedFloor === floor
                    ? 'bg-primary text-white shadow-sm font-bold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {floor === 'ALL' ? 'All Floors' : `${floor} Floor`}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-stone-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Available ({stats.availableCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span>Dining Active ({stats.occupiedCount - stats.billingCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Awaiting Bill ({stats.billingCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-500" />
            <span>Cleaning / Reset</span>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
          {filteredTables.map((tbl) => {
            const isOccupied = tbl.status === 'OCCUPIED';
            const isBilling = tbl.status === 'BILLING';
            const isAvailable = tbl.status === 'AVAILABLE';

            return (
              <div
                key={tbl.id}
                onClick={() => setSelectedTable(tbl)}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-3 cursor-pointer transition-all active:scale-95 ${
                  isOccupied
                    ? 'bg-red-950/20 border-red-500/40 hover:border-red-400'
                    : isBilling
                    ? 'bg-amber-950/20 border-amber-500/50 hover:border-amber-400'
                    : isAvailable
                    ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400'
                    : 'bg-stone-900 border-stone-700 hover:border-stone-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-extrabold text-sm text-white">{tbl.number}</span>
                  <span className="text-[10px] text-stone-400 flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[13px]">person</span>
                    {tbl.capacity}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isOccupied
                        ? 'text-primary'
                        : isBilling
                        ? 'text-amber-400'
                        : isAvailable
                        ? 'text-emerald-400'
                        : 'text-stone-400'
                    }`}
                  >
                    {tbl.status}
                  </span>
                  {tbl.waiter && (
                    <span className="text-[10px] text-stone-300 truncate">
                      Cap: {tbl.waiter}
                    </span>
                  )}
                  {tbl.activeOrderTotalPaise ? (
                    <span className="text-xs font-bold text-white mt-1">
                      {formatRupees(tbl.activeOrderTotalPaise)}
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-500 mt-1">No active tab</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table Detail & Quick Action Modal */}
      {selectedTable && (
        <div
          onClick={() => setSelectedTable(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#1B1C1A] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
                  {selectedTable.number}
                </div>
                <div className="flex flex-col">
                  <h3 className="font-display font-bold text-base text-white">Table Management</h3>
                  <span className="text-xs text-stone-400">{selectedTable.floor}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTable(null)}
                className="w-8 h-8 rounded-full bg-white/10 text-stone-300 hover:text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-white/5 p-3.5 rounded-2xl border border-white/10">
              <div>
                <span className="text-stone-400 text-[10px]">Captain Assigned</span>
                <p className="font-bold text-white mt-0.5">{selectedTable.waiter || 'None'}</p>
              </div>
              <div>
                <span className="text-stone-400 text-[10px]">Active Order Tab</span>
                <p className="font-bold text-emerald-400 mt-0.5">
                  {selectedTable.activeOrderTotalPaise ? formatRupees(selectedTable.activeOrderTotalPaise) : '₹0.00'}
                </p>
              </div>
              <div>
                <span className="text-stone-400 text-[10px]">Seated Duration</span>
                <p className="font-bold text-white mt-0.5">
                  {selectedTable.timeSeatedMinutes ? `${selectedTable.timeSeatedMinutes} mins` : 'Vacant'}
                </p>
              </div>
              <div>
                <span className="text-stone-400 text-[10px]">Seating Capacity</span>
                <p className="font-bold text-white mt-0.5">{selectedTable.capacity} Guests</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <span className="text-xs font-semibold text-stone-300">Change Table State:</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  onClick={() => handleUpdateStatus(selectedTable.id, 'AVAILABLE')}
                  className="py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900 transition-all"
                >
                  Set Available
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedTable.id, 'OCCUPIED')}
                  className="py-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 hover:bg-red-900 transition-all"
                >
                  Set Occupied
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedTable.id, 'BILLING')}
                  className="py-2.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 hover:bg-amber-900 transition-all"
                >
                  Set Billing
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedTable.id, 'CLEANING')}
                  className="py-2.5 rounded-xl bg-stone-800 border border-stone-600 text-stone-300 hover:bg-stone-700 transition-all"
                >
                  Set Cleaning
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
