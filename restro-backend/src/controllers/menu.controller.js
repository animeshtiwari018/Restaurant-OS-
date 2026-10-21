import { MenuCategory } from '../models/MenuCategory.js';
import MenuItem from '../models/MenuItem.js';

export const createCategory = async (req, res) => {
    try {
        const { restaurant_id, name, description, sort_order } = req.body;

        if (!restaurant_id || !name) {
            return res.status(400).json({
                success: false,
                message: 'restaurant_id and name are required',
            });
        }

        const category = await MenuCategory.create({
            restaurant_id,
            name,
            description,
            sort_order,
        });

        return res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getCategories = async (req, res) => {
    try {
        const { restaurant_id } = req.query;
        const filter = restaurant_id ? { restaurant_id } : {};

        const categories = await MenuCategory.find(filter).sort({ sort_order: 1 });

        return res.status(200).json({
            success: true,
            count: categories.length,
            data: categories,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const createMenuItem = async (req, res) => {
    try {
        let {
            restaurant_id,
            category_id,
            name,
            description,
            price_paise,
            price,
            image_urls,
            image_url,
            ingredients,
            allergens,
            nutrition,
            dietary_labels,
            customization_options,
            preparation_time_minutes,
            is_available,
            sort_order,
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Dish name is required',
            });
        }

        // Auto-resolve restaurant_id
        if (!restaurant_id) {
            restaurant_id = '650000000000000000000001';
        }

        // Auto-resolve price_paise
        if (price_paise === undefined || price_paise === null || price_paise === '') {
            if (price !== undefined && price !== null) {
                price_paise = Math.round(Number(price) * 100);
            } else {
                price_paise = 25000;
            }
        } else {
            price_paise = Number(price_paise);
        }

        // Auto-resolve category_id
        if (!category_id) {
            const firstCat = await MenuCategory.findOne({ restaurant_id });
            if (firstCat) {
                category_id = firstCat._id;
            } else {
                const newCat = await MenuCategory.create({
                    restaurant_id,
                    name: 'Starters & Small Plates',
                    sort_order: 1,
                });
                category_id = newCat._id;
            }
        } else if (typeof category_id === 'string' && category_id.length !== 24) {
            // Category name passed instead of ObjectId
            let cat = await MenuCategory.findOne({ name: new RegExp(`^${category_id}$`, 'i') });
            if (!cat) {
                cat = await MenuCategory.create({
                    restaurant_id,
                    name: category_id,
                    sort_order: 10,
                });
            }
            category_id = cat._id;
        }

        if (image_url && (!image_urls || image_urls.length === 0)) {
            image_urls = [image_url];
        }

        const itemNutrition = nutrition || { calories: 0, protein: 0, fat: 0, carbs: 0 };
        const itemIngredients = ingredients || [];
        const itemAllergens = allergens || [];
        const itemDietaryLabels = dietary_labels || [];

        const item = await MenuItem.create({
            restaurant_id,
            category_id,
            name,
            description,
            price_paise,
            image_urls,
            ingredients: itemIngredients,
            allergens: itemAllergens,
            nutrition: itemNutrition,
            dietary_labels: itemDietaryLabels,
            customization_options,
            preparation_time_minutes,
            is_available,
            sort_order,
        });

        return res.status(201).json({
            success: true,
            message: 'Menu item created successfully',
            data: item,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMenuItems = async (req, res) => {
    try {
        const { restaurant_id, category_id } = req.query;
        const filter = {};

        if (restaurant_id) {
            filter.restaurant_id = restaurant_id;
        }

        if (category_id) {
            filter.category_id = category_id;
        }

        const items = await MenuItem.find(filter)
            .populate('category_id', 'name sort_order')
            .sort({ sort_order: 1 });

        return res.status(200).json({
            success: true,
            count: items.length,
            data: items,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updated = await MenuItem.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Menu item updated successfully',
            data: updated,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

