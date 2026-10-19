'use client';

import React from 'react';
import { Order, OrderStatus } from '@/types/dining';
import { formatRupees } from '@/context/CartContext';

interface LiveOrderStepperProps {
  orders: Order[];
  onAddMore: () => void;
  onViewBill: () => void;
}

const STEPS: { label: string; status: OrderStatus; icon: string; desc: string }[] = [
  { label: 'Order Placed', status: 'PENDING_VERIFICATION', icon: 'receipt', desc: 'Logged in table session' },
  { label: 'Awaiting Waiter Check', status: 'CLAIMED', icon: 'person_apron', desc: 'Captain validating order' },
  { label: 'In Kitchen Prep', status: 'PREPARING', icon: 'soup_kitchen', desc: 'Chefs firing tickets' },
  { label: 'Ready for Pickup', status: 'READY', icon: 'dinner_dining', desc: 'Plated & under warmer' },
  { label: 'Served', status: 'SERVED', icon: 'task_alt', desc: 'Delivered to Table' },
];

const getStepIndex = (status: OrderStatus): number => {
  switch (status) {
    case 'PENDING_VERIFICATION':
      return 0;
    case 'CLAIMED':
    case 'CONFIRMED':
      return 1;
    case 'PREPARING':
      return 2;
    case 'READY':
      return 3;
    case 'SERVED':
      return 4;
    default:
      return 1;
  }
};

export const LiveOrderStepper: React.FC<LiveOrderStepperProps> = ({
  orders,
  onAddMore,
  onViewBill,
}) => {
  if (orders.length === 0) {
    return null;
  }

  // Active / latest order
  const activeOrder = orders[orders.length - 1];
  const activeStepIdx = getStepIndex(activeOrder.status);

  return (
    <div className="bg-surface-lowest rounded-3xl p-4 shadow-sm border border-hairline flex flex-col gap-4">
      {/* Tracker Header */}
      <div className="flex items-center justify-between pb-3 border-b border-hairline">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-surface text-emerald-state flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[18px]">timelapse</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-sm text-[#1B1C1A]">Live Order Status</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-[10px] text-[#594139] font-bold">
                {activeOrder.order_number}
              </span>
            </div>
            <span className="text-[11px] text-[#594139]">Table {activeOrder.table_number}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-surface text-[#822700] px-2.5 py-1 rounded-full text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-amber-state animate-ping" />
          <span>Prep in Progress</span>
        </div>
      </div>

      {/* 5-Step Horizontal Progress Stepper */}
      <div className="relative pt-2 pb-1">
        {/* Track Line */}
        <div className="absolute top-6 left-6 right-6 h-1 bg-surface-container -z-0">
          <div
            className="h-full bg-primary transition-all duration-500 rounded-full"
            style={{ width: `${(activeStepIdx / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps Nodes */}
        <div className="relative z-10 flex items-start justify-between">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < activeStepIdx;
            const isCurrent = idx === activeStepIdx;

            return (
              <div key={step.label} className="flex flex-col items-center text-center max-w-[64px]">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-state text-white shadow-sm'
                      : isCurrent
                      ? 'bg-primary text-white shadow-md ring-4 ring-primary/20 scale-105'
                      : 'bg-surface-container text-[#594139]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isCompleted ? 'check' : step.icon}
                  </span>
                </div>
                <span
                  className={`font-display text-[10px] leading-tight mt-2 ${
                    isCurrent
                      ? 'font-extrabold text-primary'
                      : isCompleted
                      ? 'font-bold text-[#1B1C1A]'
                      : 'text-[#594139]/70'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Description Card */}
      <div className="bg-surface-container rounded-2xl p-3 border border-hairline flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="material-symbols-outlined text-primary text-[20px]">
            {STEPS[activeStepIdx]?.icon || 'sync'}
          </span>
          <div className="flex flex-col min-w-0">
            <span className="font-display font-bold text-xs text-[#1B1C1A]">
              Current Stage: {STEPS[activeStepIdx]?.label}
            </span>
            <span className="text-[11px] text-[#594139] truncate">
              {STEPS[activeStepIdx]?.desc}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-primary text-xs font-bold whitespace-nowrap bg-surface-lowest px-2.5 py-1 rounded-full border border-hairline">
          <span className="material-symbols-outlined text-[14px]">timer</span>
          <span>~12-15m</span>
        </div>
      </div>

      {/* Ordered Items Accordion / Summary */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold text-[#594139] uppercase tracking-wider">
          Dishes in this round ({activeOrder.items.length})
        </span>
        <div className="flex flex-col gap-1">
          {activeOrder.items.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-surface-low"
            >
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-primary">{item.quantity}x</span>
                <span className="text-[#1B1C1A]">{item.name}</span>
              </div>
              <span className="font-bold text-[#1B1C1A]">
                {formatRupees(item.price_paise * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-hairline">
        <button
          onClick={onAddMore}
          className="h-10 rounded-full bg-surface-container hover:bg-surface-container-high text-[#1B1C1A] font-display font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">add</span>
          <span>Order More Dishes</span>
        </button>

        <button
          onClick={onViewBill}
          className="h-10 rounded-full bg-primary hover:bg-primary-dark text-white font-display font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">receipt_long</span>
          <span>View Table Bill</span>
        </button>
      </div>
    </div>
  );
};

export default LiveOrderStepper;
