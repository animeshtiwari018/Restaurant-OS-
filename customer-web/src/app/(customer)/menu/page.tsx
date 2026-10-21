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
    _id: 'item_str_001',
    name: 'Paneer Tikka (Tandoori Classic)',
    description:
      'Char-grilled cubes of malai paneer marinated in hung spiced curd, mustard oil, and roasted besan.',
    price_paise: 32000,
    image_url:
      'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
    category_id: 'cat_starters',
    dietary_labels: ['VEG'],
    allergens: ['Dairy'],
    nutrition: {
      calories: 320,
      protein: 18.0,
      carbs: 12.0,
      fats: 22.0,
      basis: 'Per 200g serving',
    },
    prep_time_minutes: 15,
    is_available: true,
    is_chef_pick: true,
  },
  {
    _id: 'item_str_002',
    name: 'Dahi Ke Kebab',
    description:
      'Crisp golden patties made with hung Greek-style yogurt, soft cottage cheese, and roasted cumin.',
    price_paise: 29000,
    image_url:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    category_id: 'cat_starters',
    dietary_labels: ['VEG'],
    allergens: ['Dairy', 'Gluten'],
    nutrition: {
      calories: 285,
      protein: 11.0,
      carbs: 19.0,
      fats: 17.0,
      basis: 'Per 180g serving',
    },
    prep_time_minutes: 12,
    is_available: true,
  },
  {
    _id: 'item_cur_001',
    name: 'Paneer Butter Masala Special',
    description:
      'Fresh malai paneer simmered in a slow-cooked tomato, table butter, and cashew nut reduction.',
    price_paise: 34000,
    image_url:
      'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
    category_id: 'cat_mains',
    dietary_labels: ['VEG'],
    allergens: ['Dairy', 'Tree Nuts'],
    nutrition: {
      calories: 440,
      protein: 18.2,
      carbs: 21.8,
      fats: 30.4,
      basis: 'Per 250g serving',
    },
    prep_time_minutes: 18,
    is_available: true,
    is_chef_pick: true,
  },
  {
    _id: 'item_cur_002',
    name: 'Dal Makhani Bukhara',
    description:
      'Slow-simmered whole black lentils cooked overnight with tomatoes, butter, and mild spices.',
    price_paise: 28000,
    image_url:
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    category_id: 'cat_mains',
    dietary_labels: ['VEG'],
    allergens: ['Dairy'],
    nutrition: {
      calories: 360,
      protein: 14.5,
      carbs: 38.0,
      fats: 16.8,
      basis: 'Per 250g serving',
    },
    prep_time_minutes: 12,
    is_available: true,
  },
  {
    _id: 'item_cur_003',
    name: 'Murgh Dum Biryani',
    description:
      'Aged long-grain basmati rice cooked with tender chicken cuts, browned shallots, and saffron.',
    price_paise: 41000,
    image_url:
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    category_id: 'cat_mains',
    dietary_labels: ['NON_VEG'],
    allergens: ['Dairy'],
    nutrition: {
      calories: 560,
      protein: 32.0,
      carbs: 64.0,
      fats: 18.5,
      basis: 'Per 350g serving',
    },
    prep_time_minutes: 20,
    is_available: true,
    is_chef_pick: true,
  },
  {
    _id: 'item_brd_001',
    name: 'Garlic Butter Naan',
    description:
      'Classic leavened flatbread topped with minced roasted garlic, fresh cilantro, and salted butter.',
    price_paise: 7500,
    image_url:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    category_id: 'cat_breads',
    dietary_labels: ['VEG'],
    allergens: ['Gluten', 'Dairy'],
    nutrition: {
      calories: 210,
      protein: 5.5,
      carbs: 34.0,
      fats: 6.2,
      basis: 'Per 90g serving',
    },
    prep_time_minutes: 6,
    is_available: true,
  },
  {
    _id: 'item_brd_002',
    name: 'Tandoori Roti (Whole Wheat)',
    description:
      'Traditional unleavened flatbread baked in a clay tandoor using stone-ground chakki wheat.',
    price_paise: 3500,
    image_url:
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80',
    category_id: 'cat_breads',
    dietary_labels: ['VEG', 'VEGAN'],
    allergens: ['Gluten'],
    nutrition: {
      calories: 120,
      protein: 3.8,
      carbs: 25.0,
      fats: 0.8,
      basis: 'Per 60g serving',
    },
    prep_time_minutes: 5,
    is_available: true,
  },
  {
    _id: 'item_bev_001',
    name: 'Masala Chaas',
    description:
      'Traditional churned yogurt spiced with roasted cumin, rock salt, fresh ginger, and mint.',
    price_paise: 5500,
    image_url:
      'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=600&auto=format&fit=crop&q=80',
    category_id: 'cat_beverages',
    dietary_labels: ['VEG'],
    allergens: ['Dairy'],
    nutrition: {
      calories: 62,
      protein: 3.1,
      carbs: 4.8,
      fats: 3.2,
      basis: 'Per 250ml glass',
    },
    prep_time_minutes: 4,
    is_available: true,
  },
  {
    _id: 'item_des_001',
    name: 'Gulab Jamun with Rabri',
    description:
      'Soft fried milk dough dumplings soaked in cardamom syrup, served over slow-cooked reduced milk.',
    price_paise: 14000,
    image_url:
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    category_id: 'cat_desserts',
    dietary_labels: ['VEG'],
    allergens: ['Dairy', 'Tree Nuts'],
    nutrition: {
      calories: 380,
      protein: 7.2,
      carbs: 52.0,
      fats: 16.0,
      basis: 'Per 150g serving',
    },
    prep_time_minutes: 5,
    is_available: true,
  },
];

const CATEGORIES: MenuCategory[] = [
  { _id: 'ALL', name: 'All Dishes', slug: 'all', item_count: 9 },
  { _id: 'cat_starters', name: 'Starters & Small Plates', slug: 'starters', item_count: 2 },
  { _id: 'cat_mains', name: 'Mains (Curries & Specialties)', slug: 'mains', item_count: 3 },
  { _id: 'cat_breads', name: 'Tandoor & Breads', slug: 'breads', item_count: 2 },
  { _id: 'cat_beverages', name: 'Beverages & Coolers', slug: 'beverages', item_count: 1 },
  { _id: 'cat_desserts', name: 'Desserts', slug: 'desserts', item_count: 1 },
];

export default function CustomerMenuPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);
  const [isLoading, setIsLoading] = useState(false);
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
        const [fetchedItems, fetchedCats] = await Promise.allSettled([
          menuApi.getMenuItems(),
          menuApi.getCategories(),
        ]);
        if (isMounted && fetchedItems.status === 'fulfilled' && fetchedItems.value?.length > 0) {
          setItems(fetchedItems.value);
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
      if (activeCategory !== 'ALL') {
        const catObj = typeof dish.category_id === 'object' ? dish.category_id as any : null;
        const catId = catObj?._id || dish.category_id;
        const catName = (catObj?.name || '').toLowerCase();
        
        const isMatch =
          catId === activeCategory ||
          (activeCategory === 'cat_starters' && catName.includes('starter')) ||
          (activeCategory === 'cat_mains' && (catName.includes('main') || catName.includes('curri'))) ||
          (activeCategory === 'cat_breads' && (catName.includes('bread') || catName.includes('tandoor'))) ||
          (activeCategory === 'cat_beverages' && (catName.includes('beverage') || catName.includes('cooler'))) ||
          (activeCategory === 'cat_desserts' && catName.includes('dessert'));

        if (!isMatch) {
          return false;
        }
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

  if (isLoading && items.length === 0) {
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
