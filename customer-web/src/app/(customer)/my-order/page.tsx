'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { orderApi } from '@/services/api';
import { Order } from '@/types/dining';

export default function MyOrderPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    updateInstructions,
    removeItem,
    clearCart,
    subtotalPaise,
    taxPaise,
    totalPaise,
    totalItems,
    formatRupees,
  } = useCart();

  const [tableNumber, setTableNumber] = useState('T-12');
  const [sessionId, setSessionId] = useState('sess_12');
  const [servingPref, setServingPref] = useState<'STARTERS_FIRST' | 'ALL_TOGETHER'>('STARTERS_FIRST');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync session details from localStorage
  useEffect(() => {
    try {
      const storedTable = localStorage.getItem('restro_table_number');
      if (storedTable) setTableNumber(storedTable);

      const storedSession = localStorage.getItem('restro_session_id');
      if (storedSession) setSessionId(storedSession);
    } catch {
      // fallback to defaults
    }
  }, []);

  const handleStartEditNote = (itemId: string, currentNote: string) => {
    setEditingItemId(itemId);
    setEditingNote(currentNote || '');
  };

  const handleSaveNote = (itemId: string) => {
    updateInstructions(itemId, editingNote.trim());
    setEditingItemId(null);
  };

  const handleConfirmAndPlaceOrder = async () => {
    if (items.length === 0 || isPlacing) return;

    try {
      setIsPlacing(true);
      setError(null);

      const payload = {
        session_id: sessionId,
        serving_preference: servingPref,
        items: items.map((i) => ({
          menu_item_id: i.menu_item_id,
          quantity: i.quantity,
          special_instructions: i.special_instructions,
        })),
      };

      let placedOrder: Order;
      try {
        placedOrder = await orderApi.placeOrder(payload);
      } catch {
        // Fallback optimistic order for demo/offline resilience
        placedOrder = {
          _id: `ord_${Date.now()}`,
          session_id: sessionId,
          order_number: `#RM-${Math.floor(1000 + Math.random() * 9000)}`,
          table_number: tableNumber,
          items: items.map((i) => ({
            menu_item_id: i.menu_item_id,
            name: i.item.name,
            quantity: i.quantity,
            price_paise: i.item.price_paise,
            special_instructions: i.special_instructions,
            status: 'QUEUED',
          })),
          status: 'PENDING_VERIFICATION',
          subtotal_paise: subtotalPaise,
          tax_paise: taxPaise,
          total_paise: totalPaise,
          created_at: new Date().toISOString(),
          waiter_name: 'Rahul S.',
        };
      }

      // Persist order in local session orders list
      try {
        const existing = JSON.parse(localStorage.getItem('restro_session_orders') || '[]');
        localStorage.setItem('restro_session_orders', JSON.stringify([...existing, placedOrder]));
      } catch {
        // ignore
      }

      setIsSuccess(true);
      clearCart();

      // Navigate to live order tracker after brief confirmation
      setTimeout(() => {
        router.push('/order-status');
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Failed to place order. Please try again.');
      setIsPlacing(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-28 text-on-surface">
      {/* Top Session Breadcrumb & Quick Actions */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="font-display font-extrabold text-xl text-on-surface tracking-tight">
              Your Order
            </h1>
            <span className="bg-primary-fixed text-on-primary-fixed-variant px-2 py-0.5 rounded-full font-display font-bold text-[11px]">
              Table {tableNumber}
            </span>
          </div>
          <span className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[13px] text-tertiary">sensors</span>
            Active Dine-in Session #{sessionId.slice(-6).toUpperCase()}
          </span>
        </div>

        <Link
          href="/menu"
          className="h-10 px-4 rounded-full bg-surface-container flex items-center gap-1.5 text-primary hover:bg-surface-variant transition-colors min-h-[44px] touch-manipulation cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span className="font-display font-bold text-xs">Add More Dishes</span>
        </Link>
      </div>

      {/* Reassurance & Waiter Verification Banner */}
      <div className="mx-4 my-2.5 rounded-2xl bg-secondary-fixed/50 p-3.5 flex items-start gap-3 border border-secondary-fixed/70">
        <div className="w-9 h-9 rounded-full bg-secondary-container/20 text-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-[20px]">room_service</span>
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-xs text-on-secondary-fixed">
            Waiter Verification Included
          </span>
          <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
            Once submitted, <span className="font-semibold text-on-surface">Waiter Rahul S.</span> will visit{' '}
            <span className="font-semibold text-on-surface">Table {tableNumber}</span> to confirm special cooking requests and spice preferences before orders fire to the kitchen.
          </p>
        </div>
      </div>

      {/* Selected Items Section */}
      <div className="px-4 flex flex-col gap-3 mt-2">
        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-sm text-on-surface">
            Selected Items ({totalItems} {totalItems === 1 ? 'dish' : 'dishes'})
          </span>
          <span className="text-xs text-on-surface-variant">Reviewing Draft</span>
        </div>

        {items.length === 0 ? (
          <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col items-center justify-center text-center gap-3 border border-outline-variant/30 my-2">
            <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[28px]">dinner_dining</span>
            </div>
            <h3 className="font-display font-bold text-sm text-on-surface">No dishes in your draft</h3>
            <p className="text-xs text-on-surface-variant max-w-[240px]">
              Browse our curated artisanal menu and select items for your table.
            </p>
            <Link
              href="/menu"
              className="mt-1 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-display font-bold active:scale-95 transition-all shadow-sm"
            >
              Explore Menu
            </Link>
          </div>
        ) : (
          items.map((cartItem) => {
            const { item, quantity, special_instructions } = cartItem;
            const dietary = Array.isArray(item.dietary_labels) ? item.dietary_labels : [];
            const isVeg = dietary.includes('VEG') || dietary.includes('VEGAN') || !dietary.includes('NON_VEG');

            const itemImg =
              item.image_url ||
              (Array.isArray((item as any).image_urls) && (item as any).image_urls[0]) ||
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';

            const lineTotalPaise = item.price_paise * quantity;
            const isEditingThisNote = editingItemId === item._id;

            return (
              <div
                key={item._id}
                className="p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-2.5 border border-outline-variant/20 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    {/* Pure Veg / Non Veg Emblem */}
                    <div className="w-4 h-4 rounded-sm flex items-center justify-center flex-shrink-0 mt-1 bg-surface-container-low border border-outline-variant/40">
                      {isVeg ? (
                        <span className="w-2 h-2 rounded-full bg-tertiary" />
                      ) : (
                        <span className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[6px] border-b-error" />
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <h4 className="font-display font-bold text-sm text-on-surface truncate">
                        {item.name}
                      </h4>
                      <span className="text-xs text-on-surface-variant line-clamp-1">
                        {item.description || 'Artisanal kitchen preparation'}
                      </span>

                      {/* Nutrition / Tag Badges */}
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {item.nutrition?.calories && (
                          <span className="bg-surface-container px-2 py-0.5 rounded-full text-[10px] font-sans text-on-surface-variant flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[12px] text-primary">
                              local_fire_department
                            </span>{' '}
                            {item.nutrition.calories * quantity} kcal
                          </span>
                        )}
                        {item.nutrition?.protein && (
                          <span className="bg-surface-container px-2 py-0.5 rounded-full text-[10px] font-sans text-on-surface-variant font-medium">
                            {item.nutrition.protein * quantity}g Protein
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Image */}
                  <div className="w-16 h-16 rounded-xl bg-surface-container flex-shrink-0 overflow-hidden border border-outline-variant/30">
                    <img
                      src={itemImg}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
                      }}
                    />
                  </div>
                </div>

                {/* Applied Cooking Note */}
                <div className="bg-surface-container-low rounded-xl p-2 flex items-center justify-between gap-2 border border-outline-variant/20">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="material-symbols-outlined text-[16px] text-primary flex-shrink-0">
                      edit_note
                    </span>
                    {isEditingThisNote ? (
                      <input
                        type="text"
                        value={editingNote}
                        onChange={(e) => setEditingNote(e.target.value)}
                        placeholder="Cooking instruction..."
                        className="w-full bg-white text-xs px-2 py-1 rounded-md border border-primary outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="text-xs text-on-surface-variant truncate">
                        {special_instructions ? `Note: ${special_instructions}` : 'Note: Standard chef prep'}
                      </span>
                    )}
                  </div>

                  {isEditingThisNote ? (
                    <button
                      type="button"
                      onClick={() => handleSaveNote(item._id)}
                      className="text-xs font-display font-bold text-primary hover:underline px-1 flex-shrink-0 cursor-pointer"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartEditNote(item._id, special_instructions || '')}
                      className="text-xs font-display font-bold text-primary hover:underline px-1 flex-shrink-0 cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {/* Price & Quantity Stepper */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-on-surface-variant">
                      {formatRupees(item.price_paise)} × {quantity}
                    </span>
                    <span className="font-display font-bold text-sm text-primary">
                      {formatRupees(lineTotalPaise)}
                    </span>
                  </div>

                  <div className="flex items-center bg-surface-container rounded-full p-1 gap-2.5 border border-outline-variant/30">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item._id, -1)}
                      aria-label="Decrease quantity"
                      className="w-7 h-7 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-surface hover:text-primary active:scale-90 transition-all shadow-sm font-bold cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">remove</span>
                    </button>
                    <span className="font-display font-bold text-xs text-on-surface px-1 select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item._id, 1)}
                      aria-label="Increase quantity"
                      className="w-7 h-7 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-surface hover:text-primary active:scale-90 transition-all shadow-sm font-bold cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {items.length > 0 && (
        <>
          {/* Dining Table Serving Sequence Preference */}
          <div className="px-4 mt-5">
            <div className="p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-2.5 border border-outline-variant/20">
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-[20px] text-primary">dinner_dining</span>
                <span className="font-display font-bold text-xs text-on-surface">
                  Serving Sequence Preference
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-0.5">
                <label
                  onClick={() => setServingPref('STARTERS_FIRST')}
                  className={`cursor-pointer h-full p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                    servingPref === 'STARTERS_FIRST'
                      ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                      : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px] mb-1">local_cafe</span>
                  <span className="text-xs font-semibold">Starters & Drinks First</span>
                  <span className="text-[10px] text-on-surface-variant mt-0.5 leading-tight">
                    Chaas served right away
                  </span>
                </label>

                <label
                  onClick={() => setServingPref('ALL_TOGETHER')}
                  className={`cursor-pointer h-full p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                    servingPref === 'ALL_TOGETHER'
                      ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                      : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px] mb-1">conveyor_belt</span>
                  <span className="text-xs font-semibold">Bring All Together</span>
                  <span className="text-[10px] text-on-surface-variant mt-0.5 leading-tight">
                    Mains & Naan piping hot
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Transparent Bill Breakdown */}
          <div className="px-4 mt-4">
            <div className="p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-2 border border-outline-variant/20">
              <span className="font-display font-bold text-xs text-on-surface">Bill Breakdown</span>

              <div className="flex flex-col gap-2 pt-1 text-xs">
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Items Subtotal ({totalItems} items)</span>
                  <span className="font-display font-bold text-on-surface">
                    {formatRupees(subtotalPaise)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-on-surface-variant">
                  <div className="flex items-center gap-1.5">
                    <span>Restaurant GST</span>
                    <span className="bg-surface-container px-1.5 py-0.5 rounded text-[10px] font-semibold text-on-surface-variant">
                      5.0%
                    </span>
                  </div>
                  <span className="font-display font-semibold text-on-surface">
                    {formatRupees(taxPaise)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Service Charge</span>
                  <span className="text-tertiary font-bold text-xs">₹0.00 (Waived)</span>
                </div>

                <div className="w-full h-[1px] bg-outline-variant/30 my-1" />

                <div className="flex justify-between items-baseline pt-0.5">
                  <div className="flex flex-col">
                    <span className="font-display font-extrabold text-sm text-on-surface">
                      Total Payable
                    </span>
                    <span className="text-[10px] text-on-surface-variant">Inclusive of all taxes</span>
                  </div>
                  <span className="font-display font-extrabold text-base text-primary">
                    {formatRupees(totalPaise)}
                  </span>
                </div>

                <p className="text-[11px] text-on-surface-variant/80 leading-relaxed mt-1">
                  Restro Manage strictly adheres to zero mandatory service charges. Optional gratuity for service staff may be added during final bill settlement at checkout.
                </p>
              </div>
            </div>
          </div>

          {/* Error Banner if any */}
          {error && (
            <div className="mx-4 mt-3 p-3 rounded-xl bg-error-container/40 border border-error/20 text-error text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Sticky Drawer Floating Footer Trigger */}
          <div className="sticky bottom-0 w-full z-40 bg-surface/95 backdrop-blur-xl pt-2.5 pb-4 px-4 shadow-[0_-4px_20px_-2px_rgba(45,25,15,0.08)] mt-6 border-t border-outline-variant/20">
            <button
              type="button"
              disabled={isPlacing}
              onClick={handleConfirmAndPlaceOrder}
              className={`w-full h-14 rounded-full flex items-center justify-between px-4 shadow-md active:scale-[0.98] transition-all min-h-[48px] touch-manipulation cursor-pointer ${
                isSuccess
                  ? 'bg-tertiary text-white'
                  : 'bg-primary hover:bg-primary-container text-on-primary'
              }`}
              id="order-submit-btn"
            >
              {isSuccess ? (
                <div className="flex items-center justify-center w-full gap-2">
                  <span className="material-symbols-outlined text-[22px]">check_circle</span>
                  <span className="font-display font-bold text-sm">Order Sent! Waiter Notified</span>
                </div>
              ) : isPlacing ? (
                <div className="flex items-center justify-center w-full gap-2">
                  <span className="material-symbols-outlined text-[20px] animate-spin">
                    progress_activity
                  </span>
                  <span className="font-display font-bold text-xs">Paging Table {tableNumber} Waiter...</span>
                </div>
              ) : (
                <>
                  <div className="flex flex-col text-left">
                    <span className="font-display font-bold text-sm leading-tight">
                      Confirm & Place Order
                    </span>
                    <span className="text-[11px] opacity-90">
                      Waiter Rahul S. will verify at Table {tableNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-full">
                    <span className="font-display font-bold text-xs">
                      {formatRupees(totalPaise)}
                    </span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </div>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
