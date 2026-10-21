import mongoose from 'mongoose';
import { STAFF_ROLES, STAFF_STATUS } from '../constants.js';

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
        password: {
            type: String,
            trim: true
        },
        password_hash: {
            type: String,
            trim: true
        },
        role: {
            type: String,
            enum: Object.values(STAFF_ROLES),
            default: STAFF_ROLES.WAITER,
            index: true
        },
        status: {
            type: String,
            enum: Object.values(STAFF_STATUS),
            default: STAFF_STATUS.ACTIVE,
            index: true
        },
        station: {
            type: String,
            trim: true,
            default: null
        },
        phone: {
            type: String,
            trim: true,
            default: null
        },
        pin: {
            type: String,
            trim: true,
            default: '1234'
        },
        designation: {
            type: String,
            trim: true,
            default: 'Captain'
        },
        avatar_url: {
            type: String,
            trim: true,
            default: null
        },
        tables_assigned: {
            type: String,
            trim: true,
            default: 'T-01 - T-12'
        },
        is_active: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

// Ensure password/password_hash synchronization and status/is_active coherence
staffSchema.pre('validate', function () {
    if (this.password && !this.password_hash) {
        this.password_hash = this.password;
    }
    if (this.password_hash && !this.password) {
        this.password = this.password_hash;
    }
    if (!this.password && !this.password_hash) {
        this.invalidate('password', 'Password is required');
    }
    if (this.status) {
        this.is_active = this.status === STAFF_STATUS.ACTIVE;
    } else if (typeof this.is_active === 'boolean') {
        this.status = this.is_active ? STAFF_STATUS.ACTIVE : STAFF_STATUS.INACTIVE;
    }
});

export const Staff = mongoose.model('Staff', staffSchema);
export default Staff;
