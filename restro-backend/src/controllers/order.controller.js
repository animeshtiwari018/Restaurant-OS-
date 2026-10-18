import { Order } from '../models/Order.js';
import { KitchenTicket } from '../models/KitchenTicket.js';
import { ORDER_STATUS } from '../constants.js';
import { OrderService } from '../services/order.service.js';
import { DispatchService } from '../services/dispatch.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { getIO } from '../sockets/index.js';

/**
 * Customer places an order from cart
 * Dispatches NEW_ORDER_DISPATCH to room:waiters
 */
export const createOrder = asyncHandler(async (req, res) => {
    const { session_id, items, customer_phone, customer_notes } = req.body;

    const order = await OrderService.createOrder({
        sessionId: session_id,
        rawItems: items,
        customerPhone: customer_phone,
        customerNotes: customer_notes
    });

    // Real-time dispatch: emit NEW_ORDER_DISPATCH to room:waiters
    const io = getIO();
    if (io) {
        io.to('room:waiters').emit('NEW_ORDER_DISPATCH', order);
    }

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
 * Dispatches ORDER_CLAIMED to room:waiters
 */
export const claimOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const waiter = req.staff; // from auth middleware

    const order = await DispatchService.claimOrder(orderId, waiter);

    // Real-time dispatch: emit ORDER_CLAIMED to room:waiters
    const io = getIO();
    if (io) {
        io.to('room:waiters').emit('ORDER_CLAIMED', {
            OrderId: order._id,
            orderId: order._id,
            WaiterName: waiter.name,
            waiterName: waiter.name,
            order
        });

        if (order.table_session_id) {
            io.to(`room:session_${order.table_session_id}`).emit('ORDER_STATUS_UPDATE', {
                orderId: order._id,
                status: ORDER_STATUS.CLAIMED,
                assigned_waiter_name: waiter.name,
                order
            });
        }
    }

    return res.status(200).json(
        new ApiResponse(200, order, `Order claimed successfully by ${waiter.name}.`)
    );
});

/**
 * Waiter physically verifies an order at the table
 * Dispatches KDS_TICKET_QUEUED to room:kitchen and ORDER_STATUS_UPDATE (CONFIRMED) to room:session_<sessionId>
 */
export const verifyOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const waiter = req.staff;

    const order = await DispatchService.verifyOrder(orderId, waiter);

    // Fetch the newly generated KitchenTicket for KDS
    const ticket = await KitchenTicket.findOne({ order_id: order._id });

    // Real-time dispatch
    const io = getIO();
    if (io) {
        // KDS par naya KOT push karne ke liye
        io.to('room:kitchen').emit('KDS_TICKET_QUEUED', ticket || {
            order_id: order._id,
            table_number: order.table_number,
            status: 'QUEUED',
            items: order.items
        });

        // Customer phone par confirmation dikhane ke liye
        io.to(`room:session_${order.table_session_id}`).emit('ORDER_STATUS_UPDATE', {
            orderId: order._id,
            status: ORDER_STATUS.CONFIRMED,
            order
        });
    }

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

    const io = getIO();
    if (io && order.table_session_id) {
        io.to(`room:session_${order.table_session_id}`).emit('ORDER_STATUS_UPDATE', {
            orderId: order._id,
            status: ORDER_STATUS.REJECTED,
            reason: order.rejection_reason,
            order
        });
    }

    return res.status(200).json(
        new ApiResponse(200, order, 'Order rejected.')
    );
});
