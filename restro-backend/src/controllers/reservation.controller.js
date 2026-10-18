import { Reservation } from '../models/Reservation.js';
import { Table } from '../models/Table.js';
import { TableSession } from '../models/TableSession.js';
import { RESERVATION_STATUS, TABLE_STATUS, TABLE_SESSION_STATUS } from '../constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Create a new table reservation with overlap concurrency guard & active dining session check
 */
export const createReservation = asyncHandler(async (req, res) => {
    const { table_id, customer_name, customer_phone, party_size, start_at, duration_minutes, special_requests } = req.body;

    if (!table_id || !customer_name || !customer_phone || !party_size || !start_at) {
        throw new ApiError(400, 'table_id, customer_name, customer_phone, party_size, and start_at are required.');
    }

    const startDate = new Date(start_at);
    if (isNaN(startDate.getTime()) || startDate < new Date()) {
        throw new ApiError(400, 'Invalid reservation start time. Must be a valid future date.');
    }

    const duration = duration_minutes ? parseInt(duration_minutes, 10) : 120; // 2 hours default
    const endDate = new Date(startDate.getTime() + duration * 60000);

    // 1. Verify physical table
    const table = await Table.findById(table_id);
    if (!table || !table.is_active) {
        throw new ApiError(404, 'Physical table not found or inactive.');
    }

    if (table.status === TABLE_STATUS.OUT_OF_SERVICE) {
        throw new ApiError(400, `Table ${table.table_number} is currently OUT_OF_SERVICE.`);
    }

    if (table.capacity < party_size) {
        throw new ApiError(400, `Table ${table.table_number} capacity (${table.capacity}) is too small for party size (${party_size}).`);
    }

    // 2. Pre-existing Active Dining Session Guard
    // If table is currently OCCUPIED or has an active session, ensure new reservation does not collide with current guests
    const activeSession = await TableSession.findOne({
        table_id: table._id,
        status: {
            $in: [
                TABLE_SESSION_STATUS.OPEN,
                TABLE_SESSION_STATUS.ACTIVE_SERVICE,
                TABLE_SESSION_STATUS.AWAITING_SETTLEMENT
            ]
        }
    });

    if (table.status === TABLE_STATUS.OCCUPIED || activeSession) {
        const ACTIVE_DINING_BUFFER_MS = 120 * 60 * 1000; // 2 hour buffer for walk-in dining sessions
        const estimatedAvailableTime = new Date(Date.now() + ACTIVE_DINING_BUFFER_MS);

        if (startDate < estimatedAvailableTime) {
            throw new ApiError(
                409,
                `Table ${table.table_number} is currently OCCUPIED by active dining guests. Next reservation slot can only be booked after ${estimatedAvailableTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
            );
        }
    }

    // 3. Concurrency Guard: Check for overlapping confirmed reservations on the same table
    const overlappingReservation = await Reservation.findOne({
        table_id: table._id,
        status: RESERVATION_STATUS.CONFIRMED,
        start_at: { $lt: endDate },
        end_at: { $gt: startDate }
    });

    if (overlappingReservation) {
        throw new ApiError(
            409,
            `Table ${table.table_number} is already reserved between ${overlappingReservation.start_at.toLocaleTimeString()} and ${overlappingReservation.end_at.toLocaleTimeString()}.`
        );
    }

    const reservation = await Reservation.create({
        table_id: table._id,
        table_number: table.table_number,
        customer_name,
        customer_phone,
        party_size,
        start_at: startDate,
        end_at: endDate,
        status: RESERVATION_STATUS.CONFIRMED,
        special_requests: special_requests || ''
    });

    return res.status(201).json(
        new ApiResponse(201, reservation, 'Reservation confirmed successfully.')
    );
});

/**
 * Get reservations list with optional filters
 */
export const getReservations = asyncHandler(async (req, res) => {
    const { table_id, date, status } = req.query;
    const filter = {};

    if (table_id) filter.table_id = table_id;
    if (status) filter.status = status;

    if (date) {
        const queryDate = new Date(date);
        const nextDay = new Date(queryDate.getTime() + 24 * 60 * 60000);
        filter.start_at = { $gte: queryDate, $lt: nextDay };
    }

    const reservations = await Reservation.find(filter).sort({ start_at: 1 });

    return res.status(200).json(
        new ApiResponse(200, reservations, 'Reservations fetched successfully.')
    );
});

/**
 * Update reservation status (Cancel, No-show, Complete)
 */
export const updateReservationStatus = asyncHandler(async (req, res) => {
    const { reservationId } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(RESERVATION_STATUS).includes(status)) {
        throw new ApiError(400, `Invalid reservation status. Allowed: [${Object.values(RESERVATION_STATUS).join(', ')}]`);
    }

    const reservation = await Reservation.findByIdAndUpdate(
        reservationId,
        { status },
        { returnDocument: 'after' }
    );

    if (!reservation) {
        throw new ApiError(404, 'Reservation not found.');
    }

    return res.status(200).json(
        new ApiResponse(200, reservation, `Reservation status updated to ${status}.`)
    );
});

/**
 * Resolve available tables for a prospective reservation (evaluating status !== 'OCCUPIED' & interval collisions)
 */
export const getAvailableTables = asyncHandler(async (req, res) => {
    const { party_size, start_at, duration_minutes } = req.query;

    if (!party_size || !start_at) {
        throw new ApiError(400, 'party_size and start_at are required to resolve available tables.');
    }

    const size = parseInt(party_size, 10);
    const startDate = new Date(start_at);
    if (isNaN(startDate.getTime())) {
        throw new ApiError(400, 'Invalid start_at date format.');
    }

    const duration = duration_minutes ? parseInt(duration_minutes, 10) : 120;
    const endDate = new Date(startDate.getTime() + duration * 60000);

    // 1. Fetch tables matching capacity that are active and not out of service
    const tables = await Table.find({
        is_active: true,
        capacity: { $gte: size },
        status: { $ne: TABLE_STATUS.OUT_OF_SERVICE }
    });

    const isNearFuture = startDate < new Date(Date.now() + 120 * 60000);
    const availableTables = [];

    for (const table of tables) {
        // If reservation is near future, table must not be currently OCCUPIED
        if (isNearFuture && table.status === TABLE_STATUS.OCCUPIED) {
            continue;
        }

        if (isNearFuture) {
            const activeSession = await TableSession.findOne({
                table_id: table._id,
                status: {
                    $in: [
                        TABLE_SESSION_STATUS.OPEN,
                        TABLE_SESSION_STATUS.ACTIVE_SERVICE,
                        TABLE_SESSION_STATUS.AWAITING_SETTLEMENT
                    ]
                }
            });
            if (activeSession) continue;
        }

        // Check overlapping confirmed reservations
        const hasOverlap = await Reservation.findOne({
            table_id: table._id,
            status: RESERVATION_STATUS.CONFIRMED,
            start_at: { $lt: endDate },
            end_at: { $gt: startDate }
        });

        if (!hasOverlap) {
            availableTables.push(table);
        }
    }

    return res.status(200).json(
        new ApiResponse(200, availableTables, 'Available tables resolved successfully.')
    );
});
