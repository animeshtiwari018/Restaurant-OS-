import mongoose from 'mongoose';
import { TABLE_STATUS } from '../constants.js';

const tableSchema = new mongoose.Schema(
    {
        table_number: {
            type: String,
            required: [true, 'Table number is required'],
            unique: true,
            trim: true,
            uppercase: true,
            index: true
        },
        restaurant_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            default: () => new mongoose.Types.ObjectId('650000000000000000000001'),
            index: true
        },
        capacity: {
            type: Number,
            required: [true, 'Seating capacity is required'],
            min: [1, 'Capacity must be at least 1 person'],
            default: 4
        },
        floor: {
            type: String,
            trim: true,
            default: 'Main Floor'
        },
        status: {
            type: String,
            enum: Object.values(TABLE_STATUS),
            default: TABLE_STATUS.AVAILABLE,
            index: true
        },
        is_active: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export const Table = mongoose.model('Table', tableSchema);
export default Table;
