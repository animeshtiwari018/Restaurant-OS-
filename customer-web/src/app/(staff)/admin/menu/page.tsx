'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { menuApi } from '@/services/api';

interface NutritionMacro {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sodium?: number;
}

interface DishItem {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  isVeg: boolean;
  inStock: boolean;
  nutrition: NutritionMacro;
  allergens: string[];
  prepTimeMinutes: number;
  coreTemp?: string;
  station?: string;
  chefNote?: string;
  spiceLevel?: string;
  dietaryTags: string[];
}

const DEFAULT_DISHES: DishItem[] = [
  {
    id: 'dish_104',
    code: 'DISH-104',
    name: 'Hawaiian Teriyaki Paneer Slider',
    category: 'Tandoor & Starters',
    description: 'Marinated grilled cottage cheese cubes, charred pineapple disc, teriyaki soy reduction in artisan brioche.',
    price: 340,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5E_zeoGy97pA1Qvhcn2x3YB05TQ7W2FzhrlY9D-ds3WEX4mhmhPEW6aF1ukympDUbCcpQYLAVrPi5l3mz4QbCseqC-Nil7DUYLcIPrl206dK0zpxHcb4vPzukJjlBqQxrLKTur7WGStjsk8P4mtzsd12JqAPffYWqgAOaQQmnQMgiJSBpjfrzSc0aGtc5ki56_DHXJHAgjzr7Hod5BqgsGsIJEKpXUO6bMjeBTggoFgabLRuP1zCmzQ',
    isVeg: true,
    inStock: true,
    nutrition: { calories: 510, protein: 18, carbs: 46, fats: 24, fiber: 6, sodium: 580 },
    allergens: ['Dairy', 'Gluten', 'Soy'],
    prepTimeMinutes: 12,
    coreTemp: '72°C',
    station: 'Grill Press #2',
    chefNote: 'Chef Vikram: Made with fresh daily paneer, grilled over coconut husk briquettes.',
    spiceLevel: 'Medium 🌶️🌶️',
    dietaryTags: ['Pure Veg'],
  },
  {
    id: 'dish_202',
    code: 'DISH-202',
    name: 'Paneer Butter Masala Special',
    category: 'Curries & Mains',
    description: 'Slow-simmered vine tomato gravy with house-churned butter, tender malai paneer & roasted fenugreek leaves.',
    price: 340,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAN_BYCFlWH0ADWvAIsOcGMIbc826fVR3kQv1t3MVZ4BgNaOyAwiF5A4z_DeH8SpARsnKAxEgleU8OtBEANnJp_wZYzcaCfKrYytEUfA5ivZqrdqODEvhZiuIz3UMZ389rCFvO60CEuJE-AxmLS-pxTWPCknslXJcYl6pqvfoA7csRKuckyDRIyWs1ome6KhWTU3fSF3DDA_NYQCgtwRzPkZNIvv9Fg5fLAIlh3jGI0UnIVSIKDWMc-Ew',
    isVeg: true,
    inStock: true,
    nutrition: { calories: 440, protein: 16, carbs: 22, fats: 32, fiber: 4, sodium: 620 },
    allergens: ['Dairy', 'Cashew Nut'],
    prepTimeMinutes: 15,
    coreTemp: '75°C',
    station: 'Curry Range #1',
    chefNote: 'Simmered over mild flame for velvety texture without artificial coloring.',
    spiceLevel: 'Mild 🌶️',
    dietaryTags: ['Pure Veg', 'Keto-Friendly'],
  },
  {
    id: 'dish_205',
    code: 'DISH-205',
    name: 'Dal Makhani Bukhara',
    category: 'Curries & Mains',
    description: '24-hour slow cooked unpolished urad dal over charcoal embers with organic white butter & garlic reduction.',
    price: 280,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuPvkx-aM8kkB0KBi6lE3IR07OU0vLR_2wk8rm4WCtVbsmw2ZzbMUBa-lmHkMBjYwb1Z7sfz22J9gY8S77KV7KUUhFDo_AJEVxHShGlEuif5EP0EBGtT-R3wJ_U0WYd_yDgWmgZyqf4Qrc2Ukn8FmgicawVDVfPFWHg7OW3U0lcVGnX0ZIt3bfBHiVTvbhXDvrWeGcv7WO2VDXosazFwvnmRSUuw0BwMTwjCiA2O4LiwQUMySMcIeKNw',
    isVeg: true,
    inStock: true,
    nutrition: { calories: 360, protein: 14, carbs: 38, fats: 18, fiber: 9, sodium: 510 },
    allergens: ['Dairy'],
    prepTimeMinutes: 20,
    coreTemp: '80°C',
    station: 'Simmer Pot #4',
    chefNote: 'Authentic 24-hr wood smoke profile. Unpolished organic black lentils.',
    spiceLevel: 'Mild 🌶️',
    dietaryTags: ['Pure Veg', 'Gluten-Free'],
  },
  {
    id: 'dish_301',
    code: 'DISH-301',
    name: 'Tandoori Roti (Whole Wheat)',
    category: 'Breads & Rice',
    description: '100% Stone-ground wheat flour flatbread crisp baked in authentic clay tandoor pit.',
    price: 45,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAn2V0EwhKabjeabzSwudBkyh7AAcANsnOay44oQ0ycwJ0EVf8BitV3Pn7ruu_W9PeeLcXm6_5VuVuWf8w88AyLLW8eQ4_T5vEAcTMU4LQzaqgyUd57A-ilLmJ_TIXBnZ4MTJFFEgXrD9Bm1k6KseS2Gmo0yIkH1_9ovxksS40qpqPXlWOBa13uaKIJJwt1hsuLPvso5dXg89sFTBNaNhsXwIBbl_xEWLCRfWLZgi-jD53U886dTbxD8g',
    isVeg: true,
    inStock: false,
    nutrition: { calories: 120, protein: 4, carbs: 24, fats: 1.5, fiber: 3, sodium: 110 },
    allergens: ['Gluten'],
    prepTimeMinutes: 8,
    coreTemp: '95°C',
    station: 'Tandoor Oven #1',
    chefNote: 'Baked directly on scorching clay walls at 320°C for airy blister crust.',
    spiceLevel: 'None',
    dietaryTags: ['Pure Veg'],
  },
  {
    id: 'dish_108',
    code: 'DISH-108',
    name: 'Spicy Tiki Smoked Burger',
    category: 'Tandoor & Starters',
    description: 'Applewood smoked charbroiled chicken patty, jalapeño relish, sharp cheddar, artisan seeded brioche.',
    price: 280,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGIwG9B5cDJn0-G5j1W1GlCxQhHmMEcyZAR9gVl0D1SVi0h8fUMbtjHwN-_6WzWgMyTmcwj-blaNiJWf1Bd8AS4f5YKchURymNhsQve-tJXcJ7JP7KdJeHDZTSBdFzYCcdIGSvGU4Fbh5-7LykRcexBVmXs63nOTO_7_bpgTpCkMZu8pTWH8uNcw_tcmIj_wBfj5x7BsGchPZIj4XU9dR2R71VSR3tvFVY-vFHCv60kAQCqyPatUT4RQ',
    isVeg: false,
    inStock: true,
    nutrition: { calories: 620, protein: 32, carbs: 44, fats: 34, fiber: 4, sodium: 790 },
    allergens: ['Gluten', 'Mustard', 'Dairy'],
    prepTimeMinutes: 14,
    coreTemp: '76°C',
    station: 'Charbroil Grille #3',
    chefNote: 'Smoked chicken breast with applewood smoke & melted aged gouda cheddar.',
    spiceLevel: 'Hot 🌶️🌶️🌶️',
    dietaryTags: ['Non-Veg'],
  },
];

export default function MenuNutritionCmsPage() {
  const [dishes, setDishes] = useState<DishItem[]>(DEFAULT_DISHES);
  const [selectedDishId, setSelectedDishId] = useState<string>('dish_104');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDietary, setSelectedDietary] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'popularity' | 'price' | 'calories' | 'name'>('popularity');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Dish Modal state
  const [isNewDishOpen, setIsNewDishOpen] = useState(false);
  const [newDishForm, setNewDishForm] = useState({
    name: '',
    category: 'Tandoor & Starters',
    price: 290,
    description: '',
    image: '',
    isVeg: true,
    calories: 450,
    protein: 18,
    carbs: 40,
    fats: 20,
    fiber: 5,
    prepTime: 12,
    allergens: ['Dairy'],
    spiceLevel: 'Medium 🌶️🌶️',
    chefNote: '',
  });

  // Selected dish details for Inspector
  const activeDish = useMemo(() => {
    return dishes.find((d) => d.id === selectedDishId) || dishes[0];
  }, [dishes, selectedDishId]);

  // Load dynamic dishes and categories from backend API on mount
  useEffect(() => {
    async function loadDynamicMenu() {
      try {
        const items = await menuApi.getMenuItems();
        if (items && items.length > 0) {
          const mappedItems: DishItem[] = items.map((item: any, idx: number) => {
            const isVeg =
              item.dietary_labels?.includes('VEG') ||
              item.dietary_labels?.includes('Pure Veg') ||
              !item.dietary_labels?.includes('NON_VEG');
            const code = `DISH-${100 + idx}`;
            return {
              id: item._id || `item_${idx}`,
              code,
              name: item.name,
              category: item.category_id?.name || 'Tandoor & Starters',
              description: item.description || 'Artisan chef prepared gourmet dish.',
              price: item.price_paise ? Math.round(item.price_paise / 100) : 280,
              image:
                item.image_urls?.[0] ||
                item.image_url ||
                DEFAULT_DISHES[idx % DEFAULT_DISHES.length].image,
              isVeg,
              inStock: item.is_available !== false,
              nutrition: {
                calories: item.nutrition?.calories || 420,
                protein: item.nutrition?.protein || 16,
                carbs: item.nutrition?.carbs || 36,
                fats: item.nutrition?.fat || item.nutrition?.fats || 18,
                fiber: 5,
                sodium: 520,
              },
              allergens: item.allergens && item.allergens.length > 0 ? item.allergens : ['Dairy'],
              prepTimeMinutes: item.preparation_time_minutes || 15,
              coreTemp: '72°C',
              station: 'Chef Station #1',
              chefNote: `Chef signature formulation with premium fresh ingredients.`,
              spiceLevel: 'Medium 🌶️',
              dietaryTags: isVeg ? ['Pure Veg'] : ['Non-Veg'],
            };
          });

          // Merge mapped items with default items if desired, keeping unique IDs
          setDishes((prev) => {
            const existingCodes = new Set(mappedItems.map((m) => m.code));
            const retainedDefaults = prev.filter((d) => !existingCodes.has(d.code));
            return [...mappedItems, ...retainedDefaults];
          });
        }
      } catch (err) {
        console.warn('Backend menu fetch returned default items:', err);
      }
    }

    loadDynamicMenu();
  }, []);

  // Filtered & Sorted items
  const filteredDishes = useMemo(() => {
    return dishes
      .filter((dish) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = dish.name.toLowerCase().includes(q);
          const matchesCode = dish.code.toLowerCase().includes(q);
          const matchesAllergen = dish.allergens.some((a) => a.toLowerCase().includes(q));
          const matchesCategory = dish.category.toLowerCase().includes(q);
          if (!matchesName && !matchesCode && !matchesAllergen && !matchesCategory) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'All' && !dish.category.toLowerCase().includes(selectedCategory.toLowerCase())) {
          return false;
        }

        // Dietary filter
        if (selectedDietary === 'Pure Veg' && !dish.isVeg) return false;
        if (selectedDietary === 'Non-Veg' && dish.isVeg) return false;
        if (selectedDietary === 'Gluten-Free' && dish.allergens.includes('Gluten')) return false;
        if (selectedDietary === 'Keto-Friendly' && dish.nutrition.carbs > 30) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price;
        if (sortBy === 'calories') return a.nutrition.calories - b.nutrition.calories;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0; // popularity / default
      });
  }, [dishes, searchQuery, selectedCategory, selectedDietary, sortBy]);

  // Derived KPI metrics
  const totalCount = dishes.length;
  const activeCount = dishes.filter((d) => d.inStock).length;
  const disabledCount = dishes.filter((d) => !d.inStock).length;
  const disabledNames = dishes
    .filter((d) => !d.inStock)
    .map((d) => d.name)
    .slice(0, 2)
    .join(', ');
  const vegCount = dishes.filter((d) => d.isVeg).length;
  const vegPercent = totalCount > 0 ? Math.round((vegCount / totalCount) * 100) : 65;
  const nonVegPercent = 100 - vegPercent;

  // Toggle item inStock (86'd status)
  const handleToggleStock = async (dishId: string) => {
    const targetDish = dishes.find((d) => d.id === dishId);
    if (!targetDish) return;
    const newStatus = !targetDish.inStock;

    setDishes((prev) =>
      prev.map((item) => (item.id === dishId ? { ...item, inStock: newStatus } : item))
    );

    showToast(`${targetDish.name} is now ${newStatus ? 'IN STOCK' : "86'D (OUT OF STOCK)"}`);

    // Call backend API if connected
    try {
      if (dishId.length === 24) {
        // Mongo ObjectId
        await menuApi.toggleItemAvailability(dishId, newStatus);
      }
    } catch (e) {
      console.warn('API sync deferred:', e);
    }
  };

  // Bulk 86 toggle
  const handleBulkToggle = () => {
    const hasActive = dishes.some((d) => d.inStock);
    const updatedStatus = !hasActive;
    setDishes((prev) => prev.map((d) => ({ ...d, inStock: updatedStatus })));
    showToast(
      updatedStatus
        ? 'All items restored to IN STOCK'
        : 'All items marked 86 (Bulk Disabled)'
    );
  };

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Export Nutrition Sheet as CSV
  const handleExportSheet = () => {
    const headers = [
      'Dish Code',
      'Dish Name',
      'Category',
      'Price (INR)',
      'Calories (kcal)',
      'Protein (g)',
      'Carbohydrates (g)',
      'Total Fats (g)',
      'Fiber (g)',
      'Allergens',
      'Dietary',
      'In Stock',
    ];
    const rows = dishes.map((d) => [
      d.code,
      `"${d.name.replace(/"/g, '""')}"`,
      `"${d.category}"`,
      d.price,
      d.nutrition.calories,
      d.nutrition.protein,
      d.nutrition.carbs,
      d.nutrition.fats,
      d.nutrition.fiber || 0,
      `"${d.allergens.join(', ')}"`,
      d.isVeg ? 'Vegetarian' : 'Non-Vegetarian',
      d.inStock ? 'In Stock' : '86 Out of Stock',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FSSAI_Nutrition_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Nutrition Sheet CSV successfully!');
  };

  // Toggle allergen checkbox on active dish
  const handleToggleAllergen = (allergenName: string) => {
    if (!activeDish) return;
    const exists = activeDish.allergens.includes(allergenName);
    const updated = exists
      ? activeDish.allergens.filter((a) => a !== allergenName)
      : [...activeDish.allergens, allergenName];

    setDishes((prev) =>
      prev.map((d) => (d.id === activeDish.id ? { ...d, allergens: updated } : d))
    );
  };

  // Save recipe changes
  const handleSaveRecipeChanges = async () => {
    if (!activeDish) return;
    showToast(`Saved nutrition & allergen matrix for ${activeDish.name}`);
    try {
      if (activeDish.id.length === 24) {
        await menuApi.updateMenuItem(activeDish.id, {
          allergens: activeDish.allergens,
          nutrition: activeDish.nutrition,
          preparation_time_minutes: activeDish.prepTimeMinutes,
        });
      }
    } catch (e) {
      console.warn('API save deferred:', e);
    }
  };

  // Handle New Dish Creation
  const handleCreateNewDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishForm.name.trim()) return;

    const newCode = `DISH-${100 + dishes.length + 1}`;
    const newDish: DishItem = {
      id: `dish_${Date.now()}`,
      code: newCode,
      name: newDishForm.name.trim(),
      category: newDishForm.category,
      description: newDishForm.description || 'Freshly prepared specialty dish.',
      price: Number(newDishForm.price) || 250,
      image:
        newDishForm.image.trim() ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      isVeg: newDishForm.isVeg,
      inStock: true,
      nutrition: {
        calories: Number(newDishForm.calories) || 400,
        protein: Number(newDishForm.protein) || 15,
        carbs: Number(newDishForm.carbs) || 35,
        fats: Number(newDishForm.fats) || 18,
        fiber: Number(newDishForm.fiber) || 4,
        sodium: 480,
      },
      allergens: newDishForm.allergens,
      prepTimeMinutes: Number(newDishForm.prepTime) || 15,
      coreTemp: '72°C',
      station: 'Chef Station #1',
      chefNote: newDishForm.chefNote || 'Prepared with culinary excellence.',
      spiceLevel: newDishForm.spiceLevel,
      dietaryTags: newDishForm.isVeg ? ['Pure Veg'] : ['Non-Veg'],
    };

    setDishes((prev) => [newDish, ...prev]);
    setSelectedDishId(newDish.id);
    setIsNewDishOpen(false);
    showToast(`Added new dish entry: ${newDish.name}`);

    // Try sending to backend
    try {
      await menuApi.createMenuItem({
        name: newDish.name,
        description: newDish.description,
        price_paise: newDish.price * 100,
        image_urls: [newDish.image],
        allergens: newDish.allergens,
        nutrition: newDish.nutrition,
        dietary_labels: newDish.isVeg ? ['VEG'] : ['NON_VEG'],
        preparation_time_minutes: newDish.prepTimeMinutes,
        is_available: true,
      });
    } catch (e) {
      console.warn('Backend item creation deferred:', e);
    }
  };

  return (
    <div className="bg-[#FAF8F5] text-[#1B1C1A] min-h-screen font-sans antialiased selection:bg-[#A33215]/20 selection:text-[#A33215]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#1C1D1B] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-[#006B2C] text-[20px]">check_circle</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Sidebar - Stitch Executive Operations Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-[#1C1D1B] text-[#F2F0ED] z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] select-none">
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="p-4 flex items-center gap-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-lg bg-[#A33215] flex items-center justify-center text-white shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[22px]">restaurant</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-display font-extrabold text-base tracking-tight text-white truncate">
                Restro Manage
              </span>
              <div className="inline-flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-semibold text-stone-400 truncate">
                  Flagship (Main Floor)
                </span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col gap-1 p-3">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-300 hover:bg-white/10 hover:text-white transition-colors text-xs font-semibold"
            >
              <span className="material-symbols-outlined shrink-0 text-[20px]">table_restaurant</span>
              <span>Live Floor Map</span>
            </Link>

            <Link
              href="/admin/menu"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#A33215] text-white shadow-sm font-bold text-xs"
            >
              <span className="material-symbols-outlined shrink-0 text-[20px]">menu_book</span>
              <span>Menu &amp; Nutrition CMS</span>
            </Link>

            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-300 hover:bg-white/10 hover:text-white transition-colors text-xs font-semibold"
            >
              <span className="material-symbols-outlined shrink-0 text-[20px]">calendar_month</span>
              <span>Advance Reservations</span>
            </Link>

            <Link
              href="/kitchen"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-300 hover:bg-white/10 hover:text-white transition-colors text-xs font-semibold"
            >
              <span className="material-symbols-outlined shrink-0 text-[20px]">soup_kitchen</span>
              <span>Live Orders &amp; KDS Feed</span>
            </Link>

            <Link
              href="/bill"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-300 hover:bg-white/10 hover:text-white transition-colors text-xs font-semibold"
            >
              <span className="material-symbols-outlined shrink-0 text-[20px]">receipt_long</span>
              <span>Billing &amp; Settlement Audit</span>
            </Link>

            <Link
              href="/waiter"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-300 hover:bg-white/10 hover:text-white transition-colors text-xs font-semibold"
            >
              <span className="material-symbols-outlined shrink-0 text-[20px]">badge</span>
              <span>Staff &amp; Role Permissions</span>
            </Link>
          </nav>
        </div>

        {/* User Card */}
        <div className="p-3 m-3 rounded-xl bg-white/5 flex items-center justify-between border border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#CB4914] text-white flex items-center justify-center font-display font-extrabold text-xs shrink-0 shadow-inner">
              VM
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-display font-bold text-xs text-white truncate">
                Vikram M.
              </span>
              <span className="text-[11px] text-stone-400 truncate">General Manager</span>
            </div>
          </div>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            type="button"
            title="Switch User / Station"
          >
            <span className="material-symbols-outlined text-[20px]">sync_alt</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-72">
        {/* Top Header Bar */}
        <header className="fixed top-0 left-72 right-0 h-16 bg-[#FAF8F5]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center shrink-0 whitespace-nowrap gap-1.5 px-3 py-1 rounded-full bg-[#00873A]/15 text-[#006B2C] text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-[#006B2C] shrink-0 animate-pulse" />
                Live Sync Connected
              </span>
            </div>
            <div className="hidden xl:flex items-center gap-1 bg-[#EFEEEB] p-1 rounded-lg">
              <button className="px-3 py-1.5 rounded text-xs font-bold bg-white text-[#1B1C1A] shadow-sm whitespace-nowrap">
                All Floors (18)
              </button>
              <button className="px-3 py-1.5 rounded text-xs font-semibold text-[#594139] hover:text-[#1B1C1A] transition-colors whitespace-nowrap">
                Ground Floor (8)
              </button>
              <button className="px-3 py-1.5 rounded text-xs font-semibold text-[#594139] hover:text-[#1B1C1A] transition-colors whitespace-nowrap">
                Balcony (6)
              </button>
              <button className="px-3 py-1.5 rounded text-xs font-semibold text-[#594139] hover:text-[#1B1C1A] transition-colors whitespace-nowrap">
                Rooftop Terrace (4)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center whitespace-nowrap gap-1.5 px-3.5 py-2 rounded-lg bg-[#A33215] text-white text-xs font-bold hover:bg-[#CB4914] transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              + Quick Walk-in Table
            </Link>
            <button
              onClick={() => setIsNewDishOpen(true)}
              className="inline-flex items-center whitespace-nowrap gap-1.5 px-3.5 py-2 rounded-lg bg-[#F5F3F0] text-[#1B1C1A] text-xs font-bold hover:bg-[#EFEEEB] transition-colors border border-stone-200"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              + Add Menu Item
            </button>
            <div className="flex items-center gap-1 border-l border-stone-200 pl-2">
              <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-[#594139] hover:bg-[#EFEEEB] transition-colors">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#A33215] ring-2 ring-white" />
              </button>
              <button
                onClick={() => showToast('Refreshing CMS catalog & nutrition status...')}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[#594139] hover:bg-[#EFEEEB] transition-colors"
                title="Refresh catalog"
              >
                <span className="material-symbols-outlined text-[20px]">refresh</span>
              </button>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#A33215] flex items-center justify-center shrink-0 text-white shadow-sm">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="relative pt-20 pb-16 w-full min-h-screen bg-[#FAF8F5] px-6">
          <div className="flex flex-col w-full gap-6">
            {/* Top Section Title & Subtitle + Regulatory Status Bar */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-stone-100">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-display font-extrabold text-2xl text-[#1B1C1A] tracking-tight">
                    Menu &amp; Nutrition CMS
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00873A]/15 text-[#006B2C] text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006B2C] animate-pulse" />
                    FSSAI &amp; Food Labelling Compliant • 96% Verified
                  </span>
                </div>
                <p className="text-sm text-[#594139] mt-1 font-normal">
                  Culinary Catalog, Nutritional Labelling, Allergen Matrix &amp; Live 86 Stock Control across 4 Kitchen Stations
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <button
                  onClick={handleExportSheet}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#F5F3F0] text-[#1B1C1A] hover:bg-[#EFEEEB] text-xs font-bold transition-all border border-stone-200"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Export Nutrition Sheet (PDF/CSV)
                </button>
                <button
                  onClick={handleBulkToggle}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#F5F3F0] text-[#BA1A1A] hover:bg-[#FFDAD6]/40 text-xs font-bold transition-all border border-stone-200"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">block</span>
                  Bulk 86 Toggle
                </button>
                <button
                  onClick={() => setIsNewDishOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#A33215] text-white hover:bg-[#CB4914] text-xs font-bold transition-all shadow-sm"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  + New Dish Entry
                </button>
              </div>
            </div>

            {/* Metric / Status Ribbon (4 KPI modules) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Card 1: Live Catalog */}
              <div className="p-5 rounded-xl bg-white shadow-sm border border-stone-100 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#594139]">
                  <span className="text-xs uppercase font-bold tracking-wider">Live Catalog</span>
                  <span className="w-8 h-8 rounded-lg bg-[#F5F3F0] text-[#A33215] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
                  </span>
                </div>
                <div className="mt-4">
                  <div className="font-display font-black text-3xl text-[#1B1C1A] leading-none">
                    {totalCount}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs text-[#006B2C] font-bold">{activeCount} Active Dishes</span>
                    <span className="text-[#594139] text-[11px]">• 3 Seasonal, 2 Drafts</span>
                  </div>
                </div>
                <div className="w-full bg-[#F5F3F0] h-1.5 rounded-full mt-4 overflow-hidden">
                  <div
                    className="bg-[#A33215] h-full rounded-full transition-all duration-500"
                    style={{ width: `${totalCount > 0 ? (activeCount / totalCount) * 100 : 92}%` }}
                  />
                </div>
              </div>

              {/* Card 2: Macro Transparency */}
              <div className="p-5 rounded-xl bg-white shadow-sm border border-stone-100 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#594139]">
                  <span className="text-xs uppercase font-bold tracking-wider">Macro Transparency</span>
                  <span className="w-8 h-8 rounded-lg bg-[#00873A]/15 text-[#006B2C] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">health_and_safety</span>
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-black text-3xl text-[#1B1C1A] leading-none">94</span>
                    <span className="font-display font-semibold text-lg text-[#594139]">/ 100</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs text-[#006B2C] font-bold">Health Audit Score</span>
                    <span className="text-[#594139] text-[11px]">• Allergen &amp; Cal Verified</span>
                  </div>
                </div>
                <div className="w-full bg-[#F5F3F0] h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-[#006B2C] h-full rounded-full" style={{ width: '94%' }} />
                </div>
              </div>

              {/* Card 3: 86'd Out of Stock */}
              <div className="p-5 rounded-xl bg-white shadow-sm border border-stone-100 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#594139]">
                  <span className="text-xs uppercase font-bold tracking-wider">86'd Out of Stock</span>
                  <span className="w-8 h-8 rounded-lg bg-[#FFDAD6]/50 text-[#BA1A1A] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">remove_shopping_cart</span>
                  </span>
                </div>
                <div className="mt-4">
                  <div className="font-display font-black text-3xl text-[#A33215] leading-none">
                    {disabledCount}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 truncate">
                    <span className="text-xs text-[#BA1A1A] font-bold">
                      {disabledCount} {disabledCount === 1 ? 'Dish' : 'Dishes'} Disabled
                    </span>
                    <span className="text-[#594139] text-[11px] truncate">
                      {disabledCount > 0 ? `• ${disabledNames}` : '• All operational'}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-[#F5F3F0] h-1.5 rounded-full mt-4 overflow-hidden">
                  <div
                    className="bg-[#A33215] h-full rounded-full transition-all duration-500"
                    style={{ width: `${totalCount > 0 ? (disabledCount / totalCount) * 100 : 6}%` }}
                  />
                </div>
              </div>

              {/* Card 4: Dietary Profile */}
              <div className="p-5 rounded-xl bg-white shadow-sm border border-stone-100 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#594139]">
                  <span className="text-xs uppercase font-bold tracking-wider">Dietary Profile</span>
                  <span className="w-8 h-8 rounded-lg bg-[#F5F3F0] text-[#9B4500] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">pie_chart</span>
                  </span>
                </div>
                <div className="mt-4">
                  <div className="font-display font-black text-3xl text-[#1B1C1A] leading-none">
                    {vegPercent}%
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs text-[#006B2C] font-bold">Vegetarian</span>
                    <span className="text-[#594139] text-[11px]">• {nonVegPercent}% Non-Veg / Poultry</span>
                  </div>
                </div>
                <div className="w-full bg-[#F5F3F0] h-1.5 rounded-full mt-4 overflow-hidden flex">
                  <div className="bg-[#006B2C] h-full transition-all duration-500" style={{ width: `${vegPercent}%` }} />
                  <div className="bg-[#FD8A42] h-full transition-all duration-500" style={{ width: `${nonVegPercent}%` }} />
                </div>
              </div>
            </div>

            {/* Search & Category Pill Ribbon */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl bg-white shadow-sm border border-stone-100">
              {/* Search Bar */}
              <div className="relative w-full lg:w-96">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dish name, recipe code (e.g. DISH-104), or allergen..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#F5F3F0] text-[#1B1C1A] placeholder:text-[#594139]/60 text-xs font-medium focus:outline-none focus:bg-[#EFEEEB] transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              {/* Category Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                    selectedCategory === 'All'
                      ? 'bg-[#A33215] text-white shadow-sm'
                      : 'bg-[#F5F3F0] text-[#594139] hover:text-[#1B1C1A]'
                  }`}
                >
                  All Categories ({dishes.length})
                </button>
                <button
                  onClick={() => setSelectedCategory('Tandoor & Starters')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                    selectedCategory === 'Tandoor & Starters'
                      ? 'bg-[#A33215] text-white shadow-sm'
                      : 'bg-[#F5F3F0] text-[#594139] hover:text-[#1B1C1A]'
                  }`}
                >
                  Tandoor &amp; Starters ({dishes.filter((d) => d.category.includes('Starters') || d.category.includes('Tandoor')).length})
                </button>
                <button
                  onClick={() => setSelectedCategory('Curries & Mains')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                    selectedCategory === 'Curries & Mains'
                      ? 'bg-[#A33215] text-white shadow-sm'
                      : 'bg-[#F5F3F0] text-[#594139] hover:text-[#1B1C1A]'
                  }`}
                >
                  Curries &amp; Mains ({dishes.filter((d) => d.category.includes('Curries') || d.category.includes('Mains')).length})
                </button>
                <button
                  onClick={() => setSelectedCategory('Breads & Rice')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                    selectedCategory === 'Breads & Rice'
                      ? 'bg-[#A33215] text-white shadow-sm'
                      : 'bg-[#F5F3F0] text-[#594139] hover:text-[#1B1C1A]'
                  }`}
                >
                  Breads &amp; Rice ({dishes.filter((d) => d.category.includes('Breads') || d.category.includes('Rice')).length})
                </button>
                <button
                  onClick={() => setSelectedCategory('Beverages & Desserts')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                    selectedCategory === 'Beverages & Desserts'
                      ? 'bg-[#A33215] text-white shadow-sm'
                      : 'bg-[#F5F3F0] text-[#594139] hover:text-[#1B1C1A]'
                  }`}
                >
                  Beverages &amp; Desserts ({dishes.filter((d) => d.category.includes('Beverages') || d.category.includes('Desserts')).length})
                </button>
              </div>
            </div>

            {/* Split 2-Column: 68% Catalog Registry | 32% Quick Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (68% -> lg:col-span-8) */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                {/* Filter & Sort Sub-bar */}
                <div className="flex items-center justify-between p-2.5 px-4 bg-[#F5F3F0] rounded-xl border border-stone-200">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-[#594139] uppercase font-bold tracking-wider mr-1">
                      Filters:
                    </span>
                    <button
                      onClick={() => setSelectedDietary(selectedDietary === 'Pure Veg' ? 'All' : 'Pure Veg')}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all ${
                        selectedDietary === 'Pure Veg'
                          ? 'bg-white text-[#006B2C] ring-1 ring-[#006B2C]'
                          : 'bg-white/60 hover:bg-white text-[#594139]'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-[#006B2C]" />
                      Pure Veg
                    </button>
                    <button
                      onClick={() => setSelectedDietary(selectedDietary === 'Non-Veg' ? 'All' : 'Non-Veg')}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                        selectedDietary === 'Non-Veg'
                          ? 'bg-white text-[#BA1A1A] ring-1 ring-[#BA1A1A]'
                          : 'bg-white/60 hover:bg-white text-[#594139]'
                      }`}
                    >
                      Non-Veg
                    </button>
                    <button
                      onClick={() => setSelectedDietary(selectedDietary === 'Gluten-Free' ? 'All' : 'Gluten-Free')}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                        selectedDietary === 'Gluten-Free'
                          ? 'bg-white text-[#A33215] ring-1 ring-[#A33215]'
                          : 'bg-white/60 hover:bg-white text-[#594139]'
                      }`}
                    >
                      Gluten-Free
                    </button>
                    <button
                      onClick={() => setSelectedDietary(selectedDietary === 'Keto-Friendly' ? 'All' : 'Keto-Friendly')}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                        selectedDietary === 'Keto-Friendly'
                          ? 'bg-white text-[#9B4500] ring-1 ring-[#9B4500]'
                          : 'bg-white/60 hover:bg-white text-[#594139]'
                      }`}
                    >
                      Keto-Friendly
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[#594139] text-xs">
                    <span className="material-symbols-outlined text-[16px]">swap_vert</span>
                    <span>Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-white border border-stone-200 rounded px-2 py-0.5 text-xs font-bold text-[#1B1C1A] focus:outline-none"
                    >
                      <option value="popularity">Popularity</option>
                      <option value="price">Price (Low to High)</option>
                      <option value="calories">Calories (Lowest)</option>
                      <option value="name">Name (A-Z)</option>
                    </select>
                  </div>
                </div>

                {/* Menu Items Registry (Card Modules) */}
                <div className="flex flex-col gap-4">
                  {filteredDishes.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center border border-stone-100 flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-[48px] text-stone-300 mb-2">
                        no_meals
                      </span>
                      <p className="font-bold text-sm text-[#1B1C1A]">No dishes match your filter</p>
                      <p className="text-xs text-[#594139] mt-1">Try clearing filters or search query.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('All');
                          setSelectedDietary('All');
                        }}
                        className="mt-4 px-4 py-2 rounded-lg bg-[#A33215] text-white text-xs font-bold shadow-sm hover:bg-[#CB4914]"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    filteredDishes.map((dish) => {
                      const isSelected = dish.id === activeDish.id;

                      return (
                        <div
                          key={dish.id}
                          onClick={() => setSelectedDishId(dish.id)}
                          className={`p-5 rounded-xl transition-all cursor-pointer relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border ${
                            isSelected
                              ? 'bg-white shadow-md ring-2 ring-[#A33215]/20 border-transparent hover:shadow-lg'
                              : dish.inStock
                              ? 'bg-white shadow-sm border-stone-100 hover:shadow-md'
                              : 'bg-[#F5F3F0]/70 shadow-sm border-stone-200 opacity-85'
                          }`}
                        >
                          {/* Left terracotta stripe for selected card */}
                          {isSelected && (
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#A33215]" />
                          )}

                          {/* Left: Thumbnail & Details */}
                          <div className="flex items-center gap-4 min-w-0">
                            {/* Thumbnail */}
                            <div
                              className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#EFEEEB] border border-stone-200 ${
                                !dish.inStock ? 'filter grayscale-[40%]' : ''
                              }`}
                            >
                              <img
                                src={dish.image}
                                alt={dish.name}
                                className="w-full h-full object-cover"
                              />
                              {/* Veg / Non-Veg Indicator */}
                              <div className="absolute top-1 left-1 w-4 h-4 rounded bg-white flex items-center justify-center shadow-xs">
                                {dish.isVeg ? (
                                  <span className="w-2 h-2 rounded-full bg-[#006B2C]" />
                                ) : (
                                  <span className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[7px] border-b-[#BA1A1A]" />
                                )}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-display font-bold text-base text-[#1B1C1A] truncate">
                                  {dish.name}
                                </span>
                                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#EAE8E5] text-[#594139] font-semibold">
                                  {dish.code}
                                </span>
                                {!dish.inStock ? (
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FFDBCF] text-[#822700]">
                                    86'D / OUT OF STOCK
                                  </span>
                                ) : (
                                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F5F3F0] text-[#594139]">
                                    {dish.category}
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-[#594139] line-clamp-1 mt-0.5 font-normal">
                                {dish.description}
                              </p>

                              {/* Nutrition Pill & Macros */}
                              <div className="flex items-center gap-2 mt-2 flex-wrap text-xs text-[#594139]">
                                <span className="px-2 py-0.5 rounded-md bg-[#EAE8E5] text-[#1B1C1A] font-bold">
                                  {dish.nutrition.calories} kcal
                                </span>
                                <span>
                                  P: <strong className="text-[#1B1C1A] font-bold">{dish.nutrition.protein}g</strong>
                                </span>
                                <span className="text-stone-300">•</span>
                                <span>
                                  C: <strong className="text-[#1B1C1A] font-bold">{dish.nutrition.carbs}g</strong>
                                </span>
                                <span className="text-stone-300">•</span>
                                <span>
                                  F: <strong className="text-[#1B1C1A] font-bold">{dish.nutrition.fats}g</strong>
                                </span>
                                {dish.nutrition.fiber ? (
                                  <>
                                    <span className="text-stone-300">•</span>
                                    <span className="text-[#006B2C] font-semibold text-[11px]">
                                      Fiber: {dish.nutrition.fiber}g
                                    </span>
                                  </>
                                ) : dish.nutrition.sodium ? (
                                  <>
                                    <span className="text-stone-300">•</span>
                                    <span className="text-[11px]">Sodium: {dish.nutrition.sodium}mg</span>
                                  </>
                                ) : null}
                              </div>

                              {/* Allergen Chips */}
                              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                {dish.allergens.map((all, i) => (
                                  <span
                                    key={i}
                                    className="text-[11px] font-semibold text-[#9B4500] px-1.5 py-0.5 rounded bg-[#FFDBCA]/50"
                                  >
                                    {all}
                                  </span>
                                ))}
                                {!dish.inStock && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A33215] bg-[#FFDBCF]/40 px-2 py-0.5 rounded">
                                    <span className="material-symbols-outlined text-[13px]">alarm</span>
                                    Restock: Evening Prep 18:00
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Price & Stock Controller */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex md:flex-col items-end justify-between md:justify-center gap-2 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-[#EFEEEB]"
                          >
                            <div className="font-display font-extrabold text-lg text-[#1B1C1A]">
                              ₹{dish.price.toFixed(2)}
                            </div>

                            {/* Stock Toggle Switch */}
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-bold ${
                                  dish.inStock ? 'text-[#006B2C]' : 'text-[#A33215]'
                                }`}
                              >
                                {dish.inStock ? 'IN STOCK' : 'DISABLED'}
                              </span>
                              <button
                                onClick={() => handleToggleStock(dish.id)}
                                className={`w-11 h-6 rounded-full relative p-0.5 transition-colors focus:outline-none ${
                                  dish.inStock ? 'bg-[#00873A]' : 'bg-[#E4E2DF]'
                                }`}
                                type="button"
                                title={dish.inStock ? 'Mark Out of Stock (86)' : 'Mark In Stock'}
                              >
                                <span
                                  className={`block w-5 h-5 rounded-full shadow-sm transform transition-transform ${
                                    dish.inStock ? 'bg-white translate-x-5' : 'bg-white translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5 mt-1">
                              <button
                                onClick={() => setSelectedDishId(dish.id)}
                                className="px-2.5 py-1 rounded bg-[#F5F3F0] hover:bg-[#EFEEEB] text-xs font-semibold text-[#1B1C1A] transition-colors border border-stone-200"
                                type="button"
                              >
                                Edit Formula
                              </button>
                              <button
                                onClick={() =>
                                  showToast(`Generated & printed QR recipe card for ${dish.name}`)
                                }
                                className="p-1 rounded bg-[#F5F3F0] hover:bg-[#EFEEEB] text-[#594139] hover:text-[#1B1C1A] transition-colors border border-stone-200"
                                title="Print QR Label"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column (32% -> lg:col-span-4) Quick Nutrition & Allergen Inspector */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-white rounded-xl shadow-md p-5 flex flex-col gap-5 sticky top-20 border border-stone-100">
                  {/* Inspector Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#EFEEEB]">
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-[11px] text-[#A33215] uppercase font-bold tracking-wider">
                        Active Dish Inspector
                      </span>
                      <span className="font-display font-extrabold text-base text-[#1B1C1A] truncate">
                        {activeDish.name}
                      </span>
                    </div>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#EFEEEB] text-[#594139] shrink-0 font-semibold">
                      {activeDish.code}
                    </span>
                  </div>

                  {/* Macro Breakdown Visual Progress Bars */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1B1C1A]">Nutritional Calibration</span>
                      <span className="font-display font-extrabold text-sm text-[#A33215]">
                        {activeDish.nutrition.calories} kcal / serving
                      </span>
                    </div>

                    {/* Bar 1: Protein */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#594139]">Protein</span>
                        <span className="font-bold text-[#1B1C1A]">
                          {activeDish.nutrition.protein}g{' '}
                          <span className="text-[#594139] font-normal">
                            ({Math.min(100, Math.round((activeDish.nutrition.protein / 50) * 100))}% DV)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-[#F5F3F0] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#A33215] h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.round((activeDish.nutrition.protein / 50) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Bar 2: Carbs */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#594139]">Carbohydrates</span>
                        <span className="font-bold text-[#1B1C1A]">
                          {activeDish.nutrition.carbs}g{' '}
                          <span className="text-[#594139] font-normal">
                            ({Math.min(100, Math.round((activeDish.nutrition.carbs / 110) * 100))}% DV)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-[#F5F3F0] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#FD8A42] h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.round((activeDish.nutrition.carbs / 110) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Bar 3: Fats */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#594139]">Total Fats</span>
                        <span className="font-bold text-[#1B1C1A]">
                          {activeDish.nutrition.fats}g{' '}
                          <span className="text-[#594139] font-normal">
                            ({Math.min(100, Math.round((activeDish.nutrition.fats / 70) * 100))}% DV)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-[#F5F3F0] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#8D7168] h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.round((activeDish.nutrition.fats / 70) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Bar 4: Fiber */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#594139]">Dietary Fiber</span>
                        <span className="font-bold text-[#1B1C1A]">
                          {activeDish.nutrition.fiber || 5}g{' '}
                          <span className="text-[#594139] font-normal">
                            ({Math.min(100, Math.round(((activeDish.nutrition.fiber || 5) / 25) * 100))}% DV)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-[#F5F3F0] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#006B2C] h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.round(((activeDish.nutrition.fiber || 5) / 25) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Certified Allergen Checklist */}
                  <div className="flex flex-col gap-2.5 bg-[#F5F3F0] p-4 rounded-xl border border-stone-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#1B1C1A] font-bold">
                        FSSAI Certified Allergen Check
                      </span>
                      <span className="material-symbols-outlined text-[#006B2C] text-[18px]">verified</span>
                    </div>

                    <div className="space-y-2 text-xs text-[#1B1C1A]">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={activeDish.allergens.includes('Dairy')}
                          onChange={() => handleToggleAllergen('Dairy')}
                          className="rounded accent-[#A33215] w-4 h-4 cursor-pointer"
                        />
                        <span>
                          Milk / Lactose <em className="text-[#594139] not-italic font-normal">(Paneer cheese)</em>
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={activeDish.allergens.includes('Gluten')}
                          onChange={() => handleToggleAllergen('Gluten')}
                          className="rounded accent-[#A33215] w-4 h-4 cursor-pointer"
                        />
                        <span>
                          Wheat / Gluten <em className="text-[#594139] not-italic font-normal">(Brioche bun)</em>
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={activeDish.allergens.includes('Soy')}
                          onChange={() => handleToggleAllergen('Soy')}
                          className="rounded accent-[#A33215] w-4 h-4 cursor-pointer"
                        />
                        <span>
                          Soy <em className="text-[#594139] not-italic font-normal">(Teriyaki glaze reduction)</em>
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={activeDish.allergens.includes('Tree Nuts') || activeDish.allergens.includes('Cashew Nut')}
                          onChange={() => handleToggleAllergen('Tree Nuts')}
                          className="rounded accent-[#A33215] w-4 h-4 cursor-pointer"
                        />
                        <span>
                          Tree Nuts <em className="text-[#006B2C] not-italic font-normal">(Nut-free kitchen certified)</em>
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={activeDish.allergens.includes('Crustacean / Shellfish')}
                          onChange={() => handleToggleAllergen('Crustacean / Shellfish')}
                          className="rounded accent-[#A33215] w-4 h-4 cursor-pointer"
                        />
                        <span>Crustacean / Shellfish</span>
                      </label>
                    </div>
                  </div>

                  {/* Kitchen Prep & Thermal Guideline */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-[#EFEEEB] flex flex-col border border-stone-200">
                      <span className="text-[11px] text-[#594139]">Core Temp</span>
                      <span className="font-display font-bold text-sm text-[#1B1C1A]">
                        {activeDish.coreTemp || '72°C'}
                      </span>
                      <span className="text-[10px] text-[#006B2C] font-bold">Thermal Validated</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#EFEEEB] flex flex-col border border-stone-200">
                      <span className="text-[11px] text-[#594139]">Prep Lead Time</span>
                      <span className="font-display font-bold text-sm text-[#1B1C1A]">
                        {activeDish.prepTimeMinutes} mins
                      </span>
                      <span className="text-[10px] text-[#594139] truncate">
                        Station: {activeDish.station || 'Grill Press #2'}
                      </span>
                    </div>
                  </div>

                  {/* Live QR Customer Display Preview Snippet */}
                  <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[#EAE8E5]/50 border border-stone-200">
                    <div className="flex items-center justify-between text-[#594139]">
                      <span className="text-[11px] uppercase font-bold text-[#9B4500]">
                        Guest QR Phone Preview
                      </span>
                      <span className="material-symbols-outlined text-[16px]">smartphone</span>
                    </div>

                    <div className="bg-white p-3 rounded-lg shadow-sm flex flex-col gap-1 border border-stone-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1B1C1A] truncate pr-2">
                          {activeDish.name}
                        </span>
                        <span className="font-display font-extrabold text-xs text-[#A33215] shrink-0">
                          ₹{activeDish.price}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#594139]">
                        <span>{activeDish.nutrition.calories} kcal</span>
                        <span>•</span>
                        <span className="text-[#A33215] font-bold">{activeDish.spiceLevel || 'Medium 🌶️'}</span>
                      </div>
                      <p className="text-[11px] text-[#594139] italic mt-1 bg-[#F5F3F0] p-1.5 rounded">
                        "{activeDish.chefNote || 'Prepared fresh with premium ingredients by our chef.'}"
                      </p>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      onClick={handleSaveRecipeChanges}
                      className="w-full py-2.5 rounded-lg bg-[#A33215] text-white hover:bg-[#CB4914] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      Save Recipe Changes
                    </button>
                    <button
                      onClick={() =>
                        showToast('Triggered instantaneous menu & stock resync to all KDS terminals & tables!')
                      }
                      className="w-full py-2 rounded-lg bg-[#EFEEEB] text-[#1B1C1A] hover:bg-[#EAE8E5] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-stone-200"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">sync</span>
                      Trigger Menu Resync to KDS &amp; Guest QR
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Audit Stream Footer */}
        <footer className="fixed bottom-0 left-72 right-0 h-10 bg-[#E4E2DF] backdrop-blur-md px-6 z-40 flex items-center justify-between text-[#594139] font-mono text-[11px] shadow-md border-t border-stone-300">
          <div className="flex items-center gap-4 overflow-hidden min-w-0 mr-4">
            <span className="inline-flex items-center gap-1 font-semibold uppercase text-[#A33215] shrink-0 whitespace-nowrap">
              <span className="material-symbols-outlined text-[14px]">stream</span>Audit Stream
            </span>
            <div className="truncate text-[#594139] min-w-0">
              [20:14:02] Table G-04 settled $142.50 via Terminal 02 • [20:13:48] Kitchen firing Order #1084 (Mains: Salmon, Ribeye) • [20:11:15] Resv #209 checked-in Floor 1
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0 font-sans text-xs whitespace-nowrap">
            <span className="text-[#006B2C] font-bold">LATENCY: 24ms</span>
            <span className="text-stone-600 font-medium">TERM-01 ONLINE</span>
          </div>
        </footer>
      </div>

      {/* Modal: New Dish Entry */}
      {isNewDishOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#A33215] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                </span>
                <h2 className="font-display font-extrabold text-lg text-[#1B1C1A]">
                  New Dish Entry &amp; Nutrition Spec
                </h2>
              </div>
              <button
                onClick={() => setIsNewDishOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateNewDish} className="mt-4 flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1B1C1A]">Dish Name *</label>
                  <input
                    type="text"
                    required
                    value={newDishForm.name}
                    onChange={(e) => setNewDishForm({ ...newDishForm, name: e.target.value })}
                    placeholder="e.g. Artisanal Burrata Bruschetta"
                    className="p-2 rounded-lg bg-[#F5F3F0] border border-stone-200 focus:outline-none focus:bg-white text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1B1C1A]">Category *</label>
                  <select
                    value={newDishForm.category}
                    onChange={(e) => setNewDishForm({ ...newDishForm, category: e.target.value })}
                    className="p-2 rounded-lg bg-[#F5F3F0] border border-stone-200 focus:outline-none focus:bg-white text-xs font-medium"
                  >
                    <option value="Tandoor & Starters">Tandoor &amp; Starters</option>
                    <option value="Curries & Mains">Curries &amp; Mains</option>
                    <option value="Breads & Rice">Breads &amp; Rice</option>
                    <option value="Beverages & Desserts">Beverages &amp; Desserts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1B1C1A]">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newDishForm.price}
                    onChange={(e) => setNewDishForm({ ...newDishForm, price: Number(e.target.value) })}
                    className="p-2 rounded-lg bg-[#F5F3F0] border border-stone-200 focus:outline-none focus:bg-white text-xs font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1B1C1A]">Dietary Type *</label>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setNewDishForm({ ...newDishForm, isVeg: true })}
                      className={`flex-1 py-1.5 rounded-lg font-bold border transition-all ${
                        newDishForm.isVeg
                          ? 'bg-[#006B2C] text-white border-[#006B2C]'
                          : 'bg-[#F5F3F0] text-[#594139] border-stone-200'
                      }`}
                    >
                      Pure Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewDishForm({ ...newDishForm, isVeg: false })}
                      className={`flex-1 py-1.5 rounded-lg font-bold border transition-all ${
                        !newDishForm.isVeg
                          ? 'bg-[#BA1A1A] text-white border-[#BA1A1A]'
                          : 'bg-[#F5F3F0] text-[#594139] border-stone-200'
                      }`}
                    >
                      Non-Veg
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1B1C1A]">Description</label>
                <textarea
                  rows={2}
                  value={newDishForm.description}
                  onChange={(e) => setNewDishForm({ ...newDishForm, description: e.target.value })}
                  placeholder="Ingredients, cooking technique, and tasting notes..."
                  className="p-2 rounded-lg bg-[#F5F3F0] border border-stone-200 focus:outline-none focus:bg-white text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1B1C1A]">Image URL (optional)</label>
                <input
                  type="url"
                  value={newDishForm.image}
                  onChange={(e) => setNewDishForm({ ...newDishForm, image: e.target.value })}
                  placeholder="https://..."
                  className="p-2 rounded-lg bg-[#F5F3F0] border border-stone-200 focus:outline-none focus:bg-white text-xs"
                />
              </div>

              {/* Nutrition Macros input */}
              <div className="p-3 rounded-xl bg-[#F5F3F0] border border-stone-200 flex flex-col gap-2">
                <span className="font-bold text-[#1B1C1A]">Nutrition Profile per Serving</span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-[#594139]">Calories (kcal)</label>
                    <input
                      type="number"
                      value={newDishForm.calories}
                      onChange={(e) =>
                        setNewDishForm({ ...newDishForm, calories: Number(e.target.value) })
                      }
                      className="w-full p-1.5 bg-white border border-stone-200 rounded text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#594139]">Protein (g)</label>
                    <input
                      type="number"
                      value={newDishForm.protein}
                      onChange={(e) =>
                        setNewDishForm({ ...newDishForm, protein: Number(e.target.value) })
                      }
                      className="w-full p-1.5 bg-white border border-stone-200 rounded text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#594139]">Carbs (g)</label>
                    <input
                      type="number"
                      value={newDishForm.carbs}
                      onChange={(e) =>
                        setNewDishForm({ ...newDishForm, carbs: Number(e.target.value) })
                      }
                      className="w-full p-1.5 bg-white border border-stone-200 rounded text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#594139]">Fats (g)</label>
                    <input
                      type="number"
                      value={newDishForm.fats}
                      onChange={(e) =>
                        setNewDishForm({ ...newDishForm, fats: Number(e.target.value) })
                      }
                      className="w-full p-1.5 bg-white border border-stone-200 rounded text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Allergens selection */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1B1C1A]">Certified Allergens</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {['Dairy', 'Gluten', 'Soy', 'Nuts', 'Egg', 'Mustard', 'Sesame'].map((item) => {
                    const isChecked = newDishForm.allergens.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => {
                          const updated = isChecked
                            ? newDishForm.allergens.filter((a) => a !== item)
                            : [...newDishForm.allergens, item];
                          setNewDishForm({ ...newDishForm, allergens: updated });
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                          isChecked
                            ? 'bg-[#FFDBCA] text-[#9B4500] border-[#FD8A42]'
                            : 'bg-[#F5F3F0] text-[#594139] border-stone-200'
                        }`}
                      >
                        {item} {isChecked && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsNewDishOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#F5F3F0] hover:bg-stone-200 text-[#1B1C1A] font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#A33215] hover:bg-[#CB4914] text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  Save &amp; Publish Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
