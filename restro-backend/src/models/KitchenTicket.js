import mongoose from 'mongoose';
import { KITCHEN_TICKET_STATUS, KITCHEN_ITEM_STATUS } from '../constants.js';

const kitchenTicketItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        special_instructions: {
            type: String,
            trim: true,
            default: ''
        },
        status: {
            type: String,
            enum: Object.values(KITCHEN_ITEM_STATUS),
            default: KITCHEN_ITEM_STATUS.QUEUED
        }
    },
    { _id: true }
);

const kitchenTicketSchema = new mongoose.Schema(
    {
        ticket_number: {
            type: Number,
            required: true,
            index: true
        },
        order_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
            unique: true,
            index: true
        },
        table_number: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
            index: true
        },
        status: {
            type: String,
            enum: Object.values(KITCHEN_TICKET_STATUS),
            default: KITCHEN_TICKET_STATUS.QUEUED,
            index: true
        },
        items: [kitchenTicketItemSchema],
        started_at: {
            type: Date,
            default: null
        },
        ready_at: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

export const KitchenTicket = mongoose.model('KitchenTicket', kitchenTicketSchema);
export default KitchenTicket;
