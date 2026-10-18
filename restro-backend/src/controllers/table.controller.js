import { Table } from '../models/Table.js';
import { TableSession } from '../models/TableSession.js';
import { TABLE_STATUS, TABLE_SESSION_STATUS } from '../constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { generateTableToken, generateSessionToken } from '../utils/token.js';

/**
 * Create a new physical table (Admin / Floor setup)
 */
export const createTable = asyncHandler(async (req, res) => {
    const { table_number, capacity, floor } = req.body;

    if (!table_number) {
        throw new ApiError(400, 'Table number is required.');
    }

    const existingTable = await Table.findOne({ table_number: table_number.toUpperCase() });
    if (existingTable) {
        throw new ApiError(409, `Table ${table_number.toUpperCase()} already exists.`);
    }

    const table = await Table.create({
        table_number,
        capacity: capacity || 4,
        floor: floor || 'Main Floor',
        status: TABLE_STATUS.AVAILABLE
    });

    return res.status(201).json(
        new ApiResponse(201, table, 'Table created successfully.')
    );
});

/**
 * Get all tables (Floor view)
 */
export const getTables = asyncHandler(async (req, res) => {
    const { floor, status } = req.query;
    const filter = { is_active: true };

    if (floor) filter.floor = floor;
    if (status) filter.status = status;

    const tables = await Table.find(filter).sort({ table_number: 1 });

    return res.status(200).json(
        new ApiResponse(200, tables, 'Tables fetched successfully.')
    );
});

/**
 * Generate QR Token for a specific physical table
 */
export const getTableQRCode = asyncHandler(async (req, res) => {
    const { tableNumber } = req.params;

    const table = await Table.findOne({ 
        table_number: tableNumber.toUpperCase(), 
        is_active: true 
    });

    if (!table) {
        throw new ApiError(404, `Table ${tableNumber.toUpperCase()} not found or inactive.`);
    }

    const token = generateTableToken(table.table_number, table.restaurant_id);

    return res.status(200).json(
        new ApiResponse(200, {
            tableNumber: table.table_number,
            restaurantId: table.restaurant_id,
            capacity: table.capacity,
            floor: table.floor,
            token,
            fullScanUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/t/${token}`
        }, 'Table QR token generated successfully.')
    );
});

/**
 * Verify Table Session on QR scan (Get active session or open new one)
 * 1 Table = 1 Active Session Invariant
 */
export const verifyAndGetSession = asyncHandler(async (req, res) => {
    const tableNumber = req.tableContext?.tableNumber;
    const restaurantId = req.tableContext?.restaurantId;

    if (!tableNumber) {
        throw new ApiError(400, 'Invalid table context in request.');
    }

    const tableFilter = { 
        table_number: tableNumber.toUpperCase(), 
        is_active: true 
    };
    if (restaurantId) {
        tableFilter.restaurant_id = restaurantId;
    }

    const table = await Table.findOne(tableFilter);

    if (!table) {
        throw new ApiError(404, `Physical table ${tableNumber} not found for this restaurant branch.`);
    }

    // Check for an existing active session (OPEN, ACTIVE_SERVICE, AWAITING_SETTLEMENT)
    let activeSession = await TableSession.findOne({
        table_id: table._id,
        status: {
            $in: [
                TABLE_SESSION_STATUS.OPEN,
                TABLE_SESSION_STATUS.ACTIVE_SERVICE,
                TABLE_SESSION_STATUS.AWAITING_SETTLEMENT
            ]
        }
    });

    // If no active session exists, open a fresh one
    if (!activeSession) {
        activeSession = await TableSession.create({
            table_id: table._id,
            table_number: table.table_number,
            status: TABLE_SESSION_STATUS.OPEN
        });

        // Mark table as occupied
        table.status = TABLE_STATUS.OCCUPIED;
        await table.save();
    }

    // Issue session token for hydration and subsequent API calls
    const sessionToken = generateSessionToken(activeSession._id, activeSession.table_number);

    return res.status(200).json(
        new ApiResponse(200, {
            table: {
                id: table._id,
                table_number: table.table_number,
                capacity: table.capacity,
                floor: table.floor,
                status: table.status
            },
            session: activeSession,
            sessionToken
        }, 'Table session verified successfully.')
    );
});

/**
 * Close a Table Session (When bill is paid and guests leave)
 */
export const closeTableSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const session = await TableSession.findById(sessionId);
    if (!session) {
        throw new ApiError(404, 'Session not found.');
    }

    if (session.status === TABLE_SESSION_STATUS.CLOSED) {
        throw new ApiError(400, 'Session is already closed.');
    }

    session.status = TABLE_SESSION_STATUS.CLOSED;
    session.closed_at = new Date();
    await session.save();

    // Mark physical table back to AVAILABLE
    await Table.findByIdAndUpdate(session.table_id, {
        status: TABLE_STATUS.AVAILABLE
    });

    return res.status(200).json(
        new ApiResponse(200, session, 'Table session closed and table reset to AVAILABLE.')
    );
});
