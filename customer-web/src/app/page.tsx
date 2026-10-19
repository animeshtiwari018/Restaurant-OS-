'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CartProvider, useCart } from '@/context/CartContext';
import { MenuItem, MenuCategory, Order, TableSession } from '@/types/dining';
import { menuApi } from '@/services/api';
import TableSessionHeader from '@/components/customer/TableSessionHeader';
import MenuItemCard from '@/components/customer/MenuItemCard';
import ProductDetailDrawer from '@/components/customer/ProductDetailDrawer';
import CartDrawer from '@/components/customer/CartDrawer';
import LiveOrderStepper from '@/components/customer/LiveOrderStepper';
import BillSettlementCard from '@/components/customer/BillSettlementCard';
import WaiterDispatch from '@/components/waiter/WaiterDispatch';
import KDSBoard from '@/components/kitchen/KDSBoard';

// High-fidelity fallback menu items matching Stitch UI & backend schema
const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    _id: 'item_1',
    name: 'Paneer Butter Masala Special',
    description:
      'Slow-simmered artisanal cottage cheese cubes in rich satin cashew & ripe tomato makhani with aromatic dried fenugreek leaves.',
    price_paise: 34000,
    image_url:
      'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
    category_id: 'cat_mains',
    dietary_labels: ['VEG', 'GLUTEN_FREE'],
    allergens: ['Dairy', 'Cashew'],
    nutrition: {
      calories: 440,
      protein: 18,
      carbs: 22,
      fats: 30,
      basis: 'Per 250g serving',
    },
    prep_time_minutes: 15,
    is_available: true,
    is_chef_pick: true,
  },
  {
    _id: 'item_2',
    name: 'Murgh Dum Biryani (Awadhi Style)',
    description:
      'Awadhi style basmati rice cooked on slow flame with whole spiced tender chicken, saffron milk & caramelized shallots.',
    price_paise: 42000,
    image_url:
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    category_id: 'cat_mains',
    dietary_labels: ['NON_VEG'],
    allergens: ['Dairy'],
    nutrition: {
      calories: 580,
      protein: 34,
      carbs: 64,
      fats: 20,
      basis: 'Per 350g pot',
    },
    prep_time_minutes: 20,
    is_available: true,
    is_chef_pick: true,
  },
  {
    _id: 'item_3',
    name: 'Tandoori Malai Broccoli',
    description:
      'Tender broccoli florets marinated with hung curd, roasted cardamom, white pepper, and mild melted cheddar.',
    price_paise: 32000,
    image_url:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    category_id: 'cat_starters',
    dietary_labels: ['VEG', 'GLUTEN_FREE'],
    allergens: ['Dairy'],
    nutrition: {
      calories: 280,
      protein: 14,
      carbs: 16,
      fats: 18,
      basis: 'Per 200g serving',
    },
    prep_time_minutes: 12,
    is_available: true,
  },
  {
    _id: 'item_4',
    name: 'Smoked Garlic Butter Prawns',
    description:
      'Jumbo coastal prawns tossed in browned garlic butter, crushed black pepper, fresh parsley, and lemon juice.',
    price_paise: 48000,
    image_url:
      'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&auto=format&fit=crop&q=80',
    category_id: 'cat_starters',
    dietary_labels: ['NON_VEG'],
    allergens: ['Shellfish', 'Dairy'],
    nutrition: {
      calories: 290,
      protein: 28,
      carbs: 4,
      fats: 16,
      basis: 'Per 180g serving',
    },
    prep_time_minutes: 12,
    is_available: true,
    is_chef_pick: true,
  },
  {
    _id: 'item_5',
    name: 'Garlic Butter Naan',
    description:
      'Clay oven baked leavened bread brushed with melted butter and fresh minced garlic with coriander.',
    price_paise: 8000,
    image_url:
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
    category_id: 'cat_breads',
    dietary_labels: ['VEG'],
    allergens: ['Gluten', 'Dairy'],
    nutrition: {
      calories: 220,
      protein: 6,
      carbs: 38,
      fats: 6,
      basis: 'Per piece',
    },
    prep_time_minutes: 6,
    is_available: true,
  },
  {
    _id: 'item_6',
    name: 'Spiced Masala Chaas',
    description:
      'Traditional churned artisan buttermilk tempered with roasted cumin, green chillies, ginger, and pink rock salt.',
    price_paise: 9000,
    image_url:
      'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80',
    category_id: 'cat_beverages',
    dietary_labels: ['VEG', 'GLUTEN_FREE'],
    allergens: ['Dairy'],
    nutrition: {
      calories: 95,
      protein: 5,
      carbs: 8,
      fats: 4,
      basis: 'Per 300ml glass',
    },
    prep_time_minutes: 4,
    is_available: true,
  },
];

const CATEGORIES: MenuCategory[] = [
  { _id: 'ALL', name: 'All Dishes', slug: 'all', item_count: 6 },
  { _id: 'cat_starters', name: 'Starters', slug: 'starters', item_count: 2 },
  { _id: 'cat_mains', name: 'Curries & Biryani', slug: 'mains', item_count: 2 },
  { _id: 'cat_breads', name: 'Tandoori Breads', slug: 'breads', item_count: 1 },
  { _id: 'cat_beverages', name: 'Beverages', slug: 'beverages', item_count: 1 },
];

type ViewMode = 'CUSTOMER' | 'WAITER' | 'KITCHEN';

function CustomerDiningApp() {
  const { totalItems, totalPaise, formatRupees } = useCart();

  const [items, setItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedDiet, setSelectedDiet] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedItemForDrawer, setSelectedItemForDrawer] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBillOpen, setIsBillOpen] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);

  // Fetch real menu items from API if available
  useEffect(() => {
    const loadApiMenu = async () => {
      try {
        const fetched = await menuApi.getMenuItems();
        if (fetched && fetched.length > 0) {
          setItems(fetched);
        }
      } catch {
        // Fallback to high-fidelity defaults
      }
    };
    loadApiMenu();
  }, []);

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return items.filter((dish) => {
      // Category filter
      if (activeCategory !== 'ALL' && dish.category_id !== activeCategory) {
        return false;
      }
      // Dietary filter
      if (selectedDiet === 'VEG' && !dish.dietary_labels.includes('VEG') && !dish.dietary_labels.includes('VEGAN')) {
        return false;
      }
      if (selectedDiet === 'NON_VEG' && !dish.dietary_labels.includes('NON_VEG')) {
        return false;
      }
      if (selectedDiet === 'VEGAN' && !dish.dietary_labels.includes('VEGAN')) {
        return false;
      }
      if (selectedDiet === 'GLUTEN_FREE' && !dish.dietary_labels.includes('GLUTEN_FREE')) {
        return false;
      }
      if (selectedDiet === 'HIGH_PROTEIN' && (dish.nutrition?.protein || 0) < 20) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = dish.name.toLowerCase().includes(query);
        const matchesDesc = dish.description.toLowerCase().includes(query);
        const matchesAllergens = dish.allergens?.some((a) => a.toLowerCase().includes(query));
        return matchesName || matchesDesc || matchesAllergens;
      }
      return true;
    });
  }, [items, activeCategory, selectedDiet, searchQuery]);

  const handleOrderPlaced = (newOrder: Order) => {
    setOrders((prev) => [...prev, newOrder]);
  };

  return (
    <div className="w-full max-w-[480px] mx-auto min-h-screen bg-surface flex flex-col font-sans pb-28 relative">
      {/* Session Header */}
      <TableSessionHeader />

      {/* Main Content Stream */}
      <main className="px-4 flex flex-col gap-3.5 mt-3">
        {/* Search Input Bar */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-[#594139] text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dishes, spices, allergens (e.g. Cashew)..."
            className="w-full bg-surface-lowest text-[#1B1C1A] placeholder:text-[#594139]/70 pl-10 pr-10 py-3 rounded-2xl text-xs font-medium border border-hairline shadow-sm outline-none focus:border-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-[#594139] text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dietary & Allergen Micro-Toggles (Horizontal Scroll) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedDiet('ALL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm transition-all ${
              selectedDiet === 'ALL'
                ? 'bg-[#1B1C1A] text-white'
                : 'bg-surface-lowest text-[#1B1C1A] border border-hairline'
            }`}
          >
            <span>All Diets</span>
          </button>

          <button
            onClick={() => setSelectedDiet(selectedDiet === 'VEG' ? 'ALL' : 'VEG')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm transition-all ${
              selectedDiet === 'VEG'
                ? 'bg-emerald-state text-white'
                : 'bg-surface-lowest text-[#1B1C1A] border border-hairline'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-sm bg-surface-lowest border border-emerald-state flex items-center justify-center p-0.5">
              <div className="w-2 h-2 rounded-full bg-emerald-state" />
            </div>
            <span>Pure Veg</span>
          </button>

          <button
            onClick={() => setSelectedDiet(selectedDiet === 'NON_VEG' ? 'ALL' : 'NON_VEG')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm transition-all ${
              selectedDiet === 'NON_VEG'
                ? 'bg-red-600 text-white'
                : 'bg-surface-lowest text-[#1B1C1A] border border-hairline'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-sm bg-surface-lowest border border-red-600 flex items-center justify-center p-0.5">
              <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-red-600" />
            </div>
            <span>Non-Veg</span>
          </button>

          <button
            onClick={() => setSelectedDiet(selectedDiet === 'GLUTEN_FREE' ? 'ALL' : 'GLUTEN_FREE')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm transition-all ${
              selectedDiet === 'GLUTEN_FREE'
                ? 'bg-amber-state text-white'
                : 'bg-surface-lowest text-[#1B1C1A] border border-hairline'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">grain</span>
            <span>Gluten-Free</span>
          </button>

          <button
            onClick={() => setSelectedDiet(selectedDiet === 'HIGH_PROTEIN' ? 'ALL' : 'HIGH_PROTEIN')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm transition-all ${
              selectedDiet === 'HIGH_PROTEIN'
                ? 'bg-primary text-white'
                : 'bg-surface-lowest text-[#1B1C1A] border border-hairline'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">fitness_center</span>
            <span>&gt;20g Protein</span>
          </button>
        </div>

        {/* Live Order Tracker Banner (If orders active) */}
        {orders.length > 0 && (
          <LiveOrderStepper
            orders={orders}
            onAddMore={() => {
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }}
            onViewBill={() => setIsBillOpen(true)}
          />
        )}

        {/* Sticky Category Rail */}
        <div className="sticky top-24 z-20 bg-[#FAF8F5]/90 backdrop-blur-md -mx-4 px-4 py-2 border-b border-hairline shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat._id;
              return (
                <button
                  key={cat._id}
                  onClick={() => setActiveCategory(cat._id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-container text-[#594139] hover:bg-surface-high hover:text-[#1B1C1A]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Dishes Feed */}
        <div className="flex flex-col gap-3.5 pt-1">
          {filteredDishes.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[32px] text-[#594139]">search_off</span>
              <p className="font-display font-bold text-sm text-[#1B1C1A]">No dishes match your filters</p>
              <button
                onClick={() => {
                  setActiveCategory('ALL');
                  setSelectedDiet('ALL');
                  setSearchQuery('');
                }}
                className="text-xs text-primary font-bold underline mt-1"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredDishes.map((item) => (
              <MenuItemCard
                key={item._id}
                item={item}
                onSelect={(selected) => setSelectedItemForDrawer(selected)}
              />
            ))
          )}
        </div>
      </main>

      {/* Floating Bottom Order Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto z-40 p-3 bg-gradient-to-t from-surface via-surface/95 to-transparent">
          <div className="bg-[#1B1C1A] text-white rounded-3xl p-3 shadow-drawer flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-2.5 pl-2">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-display font-bold text-xs shadow-sm">
                {totalItems}
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-sm leading-tight text-white">
                  {formatRupees(totalPaise)}
                </span>
                <span className="text-[10px] text-stone-300">Incl. 5% GST</span>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="h-10 px-4 rounded-full bg-primary hover:bg-primary-dark text-white font-display font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <span>Review Order</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailDrawer
        item={selectedItemForDrawer}
        isOpen={!!selectedItemForDrawer}
        onClose={() => setSelectedItemForDrawer(null)}
      />

      {/* Cart Review Sheet */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Bill Settlement Card Sheet */}
      {isBillOpen && (
        <div
          onClick={() => setIsBillOpen(false)}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in touch-manipulation"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[460px] animate-in slide-in-from-bottom duration-200"
          >
            <BillSettlementCard
              orders={orders}
              onClose={() => setIsBillOpen(false)}
              onSettled={() => {
                setTimeout(() => {
                  setOrders([]);
                  setIsBillOpen(false);
                }, 3000);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('CUSTOMER');

  return (
    <CartProvider>
      {/* Top Interface Mode Switcher Bar */}
      <div className="sticky top-0 z-50 w-full bg-[#1B1C1A] text-white py-2 px-4 shadow-md flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span className="font-display font-bold text-xs tracking-wider uppercase text-amber-200">
            Restro Manage OS
          </span>
        </div>

        {/* Mode Selector Pill */}
        <div className="flex items-center bg-white/10 p-0.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setViewMode('CUSTOMER')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'CUSTOMER'
                ? 'bg-primary text-white shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            Guest Mobile
          </button>

          <button
            onClick={() => setViewMode('WAITER')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'WAITER'
                ? 'bg-primary text-white shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            Waiter Terminal
          </button>

          <button
            onClick={() => setViewMode('KITCHEN')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'KITCHEN'
                ? 'bg-primary text-white shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            KDS Board
          </button>
        </div>
      </div>

      {/* Render Active View */}
      {viewMode === 'CUSTOMER' && <CustomerDiningApp />}
      {viewMode === 'WAITER' && <WaiterDispatch />}
      {viewMode === 'KITCHEN' && <KDSBoard />}
    </CartProvider>
  );
}
