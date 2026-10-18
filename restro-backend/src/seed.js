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
        console.log('🌱 Seeding Restro Manage database...');

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

        // 2. Create Categories
        const startersCat = await MenuCategory.create({
            restaurant_id: dummyRestaurantId,
            name: 'Starters & Appetizers',
            description: 'Crispy sizzlers & tandoori delights',
            sort_order: 1
        });

        const mainsCat = await MenuCategory.create({
            restaurant_id: dummyRestaurantId,
            name: 'Main Course Specialties',
            description: 'Slow-cooked rich gravies & curries',
            sort_order: 2
        });

        const breadsCat = await MenuCategory.create({
            restaurant_id: dummyRestaurantId,
            name: 'Breads & Rice',
            description: 'Clay-oven baked naans & aromatic basmati rice',
            sort_order: 3
        });

        const beveragesCat = await MenuCategory.create({
            restaurant_id: dummyRestaurantId,
            name: 'Beverages & Mocktails',
            description: 'Handcrafted coolers & artisanal shakes',
            sort_order: 4
        });

        // 3. Create Dishes with Nutritional Accuracy
        const dishes = [
            {
                restaurant_id: dummyRestaurantId,
                category_id: startersCat._id,
                name: 'Tandoori Malai Paneer Tikka',
                description: 'Cottage cheese marinated in rich hung curd, green cardamom, and cashew paste, char-grilled in tandoor.',
                price_paise: 34000,
                image_urls: ['https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80'],
                ingredients: ['Fresh Paneer', 'Hung Curd', 'Cashew Cream', 'Green Cardamom', 'Bell Peppers'],
                allergens: ['Dairy', 'Nuts'],
                nutrition: { calories: 380, protein: 19, fat: 26, carbs: 14 },
                dietary_labels: ['VEG'],
                preparation_time_minutes: 15
            },
            {
                restaurant_id: dummyRestaurantId,
                category_id: startersCat._id,
                name: 'Smoked Garlic Butter Prawns',
                description: 'Jumbo coastal prawns tossed in browned garlic butter, crushed black pepper, and fresh parsley.',
                price_paise: 48000,
                image_urls: ['https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&auto=format&fit=crop&q=80'],
                ingredients: ['Tiger Prawns', 'Cultured Butter', 'Garlic', 'Crushed Pepper', 'Lemon'],
                allergens: ['Shellfish', 'Dairy'],
                nutrition: { calories: 290, protein: 28, fat: 16, carbs: 4 },
                dietary_labels: ['NON_VEG'],
                preparation_time_minutes: 12
            },
            {
                restaurant_id: dummyRestaurantId,
                category_id: mainsCat._id,
                name: 'Royal Dal Makhani (24h Simmered)',
                description: 'Whole black lentils slow-cooked overnight over charcoal embers, finished with white butter and fresh cream.',
                price_paise: 29000,
                image_urls: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'],
                ingredients: ['Black Urad Dal', 'Butter', 'Cream', 'San Marzano Tomato Puree', 'Fenugreek Leaves'],
                allergens: ['Dairy'],
                nutrition: { calories: 420, protein: 16, fat: 22, carbs: 38 },
                dietary_labels: ['VEG'],
                preparation_time_minutes: 10
            },
            {
                restaurant_id: dummyRestaurantId,
                category_id: mainsCat._id,
                name: 'Old Delhi Butter Chicken',
                description: 'Tandoor-smoked chicken tikka pieces in a velvety, satin tomato gravy scented with dried fenugreek.',
                price_paise: 42000,
                image_urls: ['https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80'],
                ingredients: ['Boneless Chicken', 'Cashew Paste', 'Butter', 'Cream', 'Kasuri Methi'],
                allergens: ['Dairy', 'Nuts'],
                nutrition: { calories: 510, protein: 34, fat: 31, carbs: 18 },
                dietary_labels: ['NON_VEG'],
                preparation_time_minutes: 18
            },
            {
                restaurant_id: dummyRestaurantId,
                category_id: mainsCat._id,
                name: 'Tofu & Edamame Green Curry (Vegan)',
                description: 'Pressed organic tofu cubes, sweet basil, edamame, and bamboo shoots in aromatic coconut cream broth.',
                price_paise: 38000,
                image_urls: ['https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&auto=format&fit=crop&q=80'],
                ingredients: ['Organic Tofu', 'Edamame', 'Coconut Milk', 'Thai Basil', 'Kaffir Lime'],
                allergens: ['Soy'],
                nutrition: { calories: 310, protein: 21, fat: 18, carbs: 16 },
                dietary_labels: ['VEGAN'],
                preparation_time_minutes: 15
            },
            {
                restaurant_id: dummyRestaurantId,
                category_id: breadsCat._id,
                name: 'Garlic Truffle Butter Naan',
                description: 'Refined flour leavened flatbread brushed with roasted garlic butter and white truffle oil.',
                price_paise: 9500,
                image_urls: ['https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80'],
                ingredients: ['Wheat Flour', 'Garlic', 'Truffle Oil', 'Butter', 'Coriander'],
                allergens: ['Gluten', 'Dairy'],
                nutrition: { calories: 240, protein: 6, fat: 9, carbs: 36 },
                dietary_labels: ['VEG'],
                preparation_time_minutes: 8
            },
            {
                restaurant_id: dummyRestaurantId,
                category_id: beveragesCat._id,
                name: 'Alphonso Mango & Saffron Lassi',
                description: 'Churned organic curd with Ratnagiri Alphonso mango pulp, Kashmiri saffron strands, and crushed pistachios.',
                price_paise: 18000,
                image_urls: ['https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=600&auto=format&fit=crop&q=80'],
                ingredients: ['Organic Curd', 'Alphonso Mango Pulp', 'Pistachios', 'Saffron', 'Raw Sugar'],
                allergens: ['Dairy', 'Nuts'],
                nutrition: { calories: 260, protein: 9, fat: 8, carbs: 38 },
                dietary_labels: ['VEG'],
                preparation_time_minutes: 5
            }
        ];

        await MenuItem.insertMany(dishes);
        console.log(`✅ Seeded ${dishes.length} menu items with accurate nutritional facts.`);

        console.log('🎉 Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seedData();
