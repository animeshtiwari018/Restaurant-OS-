import mongoose from 'mongoose';
import { TABLE_SESSION_STATUS } from '../constants.js';

const tableSessionSchema = new mongoose.Schema(
    {
        table_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Table',
            required: [true, 'Table reference is required']
        },
        table_number: {
            type: String,
            required: [true, 'Table number is required'],
            uppercase: true,
            trim: true
        },
        status: {
            type: String,
            enum: Object.values(TABLE_SESSION_STATUS),
            default: TABLE_SESSION_STATUS.OPEN,
            index: true
        },
        customer_phone: {
            type: String,
            trim: true,
            default: null
        },
        guest_count: {
            type: Number,
            min: 1,
            default: 1
        },
        opened_at: {
            type: Date,
            default: Date.now
        },
        closed_at: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

// Database Invariant: At most ONE active dining session per physical table
tableSessionSchema.index(
    { table_id: 1 },
    {
        unique: true,
        partialFilterExpression: {
            status: {
                $in: [
                    TABLE_SESSION_STATUS.OPEN,
                    TABLE_SESSION_STATUS.ACTIVE_SERVICE,
                    TABLE_SESSION_STATUS.AWAITING_SETTLEMENT
                ]
            }
        }
    }
);

export const TableSession = mongoose.model('TableSession', tableSessionSchema);
export default TableSession;
