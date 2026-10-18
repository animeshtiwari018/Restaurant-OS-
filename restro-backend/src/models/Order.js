import mongoose from 'mongoose';
import { ORDER_STATUS } from '../constants.js';

const orderItemSnapshotSchema = new mongoose.Schema(
    {
        menu_item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuItem',
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        unit_price_paise: {
            type: Number,
            required: true,
            min: 0
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1']
        },
        subtotal_paise: {
            type: Number,
            required: true,
            min: 0
        },
        special_instructions: {
            type: String,
            trim: true,
            default: ''
        }
    },
    { _id: true }
);

const orderSchema = new mongoose.Schema(
    {
        table_session_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TableSession',
            required: [true, 'Table session is required'],
            index: true
        },
        table_number: {
            type: String,
            required: [true, 'Table number is required'],
            uppercase: true,
            trim: true,
            index: true
        },
        customer_phone: {
            type: String,
            trim: true,
            default: null
        },
        customer_notes: {
            type: String,
            trim: true,
            default: ''
        },
        items: {
            type: [orderItemSnapshotSchema],
            validate: {
                validator: (val) => Array.isArray(val) && val.length > 0,
                message: 'An order must contain at least one item.'
            }
        },
        subtotal_paise: {
            type: Number,
            required: true,
            min: 0
        },
        tax_paise: {
            type: Number,
            default: 0,
            min: 0
        },
        total_amount_paise: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: String,
            enum: Object.values(ORDER_STATUS),
            default: ORDER_STATUS.PENDING_VERIFICATION,
            index: true
        },
        assigned_waiter_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff',
            default: null,
            index: true
        },
        assigned_waiter_name: {
            type: String,
            default: null
        },
        claimed_at: {
            type: Date,
            default: null
        },
        verified_at: {
            type: Date,
            default: null
        },
        rejection_reason: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
export default Order;
