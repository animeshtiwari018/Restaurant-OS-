import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { KitchenTicket } from '../models/KitchenTicket.js';
import { ORDER_STATUS, KITCHEN_TICKET_STATUS, KITCHEN_ITEM_STATUS } from '../constants.js';
import { ApiError } from '../utils/apiError.js';

export const DispatchService = {
    /**
     * Atomically claim an order for a waiter
     * Concurrency rule: Exactly 1 winner if 2 waiters claim simultaneously
     */
    async claimOrder(orderId, waiter) {
        if (!orderId) {
            throw new ApiError(400, 'Order ID is required.');
        }

        const order = await Order.findOneAndUpdate(
            {
                _id: orderId,
                status: ORDER_STATUS.PENDING_VERIFICATION,
                assigned_waiter_id: null
            },
            {
                status: ORDER_STATUS.CLAIMED,
                assigned_waiter_id: waiter.id,
                assigned_waiter_name: waiter.name,
                claimed_at: new Date()
            },
            { returnDocument: 'after' }
        );

        if (!order) {
            const checkExisting = await Order.findById(orderId);
            if (!checkExisting) {
                throw new ApiError(404, 'Order not found.');
            }
            if (checkExisting.status === ORDER_STATUS.CLAIMED) {
                throw new ApiError(409, `Order was already claimed by ${checkExisting.assigned_waiter_name || 'another waiter'}.`);
            }
            throw new ApiError(400, `Cannot claim order with status ${checkExisting.status}.`);
        }

        return order;
    },

    /**
     * Physical verification confirmation by the assigned waiter
     * Wrapped in MongoDB ACID multi-document transaction (session.withTransaction)
     */
    async verifyOrder(orderId, waiter) {
        const executeVerification = async (session) => {
            const sessionOpts = session ? { session } : {};

            const order = await Order.findById(orderId).session(session || null);
            if (!order) {
                throw new ApiError(404, 'Order not found.');
            }

            if (order.status !== ORDER_STATUS.CLAIMED) {
                throw new ApiError(400, `Cannot verify order in ${order.status} state. Order must be CLAIMED first.`);
            }

            // Must be the assigned waiter or an admin
            if (waiter.role !== 'ADMIN' && order.assigned_waiter_id?.toString() !== waiter.id) {
                throw new ApiError(403, 'Only the assigned waiter can physically verify this order.');
            }

            // 1. Atomically update Order status to CONFIRMED
            order.status = ORDER_STATUS.CONFIRMED;
            order.verified_at = new Date();
            await order.save(sessionOpts);

            // 2. Generate Kitchen Ticket post-verification (KDS integration)
            const existingTicket = await KitchenTicket.findOne({ order_id: order._id }).session(session || null);
            if (!existingTicket) {
                const ticketCount = await KitchenTicket.countDocuments().session(session || null);
                await KitchenTicket.create(
                    [
                        {
                            ticket_number: 1001 + ticketCount,
                            order_id: order._id,
                            table_number: order.table_number,
                            status: KITCHEN_TICKET_STATUS.QUEUED,
                            items: order.items.map(item => ({
                                name: item.name,
                                quantity: item.quantity,
                                special_instructions: item.special_instructions,
                                status: KITCHEN_ITEM_STATUS.QUEUED
                            }))
                        }
                    ],
                    sessionOpts
                );
            }

            return order;
        };

        // Multi-Document ACID Transaction with Replica Set / Graceful fallback for standalone
        let session = null;
        try {
            session = await mongoose.startSession();
            let verifiedOrder;
            await session.withTransaction(async () => {
                verifiedOrder = await executeVerification(session);
            });
            return verifiedOrder;
        } catch (err) {
            // Graceful fallback for local standalone MongoDB deployments without replica set
            if (err.message && (err.message.includes('replica set') || err.message.includes('Transactions are not supported'))) {
                return await executeVerification(null);
            }
            throw err;
        } finally {
            if (session) {
                await session.endSession();
            }
        }
    },

    /**
     * Reject an order (empty table, prank, or customer cancelled physically)
     */
    async rejectOrder(orderId, waiter, reason) {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new ApiError(404, 'Order not found.');
        }

        if (order.status !== ORDER_STATUS.CLAIMED && order.status !== ORDER_STATUS.PENDING_VERIFICATION) {
            throw new ApiError(400, `Cannot reject order with status ${order.status}.`);
        }

        if (waiter.role !== 'ADMIN' && order.assigned_waiter_id && order.assigned_waiter_id.toString() !== waiter.id) {
            throw new ApiError(403, 'Only the assigned waiter or admin can reject this order.');
        }

        order.status = ORDER_STATUS.REJECTED;
        order.rejection_reason = reason || 'Customer not at table / verification rejected';
        await order.save();

        return order;
    }
};

export default DispatchService;
