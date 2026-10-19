'use client';

import React, { useState } from 'react';
import { Order } from '@/types/dining';
import { formatRupees } from '@/context/CartContext';

interface VerificationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmKOT: (orderId: string, checks: { customerPresent: boolean; allergensReviewed: boolean }) => void;
  onReject: (orderId: string, reason: string) => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  order,
  isOpen,
  onClose,
  onConfirmKOT,
  onReject,
}) => {
  const [customerPresent, setCustomerPresent] = useState(true);
  const [allergensReviewed, setAllergensReviewed] = useState(true);
  const [notesAcknowledged, setNotesAcknowledged] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!isOpen || !order) return null;

  const canConfirm = customerPresent && allergensReviewed && notesAcknowledged;

  const handleConfirm = () => {
    onConfirmKOT(order._id, { customerPresent, allergensReviewed });
    onClose();
  };

  const handleReject = () => {
    onReject(order._id, rejectReason || 'Table empty / accidental scan');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-[480px] bg-surface-lowest rounded-t-[28px] p-5 shadow-2xl border-t border-hairline flex flex-col z-10 animate-in slide-in-from-bottom duration-300">
        {/* Drawer Drag Pill */}
        <div className="w-12 h-1.5 rounded-full bg-surface-high mx-auto mb-3" />

        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-state" />
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                Table Validation Protocol
              </span>
            </div>
            <h2 className="font-display font-extrabold text-lg text-[#1B1C1A] mt-0.5">
              Physical Verification • Table {order.table_number}
            </h2>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-surface-container font-mono text-xs text-[#594139] font-bold">
            {order.order_number}
          </span>
        </div>

        <p className="text-xs text-[#594139] mb-4">
          Confirm guest occupancy and review special customer notes prior to kitchen ticket dispatch.
        </p>

        {/* Anti-Prank Validation Checklist */}
        <div className="flex flex-col gap-2.5 mb-5">
          {/* Check 1: Physical Seating */}
          <label
            onClick={() => setCustomerPresent(!customerPresent)}
            className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-colors ${
              customerPresent
                ? 'bg-emerald-surface/40 border-emerald-300'
                : 'bg-surface-container border-hairline'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-sm transition-colors ${
                customerPresent ? 'bg-emerald-state text-white' : 'bg-surface-lowest border border-[#8D7168]'
              }`}
            >
              {customerPresent && <span className="material-symbols-outlined text-[16px]">check</span>}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#1B1C1A]">
                Customer physically seated at Table {order.table_number}
              </span>
              <span className="text-[11px] text-[#594139]">
                Validated presence (Prevents ghost/accidental QR scans)
              </span>
            </div>
          </label>

          {/* Check 2: Allergens & Dietary */}
          <label
            onClick={() => setAllergensReviewed(!allergensReviewed)}
            className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-colors ${
              allergensReviewed
                ? 'bg-emerald-surface/40 border-emerald-300'
                : 'bg-surface-container border-hairline'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-sm transition-colors ${
                allergensReviewed ? 'bg-emerald-state text-white' : 'bg-surface-lowest border border-[#8D7168]'
              }`}
            >
              {allergensReviewed && <span className="material-symbols-outlined text-[16px]">check</span>}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-[#1B1C1A]">Allergens Verified</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-surface text-[#822700] text-[10px] font-semibold">
                  Kitchen Notes Checked
                </span>
              </div>
              <span className="text-[11px] text-[#594139]">
                Table confirmed guest tolerance for dairy and gravies
              </span>
            </div>
          </label>

          {/* Check 3: Chef Special Request */}
          <label
            onClick={() => setNotesAcknowledged(!notesAcknowledged)}
            className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-colors ${
              notesAcknowledged
                ? 'bg-emerald-surface/40 border-emerald-300'
                : 'bg-surface-container border-hairline'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-sm transition-colors ${
                notesAcknowledged ? 'bg-emerald-state text-white' : 'bg-surface-lowest border border-[#8D7168]'
              }`}
            >
              {notesAcknowledged && <span className="material-symbols-outlined text-[16px]">check</span>}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#1B1C1A]">
                Special Preparation Acknowledged
              </span>
              <span className="text-[11px] text-primary font-semibold">
                Any custom notes communicated to Chef station
              </span>
            </div>
          </label>
        </div>

        {/* Reject Input Field (if triggered) */}
        {showRejectInput && (
          <div className="mb-4 bg-red-50 p-3 rounded-2xl border border-red-200 flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-red-900">
              Reason for Order Rejection:
            </label>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Guest left table, accidental QR scan..."
              className="bg-white px-3 py-2 rounded-xl text-xs border border-red-200 outline-none"
            />
            <button
              onClick={handleReject}
              className="mt-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
            >
              Confirm Rejection & Release Table
            </button>
          </div>
        )}

        {/* Dual Action Gate Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setShowRejectInput(!showRejectInput)}
            className="h-12 rounded-2xl bg-surface-container hover:bg-surface-container-high text-[#1B1C1A] font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-hairline"
          >
            <span className="material-symbols-outlined text-[18px] text-red-600">cancel</span>
            <span>Reject (Prank/Empty)</span>
          </button>

          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="h-12 rounded-2xl bg-emerald-state hover:bg-emerald-700 text-white font-display font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[18px]">restaurant</span>
            <span>Confirm & Punch KOT →</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
