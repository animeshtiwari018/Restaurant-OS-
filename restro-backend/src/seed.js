import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from './db/index.js';
import { MenuCategory } from './models/MenuCategory.js';
import { MenuItem } from './models/MenuItem.js';
import { Table } from './models/Table.js';

async function seedData() {
    try {
        await connectDB();
        console.log('🌱 Seeding Restro Manage database with authoritative menu...');

        const dummyRestaurantId = new mongoose.Types.ObjectId('650000000000000000000001');

        // Clear existing menu and tables
        await MenuItem.deleteMany({});
        await MenuCategory.deleteMany({});
        await Table.deleteMany({});

        // 1. Create Tables
        const tables = await Table.insertMany([
            { table_number: 'T-01', capacity: 2, floor: 'Ground Floor' },
            { table_number: 'T-02', capacity: 4, floor: 'Ground Floor' },
            { table_number: 'T-03', capacity: 4, floor: 'Ground Floor' },
            { table_number: 'T-04', capacity: 6, floor: 'Balcony' },
            { table_number: 'T-05', capacity: 8, floor: 'Rooftop Lounge' }
        ]);
        console.log(`✅ Created ${tables.length} physical tables.`);

        // 2. Create Categories matching exact JSON
        const startersCat = await MenuCategory.create({
            restaurant_id: dummyRestaurantId,
            name: 'Starters & Small Plates',
            description: 'Tandoori sizzlers & crisp small plates',
            sort_order: 1
        });

        const mainsCat = await MenuCategory.create({
            restaurant_id: dummyRestaurantId,
            name: 'Mains (Curries & Specialties)',
            description: 'Slow-cooked rich gravies & curries',
            sort_order: 2
        });

        const breadsCat = await MenuCategory.create({
            restaurant_id: dummyRestaurantId,
            name: 'Tandoor & Breads',
            description: 'Clay-oven baked naans & rotis',
            sort_order: 3
        });

        const beveragesCat = await MenuCategory.create({
            restaurant_id: dummyRestaurantId,
            name: 'Beverages & Coolers',
            description: 'Traditional spiced coolers & refreshes',
            sort_order: 4
        });

        const dessertsCat = await MenuCategory.create({
            restaurant_id: dummyRestaurantId,
            name: 'Desserts',
            description: 'Artisanal traditional sweets & delicacies',
            sort_order: 5
        });

        // 3. Create Dishes with exact data from authoritative JSON
        const dishes = [
            // Starters & Small Plates
            {
                restaurant_id: dummyRestaurantId,
                category_id: startersCat._id,
                name: 'Paneer Tikka (Tandoori Classic)',
                description: 'Char-grilled cubes of malai paneer marinated in hung spiced curd, mustard oil, and roasted besan.',
                price_paise: 32000,
                is_available: true,
                preparation_time_minutes: 15,
                dietary_labels: ['VEG'],
                allergens: ['Dairy'],
                ingredients: ['Malai Paneer', 'Hung Curd', 'Roasted Chickpea Flour', 'Mustard Oil', 'Lemon Juice', 'Garam Masala'],
                customization_options: ['Low Spice', 'Extra Lemon', 'Crisp Tandoor'],
                nutrition: {
                    calories: 320,
                    protein: 18.0,
                    carbs: 12.0,
                    fat: 22.0
                },
                image_urls: ['https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80']
            },
            {
                restaurant_id: dummyRestaurantId,
                category_id: startersCat._id,
                name: 'Dahi Ke Kebab',
                description: 'Crisp golden patties made with hung Greek-style yogurt, soft cottage cheese, and roasted cumin.',
                price_paise: 29000,
                is_available: true,
                preparation_time_minutes: 12,
                dietary_labels: ['VEG'],
                allergens: ['Dairy', 'Gluten'],
                ingredients: ['Hung Curd', 'Paneer', 'Green Chilies', 'Fresh Coriander', 'Roasted Cumin', 'Breadcrumbs'],
                customization_options: ['Crisp Golden', 'No Garlic'],
                nutrition: {
                    calories: 285,
                    protein: 11.0,
                    carbs: 19.0,
                    fat: 17.0
                },
                image_urls: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80']
            },
            // Mains (Curries & Specialties)
            {
                restaurant_id: dummyRestaurantId,
                category_id: mainsCat._id,
                name: 'Paneer Butter Masala Special',
                description: 'Fresh malai paneer simmered in a slow-cooked tomato, table butter, and cashew nut reduction.',
                price_paise: 34000,
                is_available: true,
                preparation_time_minutes: 18,
                dietary_labels: ['VEG'],
                allergens: ['Dairy', 'Tree Nuts'],
                ingredients: ['Malai Paneer', 'Tomato Puree', 'Cashew Paste', 'Table Butter', 'Dairy Cream', 'Kasuri Methi'],
                customization_options: ['Less Butter / Light Oil', 'Mild / Low Spice', 'Extra Gravy', 'No Onion & Garlic'],
                nutrition: {
                    calories: 440,
                    protein: 18.2,
                    carbs: 21.8,
                    fat: 30.4
                },
                image_urls: ['https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80']
            },
            {
                restaurant_id: dummyRestaurantId,
                category_id: mainsCat._id,
                name: 'Dal Makhani Bukhara',
                description: 'Slow-simmered whole black lentils cooked overnight with tomatoes, butter, and mild spices.',
                price_paise: 28000,
                is_available: true,
                preparation_time_minutes: 12,
                dietary_labels: ['VEG'],
                allergens: ['Dairy'],
                ingredients: ['Whole Black Urad', 'Rajma', 'Tomato Reduction', 'Table Butter', 'Dairy Cream', 'Degi Mirch'],
                customization_options: ['Light Cream', 'Spicy Tadka', 'Extra Butter Float'],
                nutrition: {
                    calories: 360,
                    protein: 14.5,
                    carbs: 38.0,
                    fat: 16.8
                },
                image_urls: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80']
            },
            {
                restaurant_id: dummyRestaurantId,
                category_id: mainsCat._id,
                name: 'Murgh Dum Biryani',
                description: 'Aged long-grain basmati rice cooked with tender chicken cuts, browned shallots, and saffron.',
                price_paise: 41000,
                is_available: true,
                preparation_time_minutes: 20,
                dietary_labels: ['NON_VEG'],
                allergens: ['Dairy'],
                ingredients: ['Basmati Rice', 'Chicken Cuts', 'Browned Onions', 'Mint', 'Coriander', 'Cardamom', 'Desi Ghee', 'Saffron Milk'],
                customization_options: ['Extra Raita', 'Spicy Gravy', 'Less Desi Ghee'],
                nutrition: {
                    calories: 560,
                    protein: 32.0,
                    carbs: 64.0,
                    fat: 18.5
                },
                image_urls: ['https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80']
            },
            // Tandoor & Breads
            {
                restaurant_id: dummyRestaurantId,
                category_id: breadsCat._id,
                name: 'Garlic Butter Naan',
                description: 'Classic leavened flatbread topped with minced roasted garlic, fresh cilantro, and salted butter.',
                price_paise: 7500,
                is_available: true,
                preparation_time_minutes: 6,
                dietary_labels: ['VEG'],
                allergens: ['Gluten', 'Dairy'],
                ingredients: ['Refined Wheat Flour', 'Milk', 'Minced Fresh Garlic', 'Table Butter', 'Fresh Coriander', 'Yeast'],
                customization_options: ['Crisp Well-Done', 'Less Butter', 'Garlic Free'],
                nutrition: {
                    calories: 210,
                    protein: 5.5,
                    carbs: 34.0,
                    fat: 6.2
                },
                image_urls: ['https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80']
            },
            {
                restaurant_id: dummyRestaurantId,
                category_id: breadsCat._id,
                name: 'Tandoori Roti (Whole Wheat)',
                description: 'Traditional unleavened flatbread baked in a clay tandoor using stone-ground chakki wheat.',
                price_paise: 3500,
                is_available: true,
                preparation_time_minutes: 5,
                dietary_labels: ['VEG', 'VEGAN'],
                allergens: ['Gluten'],
                ingredients: ['Whole Wheat Flour', 'Water', 'Sea Salt'],
                customization_options: ['Plain / No Butter', 'Butter Glazed', 'Crisp Tandoor'],
                nutrition: {
                    calories: 120,
                    protein: 3.8,
                    carbs: 25.0,
                    fat: 0.8
                },
                image_urls: ['https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80']
            },
            // Beverages & Coolers
            {
                restaurant_id: dummyRestaurantId,
                category_id: beveragesCat._id,
                name: 'Masala Chaas',
                description: 'Traditional churned yogurt spiced with roasted cumin, rock salt, fresh ginger, and mint.',
                price_paise: 5500,
                is_available: true,
                preparation_time_minutes: 4,
                dietary_labels: ['VEG'],
                allergens: ['Dairy'],
                ingredients: ['Fresh Curd', 'Chilled Water', 'Roasted Cumin', 'Rock Salt', 'Ginger Extract', 'Fresh Mint'],
                customization_options: ['No Green Chili', 'Extra Cumin', 'Extra Chilled Ice'],
                nutrition: {
                    calories: 62,
                    protein: 3.1,
                    carbs: 4.8,
                    fat: 3.2
                },
                image_urls: ['https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=600&auto=format&fit=crop&q=80']
            },
            // Desserts
            {
                restaurant_id: dummyRestaurantId,
                category_id: dessertsCat._id,
                name: 'Gulab Jamun with Rabri',
                description: 'Soft fried milk dough dumplings soaked in cardamom syrup, served over slow-cooked reduced milk.',
                price_paise: 14000,
                is_available: true,
                preparation_time_minutes: 5,
                dietary_labels: ['VEG'],
                allergens: ['Dairy', 'Tree Nuts'],
                ingredients: ['Milk Solids (Khoya)', 'Paneer', 'Cardamom Sugar Syrup', 'Rabri', 'Pistachio Slivers', 'Almonds', 'Saffron'],
                customization_options: ['Served Warm', 'Rabri on Side', 'Nut Free Garnish'],
                nutrition: {
                    calories: 380,
                    protein: 7.2,
                    carbs: 52.0,
                    fat: 16.0
                },
                image_urls: ['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80']
            }
        ];

        await MenuItem.insertMany(dishes);
        console.log(`✅ Seeded ${dishes.length} menu items from authoritative JSON.`);

        console.log('🎉 Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seedData();
