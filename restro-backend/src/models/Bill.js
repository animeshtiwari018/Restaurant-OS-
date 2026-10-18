import mongoose from 'mongoose';
import { BILL_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } from '../constants.js';

const paymentRecordSchema = new mongoose.Schema(
    {
        payment_method: {
            type: String,
            enum: Object.values(PAYMENT_METHODS),
            required: true
        },
        amount_paise: {
            type: Number,
            required: true,
            min: [1, 'Payment amount must be greater than zero']
        },
        status: {
            type: String,
            enum: Object.values(PAYMENT_STATUS),
            default: PAYMENT_STATUS.SUCCESS
        },
        transaction_reference: {
            type: String,
            default: null
        },
        recorded_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff',
            default: null
        },
        paid_at: {
            type: Date,
            default: Date.now
        }
    },
    { _id: true }
);

const billSchema = new mongoose.Schema(
    {
        bill_number: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        table_session_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TableSession',
            required: [true, 'Table session is required'],
            unique: true, // Invariant: Exactly 1 primary bill per table session
            index: true
        },
        table_number: {
            type: String,
            required: true,
            uppercase: true,
            trim: true
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
        discount_paise: {
            type: Number,
            default: 0,
            min: 0
        },
        final_total_paise: {
            type: Number,
            required: true,
            min: 0
        },
        paid_amount_paise: {
            type: Number,
            default: 0,
            min: 0
        },
        status: {
            type: String,
            enum: Object.values(BILL_STATUS),
            default: BILL_STATUS.DRAFT,
            index: true
        },
        payments: [paymentRecordSchema]
    },
    { timestamps: true }
);

export const Bill = mongoose.model('Bill', billSchema);
export default Bill;
