import mongoose from 'mongoose';
import { STAFF_ROLES } from '../constants.js';

const staffSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Staff member name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Staff email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        password_hash: {
            type: String,
            required: [true, 'Password hash is required']
        },
        role: {
            type: String,
            enum: Object.values(STAFF_ROLES),
            default: STAFF_ROLES.WAITER,
            index: true
        },
        phone: {
            type: String,
            trim: true,
            default: null
        },
        is_active: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export const Staff = mongoose.model('Staff', staffSchema);
export default Staff;
