'use client';

import React from 'react';
import { MenuItem } from '@/types/dining';
import { useCart } from '@/context/CartContext';

interface MenuItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onSelect }) => {
  const { getItemQuantity, addItem, updateQuantity, formatRupees } = useCart();
  const quantity = getItemQuantity(item._id);

  const dietaryLabels = Array.isArray(item.dietary_labels) ? item.dietary_labels : [];
  const isVeg = dietaryLabels.includes('VEG') || dietaryLabels.includes('VEGAN');
  const imageUrl =
    item.image_url ||
    (Array.isArray(item.image_urls) && item.image_urls[0]) ||
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(item, 1);
  };

  const handleMinus = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(item._id, -1);
  };

  const handlePlus = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(item._id, 1);
  };

  const handleCardClick = () => {
    onSelect(item);
  };

  return (
    <article
      onClick={handleCardClick}
      className="bg-surface-lowest rounded-2xl p-4 shadow-sm border border-hairline flex flex-col gap-3 cursor-pointer hover:border-outline-subtle transition-all duration-200 active:scale-[0.995] touch-manipulation select-none"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left Info Column */}
        <div className="flex-1 min-w-0">
          {/* Dietary Indicator & Name */}
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`w-4 h-4 rounded-sm bg-surface-lowest border-2 flex items-center justify-center p-0.5 flex-shrink-0 ${
                isVeg ? 'border-emerald-state' : 'border-red-600'
              }`}
            >
              {isVeg ? (
                <div className="w-2 h-2 rounded-full bg-emerald-state" />
              ) : (
                <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[6px] border-b-red-600" />
              )}
            </div>

            {item.is_chef_pick && (
              <span className="bg-amber-warning text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[11px] text-amber-600">stars</span>
                Chef's Pick
              </span>
            )}
          </div>

          <h3 className="font-display font-bold text-base text-[#1B1C1A] leading-tight line-clamp-1">
            {item.name}
          </h3>

          <p className="text-xs text-[#594139] line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-display font-bold text-base text-primary">
              {formatRupees(item.price_paise)}
            </span>
            <span className="text-[10px] text-[#594139] uppercase tracking-wider font-semibold">
              • {item.nutrition?.basis || '1 serving'}
            </span>
          </div>
        </div>

        {/* Right Thumbnail Column */}
        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-surface-container flex-shrink-0 border border-hairline">
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 pointer-events-none"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
            }}
          />
          {item.prep_time_minutes > 0 && (
            <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[9px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[10px]">schedule</span>
              <span>{item.prep_time_minutes}m</span>
            </div>
          )}
        </div>
      </div>

      {/* Nutritional Metric Snapshot Pill */}
      {item.nutrition && (
        <div className="bg-surface-container rounded-xl p-2 grid grid-cols-4 gap-1 text-center font-display text-[11px]">
          <div className="bg-surface-lowest py-1 rounded-lg">
            <p className="font-bold text-[#1B1C1A]">{item.nutrition.calories || 380}</p>
            <p className="text-[9px] text-[#594139] uppercase">kcal</p>
          </div>
          <div className="bg-surface-lowest py-1 rounded-lg">
            <p className="font-bold text-emerald-state">{item.nutrition.protein || 18}g</p>
            <p className="text-[9px] text-[#594139] uppercase">Protein</p>
          </div>
          <div className="bg-surface-lowest py-1 rounded-lg">
            <p className="font-bold text-[#1B1C1A]">{item.nutrition.carbs || 22}g</p>
            <p className="text-[9px] text-[#594139] uppercase">Carbs</p>
          </div>
          <div className="bg-surface-lowest py-1 rounded-lg">
            <p className="font-bold text-amber-state">
              {item.nutrition.fats ?? (item.nutrition as any).fat ?? 14}g
            </p>
            <p className="text-[9px] text-[#594139] uppercase">Fat</p>
          </div>
        </div>
      )}

      {/* Bottom Bar: Allergen Snapshot & Dynamic Button */}
      <div className="flex items-center justify-between pt-1">
        {Array.isArray(item.allergens) && item.allergens.length > 0 ? (
          <div className="flex items-center gap-1 bg-amber-surface text-[#822700] px-2 py-0.5 rounded-md text-[10px] font-medium truncate max-w-[190px]">
            <span className="material-symbols-outlined text-[12px] text-primary">warning</span>
            <span className="truncate">Allergens: {item.allergens.join(', ')}</span>
          </div>
        ) : (
          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">eco</span>
            <span>Kitchen Fresh</span>
          </div>
        )}

        {/* Dynamic CTA Stepper / Add Button */}
        {quantity === 0 ? (
          <button
            type="button"
            onClick={handleAdd}
            className="h-9 px-4 rounded-full bg-primary hover:bg-primary-dark text-white font-display text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all touch-manipulation z-10 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>ADD</span>
          </button>
        ) : (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center bg-primary text-white rounded-full px-1.5 py-0.5 shadow-sm z-10"
          >
            <button
              type="button"
              onClick={handleMinus}
              aria-label="Decrease quantity"
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/10 active:scale-90 transition-transform touch-manipulation cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
            <span className="font-display font-bold text-xs px-2.5 min-w-[20px] text-center select-none">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handlePlus}
              aria-label="Increase quantity"
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/10 active:scale-90 transition-transform touch-manipulation cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default MenuItemCard;
