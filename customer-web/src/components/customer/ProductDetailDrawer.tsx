'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem } from '@/types/dining';
import { useCart } from '@/context/CartContext';

interface ProductDetailDrawerProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_INSTRUCTIONS = [
  'Less Butter / Light Oil',
  'Mild / Low Spice',
  'Extra Gravy',
  'No Onion & Garlic (Jain Prep)',
  'Piping Hot',
];

export const ProductDetailDrawer: React.FC<ProductDetailDrawerProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const { getItemQuantity, getItemInstructions, addItem, setQuantity, updateInstructions, formatRupees } =
    useCart();

  const [quantity, setLocalQuantity] = useState(1);
  const [instructions, setLocalInstructions] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  useEffect(() => {
    if (item) {
      const currentCartQty = getItemQuantity(item._id);
      setLocalQuantity(currentCartQty > 0 ? currentCartQty : 1);
      const existingNote = getItemInstructions(item._id) || '';
      setLocalInstructions(existingNote);

      // Match existing note against chips
      const activeChips = PRESET_INSTRUCTIONS.filter((preset) =>
        existingNote.includes(preset)
      );
      setSelectedChips(activeChips);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const dietaryLabels = Array.isArray(item.dietary_labels) ? item.dietary_labels : [];
  const isVeg = dietaryLabels.includes('VEG') || dietaryLabels.includes('VEGAN');
  const imageUrl =
    item.image_url ||
    (Array.isArray(item.image_urls) && item.image_urls[0]) ||
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';
  const currentCartQty = getItemQuantity(item._id);

  const toggleChip = (chip: string) => {
    let next: string[];
    if (selectedChips.includes(chip)) {
      next = selectedChips.filter((c) => c !== chip);
    } else {
      next = [...selectedChips, chip];
    }
    setSelectedChips(next);
  };

  const handleApplyOrder = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const combinedInstructions = [
      ...selectedChips,
      instructions.trim(),
    ]
      .filter(Boolean)
      .join(', ');

    if (currentCartQty === 0) {
      addItem(item, quantity, combinedInstructions);
    } else {
      setQuantity(item._id, quantity);
      updateInstructions(item._id, combinedInstructions);
    }
    onClose();
  };

  const totalPaise = (item.price_paise || 0) * quantity;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 touch-manipulation"
    >
      {/* Slide-Up Bottom Sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[480px] max-h-[90vh] bg-surface-lowest rounded-t-3xl shadow-drawer border-t border-hairline flex flex-col z-10 overflow-hidden animate-in slide-in-from-bottom duration-300"
      >
        {/* Top Handle & Close Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-3.5 bg-surface-lowest/90 backdrop-blur-md border-b border-hairline">
          <div className="w-12 h-1.5 rounded-full bg-surface-high mx-auto absolute left-1/2 -translate-x-1/2" />
          <div className="flex items-center gap-2">
            <div
              className={`w-3.5 h-3.5 rounded-sm bg-surface-lowest border-2 flex items-center justify-center p-0.5 ${
                isVeg ? 'border-emerald-state' : 'border-red-600'
              }`}
            >
              {isVeg ? (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-state" />
              ) : (
                <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-red-600" />
              )}
            </div>
            <span className="text-xs font-bold text-[#1B1C1A]">Dish Details</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-[#594139] hover:bg-surface-high transition-colors active:scale-90"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-28">
          {/* Food Hero Image */}
          <div className="relative w-full h-52 bg-surface-container overflow-hidden">
            <img
              src={imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';
              }}
            />
            {item.is_chef_pick && (
              <div className="absolute top-3 left-3 bg-surface-lowest/90 backdrop-blur-md text-primary font-display font-bold text-xs px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">stars</span>
                <span>Signature Special</span>
              </div>
            )}
            <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-white font-display text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">timer</span>
              <span>{item.prep_time_minutes || 15} mins prep</span>
            </div>
          </div>

          {/* Dish Title & Price Header */}
          <div className="p-4 flex flex-col gap-1.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <h1 className="font-display font-extrabold text-xl text-[#1B1C1A] leading-tight">
                  {item.name}
                </h1>
                <p className="text-xs text-[#594139] mt-0.5">
                  {item.nutrition?.basis || 'Serves 1-2 (approx. 250g)'}
                </p>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="font-display font-bold text-xl text-primary">
                  {formatRupees(item.price_paise)}
                </span>
                <span className="text-[10px] text-[#594139] uppercase font-semibold">
                  Taxes Included (5% GST)
                </span>
              </div>
            </div>

            <p className="text-xs text-[#1B1C1A] mt-1 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* 4-Card Nutrition Metric Grid */}
          <div className="px-4 py-2 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">ecg_heart</span>
                <h2 className="font-display font-bold text-xs text-[#1B1C1A]">Nutritional Profile</h2>
              </div>
              <span className="text-[10px] text-[#594139] bg-surface-container px-2 py-0.5 rounded-full">
                {item.nutrition?.basis || 'Per 250g'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="bg-surface-container p-2.5 rounded-2xl flex flex-col items-center text-center border border-hairline">
                <span className="font-display font-extrabold text-base text-[#1B1C1A]">
                  {item.nutrition?.calories || 380}
                </span>
                <span className="text-[10px] font-bold text-[#594139] uppercase">KCAL</span>
                <span className="text-[9px] text-emerald-700 font-semibold mt-0.5">Energy</span>
              </div>
              <div className="bg-surface-container p-2.5 rounded-2xl flex flex-col items-center text-center border border-hairline">
                <span className="font-display font-extrabold text-base text-emerald-state">
                  {item.nutrition?.protein || 18}g
                </span>
                <span className="text-[10px] font-bold text-[#594139] uppercase">PROTEIN</span>
                <span className="text-[9px] text-emerald-700 font-semibold mt-0.5">High</span>
              </div>
              <div className="bg-surface-container p-2.5 rounded-2xl flex flex-col items-center text-center border border-hairline">
                <span className="font-display font-extrabold text-base text-[#1B1C1A]">
                  {item.nutrition?.carbs || 22}g
                </span>
                <span className="text-[10px] font-bold text-[#594139] uppercase">NET CARBS</span>
                <span className="text-[9px] text-[#594139] font-medium mt-0.5">Balanced</span>
              </div>
              <div className="bg-surface-container p-2.5 rounded-2xl flex flex-col items-center text-center border border-hairline">
                <span className="font-display font-extrabold text-base text-amber-state">
                  {item.nutrition?.fats ?? (item.nutrition as any)?.fat ?? 14}g
                </span>
                <span className="text-[10px] font-bold text-[#594139] uppercase">FATS</span>
                <span className="text-[9px] text-amber-800 font-medium mt-0.5">Artisanal</span>
              </div>
            </div>
          </div>

          {/* Ingredient Transparency */}
          {dietaryLabels.length > 0 && (
            <div className="px-4 pt-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">nutrition</span>
                <h2 className="font-display font-bold text-xs text-[#1B1C1A]">Dietary Breakdown</h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dietaryLabels.map((label) => (
                  <span
                    key={label}
                    className="bg-surface-container text-[#1B1C1A] text-[11px] font-semibold px-2.5 py-1 rounded-full border border-hairline"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Peach-tinted Allergen Advisory Card */}
          <div className="px-4 pt-3">
            <div className="bg-amber-surface border border-amber-200/80 p-3 rounded-2xl flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0 mt-0.5">
                warning
              </span>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xs text-primary">Allergen Advisory</span>
                <p className="text-[11px] text-[#822700] leading-snug mt-0.5">
                  {Array.isArray(item.allergens) && item.allergens.length > 0
                    ? `Contains: ${item.allergens.join(', ')}. Please notify Captain Rahul if you have severe allergies.`
                    : 'Prepared in a commercial kitchen that processes nuts, dairy, and gluten. Notify our wait staff for custom prep.'}
                </p>
              </div>
            </div>
          </div>

          {/* Special Cooking Instructions Section */}
          <div className="px-4 pt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">tune</span>
                <h2 className="font-display font-bold text-xs text-[#1B1C1A]">Kitchen Instructions</h2>
              </div>
              <span className="text-[10px] text-[#594139]">Chef accommodates</span>
            </div>

            {/* Quick Preset Filter Chips */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_INSTRUCTIONS.map((preset) => {
                const isSelected = selectedChips.includes(preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => toggleChip(preset)}
                    className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1 font-semibold transition-all touch-manipulation ${
                      isSelected
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-surface-container text-[#1B1C1A] hover:bg-surface-high'
                    }`}
                  >
                    {isSelected && (
                      <span className="material-symbols-outlined text-[13px]">check</span>
                    )}
                    <span>{preset}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Notes Input */}
            <div className="mt-1 bg-surface-container rounded-2xl p-3 border border-hairline focus-within:border-primary transition-all">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-[#594139]">
                  Special note for Chef
                </label>
                <span className="material-symbols-outlined text-[16px] text-outline">edit_note</span>
              </div>
              <textarea
                value={instructions}
                onChange={(e) => setLocalInstructions(e.target.value)}
                placeholder="e.g. Please serve piping hot, gravy on the side..."
                rows={2}
                className="w-full bg-transparent text-xs text-[#1B1C1A] placeholder:text-[#594139]/60 outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Sticky Bottom Footer with Dynamic Button */}
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-surface-lowest/95 backdrop-blur-md p-3.5 border-t border-hairline shadow-drawer flex items-center gap-3">
          {currentCartQty === 0 ? (
            /* Full-width "+ ADD • ₹Price" when quantity is 0 */
            <button
              type="button"
              onClick={handleApplyOrder}
              className="w-full h-12 rounded-full bg-primary hover:bg-primary-dark text-white font-display font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all touch-manipulation cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>ADD TO ORDER • {formatRupees(item.price_paise)}</span>
            </button>
          ) : (
            /* Split layout: `[- qty +] Update Order • ₹Total` */
            <div className="w-full flex items-center gap-2.5">
              <div className="flex items-center bg-surface-container rounded-full h-12 px-2 py-1 gap-2 flex-shrink-0 border border-hairline">
                <button
                  type="button"
                  onClick={() => setLocalQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-full bg-surface-lowest text-[#1B1C1A] flex items-center justify-center active:scale-90 transition-transform font-bold shadow-sm touch-manipulation"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <span className="font-display font-extrabold text-sm text-[#1B1C1A] w-6 text-center select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setLocalQuantity((q) => Math.min(20, q + 1))}
                  className="w-8 h-8 rounded-full bg-surface-lowest text-[#1B1C1A] flex items-center justify-center active:scale-90 transition-transform font-bold shadow-sm touch-manipulation"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleApplyOrder}
                className="flex-1 h-12 rounded-full bg-primary hover:bg-primary-dark text-white font-display font-bold text-xs sm:text-sm flex items-center justify-between px-4 active:scale-[0.98] transition-all shadow-md touch-manipulation cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>Update Order</span>
                </span>
                <span className="font-bold tracking-tight">{formatRupees(totalPaise)}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailDrawer;
