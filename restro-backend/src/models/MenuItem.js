import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
    {
        restaurant_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true,
            index: true
        },
        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuCategory',
            required: true,
            index: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        price_paise: {
            type: Number,
            required: true,
            min: 0
        },
        image_urls: [{ type: String, trim: true }],
        ingredients: [{ type: String, trim: true }],
        allergens: [{ type: String, trim: true }],
        nutrition: {
            calories: { type: Number, default: 0 },
            protein: { type: Number, default: 0 },
            fat: { type: Number, default: 0 },
            carbs: { type: Number, default: 0 }
        },
        dietary_labels: [{ type: String, trim: true }],
        customization_options: { type: mongoose.Schema.Types.Mixed },
        preparation_time_minutes: { type: Number, default: 15 },
        is_available: {
            type: Boolean,
            default: true
        },
        sort_order: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;