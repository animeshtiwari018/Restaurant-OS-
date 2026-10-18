import { KitchenTicket } from '../models/KitchenTicket.js';
import { Order } from '../models/Order.js';
import { KITCHEN_TICKET_STATUS, KITCHEN_ITEM_STATUS, ORDER_STATUS } from '../constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { getIO } from '../sockets/index.js';

/**
 * Get active Kitchen Tickets for KDS display
 */
export const getActiveTickets = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const filter = {};

    if (status) {
        filter.status = status;
    } else {
        filter.status = { 
            $in: [
                KITCHEN_TICKET_STATUS.QUEUED, 
                KITCHEN_TICKET_STATUS.PREPARING, 
                KITCHEN_TICKET_STATUS.READY
            ] 
        };
    }

    const tickets = await KitchenTicket.find(filter).sort({ createdAt: 1 });

    return res.status(200).json(
        new ApiResponse(200, tickets, 'Active kitchen tickets fetched successfully.')
    );
});

/**
 * Update individual dish item status inside a Kitchen Ticket
 * Dispatches FOOD_READY_ALERT to room:session_<sessionId> & room:waiters
 */
export const updateTicketItemStatus = asyncHandler(async (req, res) => {
    const { ticketId, itemId } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(KITCHEN_ITEM_STATUS).includes(status)) {
        throw new ApiError(400, `Invalid item status. Allowed: [${Object.values(KITCHEN_ITEM_STATUS).join(', ')}]`);
    }

    const ticket = await KitchenTicket.findById(ticketId);
    if (!ticket) {
        throw new ApiError(404, 'Kitchen ticket not found.');
    }

    const item = ticket.items.id(itemId);
    if (!item) {
        throw new ApiError(404, 'Dish item not found in ticket.');
    }

    item.status = status;

    // Check if kitchen started preparing
    if (status === KITCHEN_ITEM_STATUS.PREPARING && ticket.status === KITCHEN_TICKET_STATUS.QUEUED) {
        ticket.status = KITCHEN_TICKET_STATUS.PREPARING;
        ticket.started_at = ticket.started_at || new Date();
    }

    // Rule: Ticket turns READY if and only if all items within the ticket are marked READY
    const allItemsReady = ticket.items.every((it) => it.status === KITCHEN_ITEM_STATUS.READY);
    let updatedOrder = null;
    if (allItemsReady) {
        ticket.status = KITCHEN_TICKET_STATUS.READY;
        ticket.ready_at = new Date();

        // Also update parent Order to READY
        updatedOrder = await Order.findByIdAndUpdate(
            ticket.order_id,
            { status: ORDER_STATUS.READY },
            { returnDocument: 'after' }
        );
    } else {
        updatedOrder = await Order.findById(ticket.order_id);
    }

    await ticket.save();

    // Real-time notification: emit FOOD_READY_ALERT to room:session_<sessionId> & room:waiters
    const io = getIO();
    if (io) {
        const payload = {
            ticketId: ticket._id,
            orderId: ticket.order_id,
            tableNumber: ticket.table_number,
            itemId: item._id,
            itemName: item.name,
            itemStatus: item.status,
            ticketStatus: ticket.status,
            orderStatus: updatedOrder?.status,
            item,
            ticket,
            order: updatedOrder
        };

        if (updatedOrder?.table_session_id) {
            io.to(`room:session_${updatedOrder.table_session_id}`).emit('FOOD_READY_ALERT', payload);
        }
        io.to('room:waiters').emit('FOOD_READY_ALERT', payload);
    }

    return res.status(200).json(
        new ApiResponse(200, ticket, `Item updated to ${status}. Ticket status: ${ticket.status}`)
    );
});

/**
 * Update overall Kitchen Ticket status (e.g., chef manually marks entire ticket PREPARING or READY)
 * Dispatches FOOD_READY_ALERT to room:session_<sessionId> & room:waiters
 */
export const updateTicketStatus = asyncHandler(async (req, res) => {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(KITCHEN_TICKET_STATUS).includes(status)) {
        throw new ApiError(400, `Invalid ticket status. Allowed: [${Object.values(KITCHEN_TICKET_STATUS).join(', ')}]`);
    }

    const ticket = await KitchenTicket.findById(ticketId);
    if (!ticket) {
        throw new ApiError(404, 'Kitchen ticket not found.');
    }

    ticket.status = status;
    if (status === KITCHEN_TICKET_STATUS.PREPARING && !ticket.started_at) {
        ticket.started_at = new Date();
        ticket.items.forEach((it) => {
            if (it.status === KITCHEN_ITEM_STATUS.QUEUED) it.status = KITCHEN_ITEM_STATUS.PREPARING;
        });
    }

    let updatedOrder = null;
    if (status === KITCHEN_TICKET_STATUS.READY) {
        ticket.ready_at = new Date();
        ticket.items.forEach((it) => (it.status = KITCHEN_ITEM_STATUS.READY));

        // Update Order to READY
        updatedOrder = await Order.findByIdAndUpdate(
            ticket.order_id,
            { status: ORDER_STATUS.READY },
            { returnDocument: 'after' }
        );
    } else {
        updatedOrder = await Order.findById(ticket.order_id);
    }

    await ticket.save();

    // Real-time dispatch
    const io = getIO();
    if (io) {
        const payload = {
            ticketId: ticket._id,
            orderId: ticket.order_id,
            tableNumber: ticket.table_number,
            ticketStatus: ticket.status,
            orderStatus: updatedOrder?.status,
            ticket,
            order: updatedOrder
        };

        if (updatedOrder?.table_session_id) {
            io.to(`room:session_${updatedOrder.table_session_id}`).emit('FOOD_READY_ALERT', payload);
        }
        io.to('room:waiters').emit('FOOD_READY_ALERT', payload);
    }

    return res.status(200).json(
        new ApiResponse(200, ticket, `Ticket status updated to ${status}.`)
    );
});

/**
 * Mark Order as SERVED (Food delivered to table by waiter)
 */
export const markOrderServed = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, 'Order not found.');
    }

    if (order.status !== ORDER_STATUS.READY && order.status !== ORDER_STATUS.CONFIRMED) {
        throw new ApiError(400, `Cannot mark order with status ${order.status} as SERVED.`);
    }

    order.status = ORDER_STATUS.SERVED;
    await order.save();

    // Mark corresponding kitchen ticket as COMPLETED
    await KitchenTicket.findOneAndUpdate(
        { order_id: order._id },
        { status: KITCHEN_TICKET_STATUS.COMPLETED }
    );

    // Notify customer phone
    const io = getIO();
    if (io && order.table_session_id) {
        io.to(`room:session_${order.table_session_id}`).emit('ORDER_STATUS_UPDATE', {
            orderId: order._id,
            status: ORDER_STATUS.SERVED,
            order
        });
    }

    return res.status(200).json(
        new ApiResponse(200, order, 'Order marked as SERVED. Food delivered to table.')
    );
});
