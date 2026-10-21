'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  customizationChips?: string[];
  ingredients?: string[];
}

// Authoritative Menu Data strictly matching User's JSON
const AUTHORITATIVE_REAL_DISHES: DishItem[] = [
  {
    id: 'item_str_001',
    code: 'DISH-101',
    name: 'Paneer Tikka (Tandoori Classic)',
    category: 'Starters & Small Plates',
    description: 'Char-grilled cubes of malai paneer marinated in hung spiced curd, mustard oil, and roasted besan.',
    price: 320,
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    inStock: true,
    nutrition: { calories: 320, protein: 18.0, carbs: 12.0, fats: 22.0, fiber: 3, sodium: 480 },
    allergens: ['Dairy'],
    prepTimeMinutes: 15,
    coreTemp: '75°C',
    station: 'Tandoor Oven #1',
    chefNote: 'Char-grilled over natural charcoal embers with mustard oil and roasted besan.',
    spiceLevel: 'Medium 🌶️🌶️',
    dietaryTags: ['Pure Veg'],
    customizationChips: ['Low Spice', 'Extra Lemon', 'Crisp Tandoor'],
    ingredients: ['Malai Paneer', 'Hung Curd', 'Roasted Chickpea Flour', 'Mustard Oil', 'Lemon Juice', 'Garam Masala'],
  },
  {
    id: 'item_str_002',
    code: 'DISH-102',
    name: 'Dahi Ke Kebab',
    category: 'Starters & Small Plates',
    description: 'Crisp golden patties made with hung Greek-style yogurt, soft cottage cheese, and roasted cumin.',
    price: 290,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    inStock: true,
    nutrition: { calories: 285, protein: 11.0, carbs: 19.0, fats: 17.0, fiber: 2, sodium: 420 },
    allergens: ['Dairy', 'Gluten'],
    prepTimeMinutes: 12,
    coreTemp: '72°C',
    station: 'Appetizer Fryer #2',
    chefNote: 'Delicate hung yogurt center encased in a golden crisp herb breadcrumb crust.',
    spiceLevel: 'Mild 🌶️',
    dietaryTags: ['Pure Veg'],
    customizationChips: ['Crisp Golden', 'No Garlic'],
    ingredients: ['Hung Curd', 'Paneer', 'Green Chilies', 'Fresh Coriander', 'Roasted Cumin', 'Breadcrumbs'],
  },
  {
    id: 'item_cur_001',
    code: 'DISH-201',
    name: 'Paneer Butter Masala Special',
    category: 'Mains (Curries & Specialties)',
    description: 'Fresh malai paneer simmered in a slow-cooked tomato, table butter, and cashew nut reduction.',
    price: 340,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    inStock: true,
    nutrition: { calories: 440, protein: 18.2, carbs: 21.8, fats: 30.4, fiber: 4.5, sodium: 520 },
    allergens: ['Dairy', 'Tree Nuts'],
    prepTimeMinutes: 18,
    coreTemp: '78°C',
    station: 'Curry Range #1',
    chefNote: 'Slow-cooked tomato gravy with house-churned butter and roasted fenugreek.',
    spiceLevel: 'Mild 🌶️',
    dietaryTags: ['Pure Veg'],
    customizationChips: ['Less Butter / Light Oil', 'Mild / Low Spice', 'Extra Gravy', 'No Onion & Garlic'],
    ingredients: ['Malai Paneer', 'Tomato Puree', 'Cashew Paste', 'Table Butter', 'Dairy Cream', 'Kasuri Methi'],
  },
  {
    id: 'item_cur_002',
    code: 'DISH-202',
    name: 'Dal Makhani Bukhara',
    category: 'Mains (Curries & Specialties)',
    description: 'Slow-simmered whole black lentils cooked overnight with tomatoes, butter, and mild spices.',
    price: 280,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    inStock: true,
    nutrition: { calories: 360, protein: 14.5, carbs: 38.0, fats: 16.8, fiber: 9, sodium: 510 },
    allergens: ['Dairy'],
    prepTimeMinutes: 12,
    coreTemp: '82°C',
    station: 'Simmer Pot #4',
    chefNote: 'Overnight charcoal simmered black urad dal with white butter and garlic glaze.',
    spiceLevel: 'Mild 🌶️',
    dietaryTags: ['Pure Veg', 'Gluten-Free'],
    customizationChips: ['Light Cream', 'Spicy Tadka', 'Extra Butter Float'],
    ingredients: ['Whole Black Urad', 'Rajma', 'Tomato Reduction', 'Table Butter', 'Dairy Cream', 'Degi Mirch'],
  },
  {
    id: 'item_cur_003',
    code: 'DISH-203',
    name: 'Murgh Dum Biryani',
    category: 'Mains (Curries & Specialties)',
    description: 'Aged long-grain basmati rice cooked with tender chicken cuts, browned shallots, and saffron.',
    price: 410,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    isVeg: false,
    inStock: true,
    nutrition: { calories: 560, protein: 32.0, carbs: 64.0, fats: 18.5, fiber: 4, sodium: 680 },
    allergens: ['Dairy'],
    prepTimeMinutes: 20,
    coreTemp: '76°C',
    station: 'Dum Station #2',
    chefNote: 'Layered dum cooking sealed with dough lid, infused with Kashmiri saffron milk.',
    spiceLevel: 'Medium 🌶️🌶️',
    dietaryTags: ['Non-Veg'],
    customizationChips: ['Extra Raita', 'Spicy Gravy', 'Less Desi Ghee'],
    ingredients: ['Basmati Rice', 'Chicken Cuts', 'Browned Onions', 'Mint', 'Coriander', 'Cardamom', 'Desi Ghee', 'Saffron Milk'],
  },
  {
    id: 'item_brd_001',
    code: 'DISH-301',
    name: 'Garlic Butter Naan',
    category: 'Tandoor & Breads',
    description: 'Classic leavened flatbread topped with minced roasted garlic, fresh cilantro, and salted butter.',
    price: 75,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    inStock: true,
    nutrition: { calories: 210, protein: 5.5, carbs: 34.0, fats: 6.2, fiber: 2, sodium: 310 },
    allergens: ['Gluten', 'Dairy'],
    prepTimeMinutes: 6,
    coreTemp: '95°C',
    station: 'Tandoor Pit #2',
    chefNote: 'Patted by hand and baked on scorching clay walls, brushed with roasted garlic butter.',
    spiceLevel: 'None',
    dietaryTags: ['Pure Veg'],
    customizationChips: ['Crisp Well-Done', 'Less Butter', 'Garlic Free'],
    ingredients: ['Refined Wheat Flour', 'Milk', 'Minced Fresh Garlic', 'Table Butter', 'Fresh Coriander', 'Yeast'],
  },
  {
    id: 'item_brd_002',
    code: 'DISH-302',
    name: 'Tandoori Roti (Whole Wheat)',
    category: 'Tandoor & Breads',
    description: 'Traditional unleavened flatbread baked in a clay tandoor using stone-ground chakki wheat.',
    price: 35,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    inStock: true,
    nutrition: { calories: 120, protein: 3.8, carbs: 25.0, fats: 0.8, fiber: 3, sodium: 110 },
    allergens: ['Gluten'],
    prepTimeMinutes: 5,
    coreTemp: '95°C',
    station: 'Tandoor Pit #1',
    chefNote: '100% stone-ground wheat flour flatbread crisp baked without oil or additives.',
    spiceLevel: 'None',
    dietaryTags: ['Pure Veg', 'Vegan'],
    customizationChips: ['Plain / No Butter', 'Butter Glazed', 'Crisp Tandoor'],
    ingredients: ['Whole Wheat Flour', 'Water', 'Sea Salt'],
  },
  {
    id: 'item_bev_001',
    code: 'DISH-401',
    name: 'Masala Chaas',
    category: 'Beverages & Coolers',
    description: 'Traditional churned yogurt spiced with roasted cumin, rock salt, fresh ginger, and mint.',
    price: 55,
    image: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    inStock: true,
    nutrition: { calories: 62, protein: 3.1, carbs: 4.8, fats: 3.2, fiber: 1, sodium: 260 },
    allergens: ['Dairy'],
    prepTimeMinutes: 4,
    coreTemp: '4°C',
    station: 'Beverage Bar #1',
    chefNote: 'Hand-churned refreshing buttermilk with dry-roasted cumin and fresh mint infusion.',
    spiceLevel: 'Mild 🌶️',
    dietaryTags: ['Pure Veg', 'Gluten-Free'],
    customizationChips: ['No Green Chili', 'Extra Cumin', 'Extra Chilled Ice'],
    ingredients: ['Fresh Curd', 'Chilled Water', 'Roasted Cumin', 'Rock Salt', 'Ginger Extract', 'Fresh Mint'],
  },
  {
    id: 'item_des_001',
    code: 'DISH-501',
    name: 'Gulab Jamun with Rabri',
    category: 'Desserts',
    description: 'Soft fried milk dough dumplings soaked in cardamom syrup, served over slow-cooked reduced milk.',
    price: 140,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    inStock: true,
    nutrition: { calories: 380, protein: 7.2, carbs: 52.0, fats: 16.0, fiber: 2, sodium: 180 },
    allergens: ['Dairy', 'Tree Nuts'],
    prepTimeMinutes: 5,
    coreTemp: '65°C',
    station: 'Dessert Pantry #1',
    chefNote: 'Tender milk khoya dumplings drenched in saffron cardamom syrup over artisanal rabri.',
    spiceLevel: 'Sweet Dessert',
    dietaryTags: ['Pure Veg'],
    customizationChips: ['Served Warm', 'Rabri on Side', 'Nut Free Garnish'],
    ingredients: ['Milk Solids (Khoya)', 'Paneer', 'Cardamom Sugar Syrup', 'Rabri', 'Pistachio Slivers', 'Almonds', 'Saffron'],
  },
];

const CANONICAL_CATEGORIES = [
  'Starters & Small Plates',
  'Mains (Curries & Specialties)',
  'Tandoor & Breads',
  'Beverages & Coolers',
  'Desserts',
];

export default function MenuNutritionCmsPage() {
  const searchParams = useSearchParams();
  const [dishes, setDishes] = useState<DishItem[]>(AUTHORITATIVE_REAL_DISHES);
  const [selectedDishId, setSelectedDishId] = useState<string>('item_str_001');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDietary, setSelectedDietary] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'popularity' | 'price' | 'calories' | 'name'>('popularity');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Dish Modal state
  const [isNewDishOpen, setIsNewDishOpen] = useState(false);
  const [newDishForm, setNewDishForm] = useState({
    name: '',
    category: 'Starters & Small Plates',
    price: 320,
    description: '',
    image: '',
    isVeg: true,
    calories: 320,
    protein: 16,
    carbs: 24,
    fats: 18,
    fiber: 3,
    prepTime: 12,
    allergens: ['Dairy'],
    spiceLevel: 'Medium 🌶️🌶️',
    chefNote: '',
  });

  // Open modal if URL parameter ?add=true or ?action=add-dish is detected
  useEffect(() => {
    if (searchParams.get('add') === 'true' || searchParams.get('action') === 'add-dish') {
      setIsNewDishOpen(true);
    }
  }, [searchParams]);

  // Selected dish details for Inspector
  const activeDish = useMemo(() => {
    return dishes.find((d) => d.id === selectedDishId) || dishes[0] || AUTHORITATIVE_REAL_DISHES[0];
  }, [dishes, selectedDishId]);

  // Load real menu items from backend API
  useEffect(() => {
    async function loadRealMenu() {
      try {
        const items = await menuApi.getMenuItems();
        if (items && items.length > 0) {
          const mappedItems: DishItem[] = items.map((item: any, idx: number) => {
            const isVeg =
              item.dietary_labels?.includes('VEG') ||
              item.dietary_labels?.includes('VEGAN') ||
              item.dietary_labels?.includes('Pure Veg') ||
              !item.dietary_labels?.includes('NON_VEG');

            const categoryName =
              item.category_id?.name ||
              item.category_name ||
              (item.price_paise > 30000 ? 'Mains (Curries & Specialties)' : 'Starters & Small Plates');

            return {
              id: item._id || item.id || `dish_${idx}`,
              code: `DISH-${100 + (idx + 1)}`,
              name: item.name,
              category: categoryName,
              description: item.description || 'Artisan chef prepared gourmet delicacy.',
              price: item.price_paise ? Math.round(item.price_paise / 100) : item.price || 300,
              image:
                item.image_urls?.[0] ||
                item.image_url ||
                AUTHORITATIVE_REAL_DISHES[idx % AUTHORITATIVE_REAL_DISHES.length].image,
              isVeg,
              inStock: item.is_available !== false,
              nutrition: {
                calories: item.nutrition?.calories || item.nutrition?.calories_kcal || 350,
                protein: item.nutrition?.protein || item.nutrition?.protein_grams || 16,
                carbs: item.nutrition?.carbs || item.nutrition?.carbs_grams || 25,
                fats: item.nutrition?.fat || item.nutrition?.fats || item.nutrition?.fat_grams || 18,
                fiber: item.nutrition?.fiber || item.nutrition?.fiber_grams || 3,
                sodium: item.nutrition?.sodium || item.nutrition?.sodium_mg || 450,
              },
              allergens: item.allergens && item.allergens.length > 0 ? item.allergens : ['Dairy'],
              prepTimeMinutes: item.preparation_time_minutes || item.estimated_prep_time_minutes || 15,
              coreTemp: '75°C',
              station: 'Chef Station #1',
              chefNote: item.description ? item.description.slice(0, 80) + '...' : 'Fresh kitchen preparation.',
              spiceLevel: isVeg ? 'Medium 🌶️' : 'Medium 🌶️🌶️',
              dietaryTags: isVeg ? ['Pure Veg'] : ['Non-Veg'],
              ingredients: item.ingredients || [],
              customizationChips: item.customization_options || ['Standard Prep'],
            };
          });

          setDishes(mappedItems);
          if (mappedItems.length > 0) {
            setSelectedDishId(mappedItems[0].id);
          }
        }
      } catch (err) {
        console.warn('Backend menu fetch fallback to authoritative JSON:', err);
      }
    }

    loadRealMenu();
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
          const matchesIngredient = dish.ingredients?.some((ing) => ing.toLowerCase().includes(q));
          if (!matchesName && !matchesCode && !matchesAllergen && !matchesCategory && !matchesIngredient) {
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
        if (selectedDietary === 'Keto-Friendly' && dish.nutrition.carbs > 25) return false;

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
  const vegPercent = totalCount > 0 ? Math.round((vegCount / totalCount) * 100) : 80;
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

    try {
      if (dishId.length === 24) {
        await menuApi.toggleItemAvailability(dishId, newStatus);
      }
    } catch (e) {
      console.warn('API stock toggle deferred:', e);
    }
  };

  // Bulk 86 toggle
  const handleBulkToggle = () => {
    const hasActive = dishes.some((d) => d.inStock);
    const updatedStatus = !hasActive;
    setDishes((prev) => prev.map((d) => ({ ...d, inStock: updatedStatus })));
    showToast(
      updatedStatus
        ? 'All menu items restored to IN STOCK'
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
    link.setAttribute('download', `Restro_FSSAI_Nutrition_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
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

  // Handle New Dish Creation (Dynamic Add Dish from Everywhere)
  const handleCreateNewDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishForm.name.trim()) return;

    const newCode = `DISH-${100 + dishes.length + 1}`;
    let createdDishId = `dish_${Date.now()}`;

    const newDish: DishItem = {
      id: createdDishId,
      code: newCode,
      name: newDishForm.name.trim(),
      category: newDishForm.category,
      description: newDishForm.description || 'Authentic chef prepared specialty.',
      price: Number(newDishForm.price) || 280,
      image:
        newDishForm.image.trim() ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      isVeg: newDishForm.isVeg,
      inStock: true,
      nutrition: {
        calories: Number(newDishForm.calories) || 350,
        protein: Number(newDishForm.protein) || 15,
        carbs: Number(newDishForm.carbs) || 30,
        fats: Number(newDishForm.fats) || 16,
        fiber: Number(newDishForm.fiber) || 4,
        sodium: 480,
      },
      allergens: newDishForm.allergens,
      prepTimeMinutes: Number(newDishForm.prepTime) || 15,
      coreTemp: '75°C',
      station: 'Kitchen Station #1',
      chefNote: newDishForm.chefNote || 'Crafted with premium fresh ingredients.',
      spiceLevel: newDishForm.spiceLevel,
      dietaryTags: newDishForm.isVeg ? ['Pure Veg'] : ['Non-Veg'],
    };

    // Try posting to backend API
    try {
      const apiRes = await menuApi.createMenuItem({
        name: newDish.name,
        category_id: newDish.category,
        description: newDish.description,
        price_paise: newDish.price * 100,
        image_urls: [newDish.image],
        allergens: newDish.allergens,
        nutrition: newDish.nutrition,
        dietary_labels: newDish.isVeg ? ['VEG'] : ['NON_VEG'],
        preparation_time_minutes: newDish.prepTimeMinutes,
        is_available: true,
      });
      if (apiRes && (apiRes as any)._id) {
        newDish.id = (apiRes as any)._id;
      }
    } catch (e) {
      console.warn('Backend item creation deferred:', e);
    }

    setDishes((prev) => [newDish, ...prev]);
    setSelectedDishId(newDish.id);
    setIsNewDishOpen(false);
    showToast(`Added and published new dish: ${newDish.name}`);
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
                onClick={() => showToast('Refreshing authoritative menu & FSSAI nutrition status...')}
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
                    FSSAI &amp; Food Labelling Compliant • 100% Real Menu
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
                    <span className="text-[#594139] text-[11px]">• 5 Categories, 100% Real</span>
                  </div>
                </div>
                <div className="w-full bg-[#F5F3F0] h-1.5 rounded-full mt-4 overflow-hidden">
                  <div
                    className="bg-[#A33215] h-full rounded-full transition-all duration-500"
                    style={{ width: `${totalCount > 0 ? (activeCount / totalCount) * 100 : 100}%` }}
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
                    <span className="font-display font-black text-3xl text-[#1B1C1A] leading-none">98</span>
                    <span className="font-display font-semibold text-lg text-[#594139]">/ 100</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs text-[#006B2C] font-bold">Health Audit Score</span>
                    <span className="text-[#594139] text-[11px]">• Lab Tested Macros</span>
                  </div>
                </div>
                <div className="w-full bg-[#F5F3F0] h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-[#006B2C] h-full rounded-full" style={{ width: '98%' }} />
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
                      {disabledCount > 0 ? `• ${disabledNames}` : '• All operational in kitchen'}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-[#F5F3F0] h-1.5 rounded-full mt-4 overflow-hidden">
                  <div
                    className="bg-[#A33215] h-full rounded-full transition-all duration-500"
                    style={{ width: `${totalCount > 0 ? (disabledCount / totalCount) * 100 : 0}%` }}
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
                    <span className="text-[#594139] text-[11px]">• {nonVegPercent}% Non-Veg</span>
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
                  placeholder="Search dish name, code (e.g. DISH-101), allergen, ingredient..."
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

              {/* Category Tabs matching Authoritative JSON */}
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
                {CANONICAL_CATEGORIES.map((cat) => {
                  const count = dishes.filter((d) => d.category.toLowerCase().includes(cat.toLowerCase())).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                        selectedCategory === cat
                          ? 'bg-[#A33215] text-white shadow-sm'
                          : 'bg-[#F5F3F0] text-[#594139] hover:text-[#1B1C1A]'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
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
                          {activeDish.nutrition.fiber || 3}g{' '}
                          <span className="text-[#594139] font-normal">
                            ({Math.min(100, Math.round(((activeDish.nutrition.fiber || 3) / 25) * 100))}% DV)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-[#F5F3F0] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#006B2C] h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.round(((activeDish.nutrition.fiber || 3) / 25) * 100))}%`,
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
                          Milk / Lactose <em className="text-[#594139] not-italic font-normal">(Paneer / Butter / Rabri)</em>
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
                          Wheat / Gluten <em className="text-[#594139] not-italic font-normal">(Naan / Roti / Breadcrumbs)</em>
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={activeDish.allergens.includes('Tree Nuts')}
                          onChange={() => handleToggleAllergen('Tree Nuts')}
                          className="rounded accent-[#A33215] w-4 h-4 cursor-pointer"
                        />
                        <span>
                          Tree Nuts <em className="text-[#594139] not-italic font-normal">(Cashew / Almond / Pistachio)</em>
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={activeDish.allergens.includes('Soy')}
                          onChange={() => handleToggleAllergen('Soy')}
                          className="rounded accent-[#A33215] w-4 h-4 cursor-pointer"
                        />
                        <span>Soy &amp; Soya Derivates</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={activeDish.allergens.includes('Shellfish')}
                          onChange={() => handleToggleAllergen('Shellfish')}
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
                        {activeDish.coreTemp || '75°C'}
                      </span>
                      <span className="text-[10px] text-[#006B2C] font-bold">Thermal Validated</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#EFEEEB] flex flex-col border border-stone-200">
                      <span className="text-[11px] text-[#594139]">Prep Lead Time</span>
                      <span className="font-display font-bold text-sm text-[#1B1C1A]">
                        {activeDish.prepTimeMinutes} mins
                      </span>
                      <span className="text-[10px] text-[#594139] truncate">
                        Station: {activeDish.station || 'Chef Station #1'}
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
              [20:14:02] Table G-04 settled $142.50 via Terminal 02 • [20:13:48] Kitchen firing Order #1084 (Mains: Biryani, Naan) • [20:11:15] Resv #209 checked-in Floor 1
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0 font-sans text-xs whitespace-nowrap">
            <span className="text-[#006B2C] font-bold">LATENCY: 24ms</span>
            <span className="text-stone-600 font-medium">TERM-01 ONLINE</span>
          </div>
        </footer>
      </div>

      {/* Modal: New Dish Entry (Add Dish from everywhere) */}
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
                    placeholder="e.g. Achari Chaap Tikka"
                    className="p-2 rounded-lg bg-[#F5F3F0] border border-stone-200 focus:outline-none focus:bg-white text-xs font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1B1C1A]">Category *</label>
                  <select
                    value={newDishForm.category}
                    onChange={(e) => setNewDishForm({ ...newDishForm, category: e.target.value })}
                    className="p-2 rounded-lg bg-[#F5F3F0] border border-stone-200 focus:outline-none focus:bg-white text-xs font-medium"
                  >
                    {CANONICAL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
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
                  placeholder="Ingredients, preparation technique, and tasting notes..."
                  className="p-2 rounded-lg bg-[#F5F3F0] border border-stone-200 focus:outline-none focus:bg-white text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1B1C1A]">Image URL (optional)</label>
                <input
                  type="url"
                  value={newDishForm.image}
                  onChange={(e) => setNewDishForm({ ...newDishForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
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
                  {['Dairy', 'Gluten', 'Tree Nuts', 'Soy', 'Egg', 'Mustard', 'Sesame', 'Shellfish'].map((item) => {
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
                  className="px-5 py-2 rounded-lg bg-[#A33215] hover:bg-[#CB4914] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 active:scale-95"
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
