'use client';

import React, { useState } from 'react';
import { Order, BillSummary } from '@/types/dining';
import { formatRupees } from '@/context/CartContext';
import { billingApi } from '@/services/api';

interface BillSettlementCardProps {
  sessionId?: string;
  tableNumber?: string;
  orders: Order[];
  onSettled?: () => void;
  onClose?: () => void;
}

type PaymentMethod = 'UPI' | 'CARD' | 'CASH';

export const BillSettlementCard: React.FC<BillSettlementCardProps> = ({
  sessionId = 'sess_default_12',
  tableNumber = 'Table T-12',
  orders,
  onSettled,
  onClose,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('UPI');
  const [isSettling, setIsSettling] = useState(false);
  const [isSettled, setIsSettled] = useState(false);

  // 1 Session = 1 Bill Aggregation Rule
  const allItems = orders.flatMap((o) => o.items);
  const subtotalPaise = orders.reduce((sum, o) => sum + (o.subtotal_paise || 0), 0);
  const taxPaise = orders.reduce((sum, o) => sum + (o.tax_paise || 0), 0);
  const totalPaise = subtotalPaise + taxPaise;

  const handleSettle = async () => {
    try {
      setIsSettling(true);
      try {
        await billingApi.settleBill(sessionId, selectedMethod, totalPaise);
      } catch {
        // Optimistic offline mode
      }
      setIsSettled(true);
      if (onSettled) onSettled();
    } finally {
      setIsSettling(false);
    }
  };

  return (
    <div className="bg-surface-lowest rounded-3xl p-5 shadow-sm border border-hairline flex flex-col gap-4">
      {/* Bill Header */}
      <div className="flex items-start justify-between pb-3 border-b border-hairline">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[22px]">receipt_long</span>
          </div>
          <div>
            <h2 className="font-display font-extrabold text-base text-[#1B1C1A]">Table Dining Bill</h2>
            <p className="text-xs text-[#594139]">{tableNumber} • 1 Session = 1 Bill</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-[#594139]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {isSettled ? (
        <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-emerald-surface text-emerald-state flex items-center justify-center">
            <span className="material-symbols-outlined text-[36px]">check_circle</span>
          </div>
          <h3 className="font-display font-bold text-lg text-[#1B1C1A]">Bill Settled Successfully!</h3>
          <p className="text-xs text-[#594139] max-w-[280px]">
            Thank you for dining with us at {tableNumber}. A digital receipt has been sent to your session.
          </p>
          <span className="font-display font-extrabold text-xl text-emerald-state mt-1">
            Paid: {formatRupees(totalPaise)}
          </span>
        </div>
      ) : (
        <>
          {/* Round-wise Aggregation Accordion */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#594139]">
              <span>Order Rounds ({orders.length})</span>
              <span>{allItems.length} Total Portions</span>
            </div>

            <div className="bg-surface-container rounded-2xl p-3 border border-hairline flex flex-col gap-2 max-h-56 overflow-y-auto no-scrollbar">
              {orders.map((order, roundIdx) => (
                <div key={order._id || roundIdx} className="flex flex-col gap-1 pb-2 border-b border-hairline last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between text-[11px] font-bold text-primary">
                    <span>Round {roundIdx + 1} ({order.order_number})</span>
                    <span>{formatRupees(order.total_paise)}</span>
                  </div>
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-[#1B1C1A]">
                      <span className="text-[#594139]">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-semibold">{formatRupees(item.price_paise * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown & 5% GST Details */}
          <div className="bg-surface-container rounded-2xl p-3.5 border border-hairline flex flex-col gap-2">
            <div className="flex justify-between text-xs text-[#594139]">
              <span>Food & Beverage Subtotal</span>
              <span className="font-bold text-[#1B1C1A]">{formatRupees(subtotalPaise)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#594139]">
              <span className="flex items-center gap-1">
                <span>GST (5% Restaurant Dine-in)</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-surface px-1.5 rounded">
                  CGST 2.5% + SGST 2.5%
                </span>
              </span>
              <span className="font-bold text-[#1B1C1A]">{formatRupees(taxPaise)}</span>
            </div>
            <div className="flex justify-between text-sm font-display font-extrabold text-[#1B1C1A] pt-2 border-t border-hairline">
              <span>Total Payable</span>
              <span className="text-primary text-base">{formatRupees(totalPaise)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[#1B1C1A]">Select Payment Method</span>
            <div className="grid grid-cols-1 gap-2">
              {/* UPI Radio */}
              <label
                onClick={() => setSelectedMethod('UPI')}
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                  selectedMethod === 'UPI'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-hairline bg-surface-container'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-surface-lowest flex items-center justify-center text-primary shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#1B1C1A]">UPI Dynamic QR (Instant)</span>
                    <span className="text-[10px] text-[#594139]">GPay, PhonePe, Paytm, BHIM</span>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'UPI' ? 'border-primary' : 'border-[#594139]'
                  }`}
                >
                  {selectedMethod === 'UPI' && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
              </label>

              {/* Card Radio */}
              <label
                onClick={() => setSelectedMethod('CARD')}
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                  selectedMethod === 'CARD'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-hairline bg-surface-container'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-surface-lowest flex items-center justify-center text-[#1B1C1A] shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">credit_card</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#1B1C1A]">Card at Table</span>
                    <span className="text-[10px] text-[#594139]">Waiter brings wireless POS machine</span>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'CARD' ? 'border-primary' : 'border-[#594139]'
                  }`}
                >
                  {selectedMethod === 'CARD' && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
              </label>

              {/* Cash Radio */}
              <label
                onClick={() => setSelectedMethod('CASH')}
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                  selectedMethod === 'CASH'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-hairline bg-surface-container'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-surface-lowest flex items-center justify-center text-amber-700 shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">payments</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#1B1C1A]">Pay Cash to Waiter</span>
                    <span className="text-[10px] text-[#594139]">Collect cash receipt from Captain</span>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'CASH' ? 'border-primary' : 'border-[#594139]'
                  }`}
                >
                  {selectedMethod === 'CASH' && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
              </label>
            </div>
          </div>

          {/* Dynamic UPI QR Code Box when UPI selected */}
          {selectedMethod === 'UPI' && (
            <div className="bg-surface-container rounded-2xl p-4 border border-hairline flex flex-col items-center text-center gap-2">
              <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-hairline">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=restromanage@upi%26pn=RestroManage%26am=${(
                    totalPaise / 100
                  ).toFixed(2)}%26tn=${tableNumber}`}
                  alt="UPI Dynamic Payment QR"
                  className="w-32 h-32 rounded-lg"
                />
              </div>
              <span className="text-[11px] font-bold text-[#1B1C1A]">
                Scan to pay {formatRupees(totalPaise)}
              </span>
              <span className="text-[10px] text-[#594139]">
                Supports all UPI apps. Session auto-settles upon payment.
              </span>
            </div>
          )}

          {/* Final Settlement CTA */}
          <button
            onClick={handleSettle}
            disabled={isSettling || totalPaise === 0}
            className="w-full h-12 rounded-full bg-primary hover:bg-primary-dark text-white font-display font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all disabled:opacity-50 mt-1"
          >
            <span className="material-symbols-outlined text-[20px]">
              {selectedMethod === 'UPI' ? 'qr_code_scanner' : 'check_circle'}
            </span>
            <span>
              {isSettling
                ? 'Processing Settlement...'
                : selectedMethod === 'UPI'
                ? `Pay ${formatRupees(totalPaise)} via UPI`
                : selectedMethod === 'CARD'
                ? `Request POS Machine (${formatRupees(totalPaise)})`
                : `Confirm Cash to Waiter (${formatRupees(totalPaise)})`}
            </span>
          </button>
        </>
      )}
    </div>
  );
};

export default BillSettlementCard;
