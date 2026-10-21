'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { MenuItem, MenuCategory, Order } from '@/types/dining';
import { menuApi } from '@/services/api';
import MenuItemCard from '@/components/customer/MenuItemCard';
import ProductDetailDrawer from '@/components/customer/ProductDetailDrawer';
import CartDrawer from '@/components/customer/CartDrawer';
import LiveOrderStepper from '@/components/customer/LiveOrderStepper';
import MenuSkeleton from '@/components/customer/MenuSkeleton';

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

export default function CustomerMenuPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedDiet, setSelectedDiet] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedItemForDrawer, setSelectedItemForDrawer] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  // Check URL query for direct cart opening (e.g. /menu?cart=open)
  useEffect(() => {
    if (searchParams.get('cart') === 'open') {
      setIsCartOpen(true);
    }
  }, [searchParams]);

  // Fetch real menu from API if available
  useEffect(() => {
    let isMounted = true;
    const loadApiMenu = async () => {
      try {
        const fetched = await menuApi.getMenuItems();
        if (isMounted && fetched && fetched.length > 0) {
          setItems(fetched);
        }
      } catch {
        // Fallback to defaults
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadApiMenu();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return items.filter((dish) => {
      if (activeCategory !== 'ALL' && dish.category_id !== activeCategory) {
        return false;
      }
      if (selectedDiet === 'VEG' && !dish.dietary_labels.includes('VEG') && !dish.dietary_labels.includes('VEGAN')) {
        return false;
      }
      if (selectedDiet === 'NON_VEG' && !dish.dietary_labels.includes('NON_VEG')) {
        return false;
      }
      if (selectedDiet === 'GLUTEN_FREE' && !dish.dietary_labels.includes('GLUTEN_FREE')) {
        return false;
      }
      if (selectedDiet === 'HIGH_PROTEIN' && (dish.nutrition?.protein || 0) < 20) {
        return false;
      }
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
    // Save to local storage for live tracker
    try {
      const existing = JSON.parse(localStorage.getItem('restro_session_orders') || '[]');
      localStorage.setItem('restro_session_orders', JSON.stringify([...existing, newOrder]));
    } catch {
      // ignore
    }
  };

  if (isLoading) {
    return <MenuSkeleton />;
  }

  return (
    <div className="px-4 flex flex-col gap-3 mt-3 animate-in fade-in duration-200">
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

      {/* Dietary Micro-Toggles */}
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

      {/* Live Order Tracker Banner (If active orders placed in this session) */}
      {orders.length > 0 && (
        <LiveOrderStepper
          orders={orders}
          onAddMore={() => window.scrollTo({ top: 300, behavior: 'smooth' })}
          onViewBill={() => (window.location.href = '/bill')}
        />
      )}

      {/* Sticky Category Rail */}
      <div className="sticky top-14 z-20 bg-[#FAF8F5]/90 backdrop-blur-md -mx-4 px-4 py-2 border-b border-hairline shadow-sm">
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

      {/* Product Detail Modal */}
      <ProductDetailDrawer
        item={selectedItemForDrawer}
        isOpen={!!selectedItemForDrawer}
        onClose={() => setSelectedItemForDrawer(null)}
      />

      {/* Cart Review Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderPlaced={handleOrderPlaced}
      />
    </div>
  );
}
