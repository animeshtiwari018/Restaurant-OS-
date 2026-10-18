import { Order } from '../models/Order.js';
import { ORDER_STATUS } from '../constants.js';
import { OrderService } from '../services/order.service.js';
import { DispatchService } from '../services/dispatch.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Customer places an order from cart
 */
export const createOrder = asyncHandler(async (req, res) => {
    const { session_id, items, customer_phone, customer_notes } = req.body;

    const order = await OrderService.createOrder({
        sessionId: session_id,
        rawItems: items,
        customerPhone: customer_phone,
        customerNotes: customer_notes
    });

    return res.status(201).json(
        new ApiResponse(201, order, 'Order submitted successfully. Awaiting waiter physical verification.')
    );
});

/**
 * Get order by ID
 */
export const getOrderById = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, 'Order not found.');
    }

    return res.status(200).json(
        new ApiResponse(200, order, 'Order fetched successfully.')
    );
});

/**
 * Get orders with optional filters (table, session, status)
 */
export const getOrders = asyncHandler(async (req, res) => {
    const { session_id, table_number, status } = req.query;
    const filter = {};

    if (session_id) filter.table_session_id = session_id;
    if (table_number) filter.table_number = table_number.toUpperCase();
    if (status) filter.status = status;

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, orders, 'Orders fetched successfully.')
    );
});

/**
 * Get pending unassigned orders for waiter dispatch queue
 */
export const getUnassignedOrders = asyncHandler(async (req, res) => {
    const pendingOrders = await Order.find({
        status: ORDER_STATUS.PENDING_VERIFICATION,
        assigned_waiter_id: null
    }).sort({ createdAt: 1 });

    return res.status(200).json(
        new ApiResponse(200, pendingOrders, 'Unassigned orders queue fetched successfully.')
    );
});

/**
 * Waiter atomically claims an order
 */
export const claimOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const waiter = req.staff; // from auth middleware

    const order = await DispatchService.claimOrder(orderId, waiter);

    return res.status(200).json(
        new ApiResponse(200, order, `Order claimed successfully by ${waiter.name}.`)
    );
});

/**
 * Waiter physically verifies an order at the table
 */
export const verifyOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const waiter = req.staff;

    const order = await DispatchService.verifyOrder(orderId, waiter);

    return res.status(200).json(
        new ApiResponse(200, order, 'Order physically verified and sent to Kitchen.')
    );
});

/**
 * Waiter rejects an order
 */
export const rejectOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { reason } = req.body;
    const waiter = req.staff;

    const order = await DispatchService.rejectOrder(orderId, waiter, reason);

    return res.status(200).json(
        new ApiResponse(200, order, 'Order rejected.')
    );
});
