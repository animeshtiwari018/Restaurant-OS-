import mongoose from 'mongoose';
import { RESERVATION_STATUS } from '../constants.js';

const reservationSchema = new mongoose.Schema(
    {
        table_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Table',
            required: [true, 'Table reference is required'],
            index: true
        },
        table_number: {
            type: String,
            required: [true, 'Table number is required'],
            uppercase: true,
            trim: true
        },
        customer_name: {
            type: String,
            required: [true, 'Customer name is required'],
            trim: true
        },
        customer_phone: {
            type: String,
            required: [true, 'Customer phone number is required'],
            trim: true,
            index: true
        },
        party_size: {
            type: Number,
            required: [true, 'Party size is required'],
            min: [1, 'Party size must be at least 1 person']
        },
        start_at: {
            type: Date,
            required: [true, 'Reservation start time is required'],
            index: true
        },
        end_at: {
            type: Date,
            required: [true, 'Reservation end time is required'],
            index: true
        },
        status: {
            type: String,
            enum: Object.values(RESERVATION_STATUS),
            default: RESERVATION_STATUS.CONFIRMED,
            index: true
        },
        special_requests: {
            type: String,
            trim: true,
            default: ''
        }
    },
    { timestamps: true }
);

export const Reservation = mongoose.model('Reservation', reservationSchema);
export default Reservation;
