import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { TableSession } from '../models/TableSession.js';
import { Table } from '../models/Table.js';
import { Order } from '../models/Order.js';
import { Bill } from '../models/Bill.js';
import { TABLE_SESSION_STATUS, ORDER_STATUS, BILL_STATUS } from '../constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { JWT_SECRET } from '../utils/token.js';

/**
 * Reconnection State Hydration API
 * Route: GET /api/v1/sessions/current
 *
 * Resolves active session by customer session token (or QR token / session ID)
 * and returns live order, status, and current bill so client state is preserved
 * on page refresh or network reconnection.
 */
export const getCurrentSessionState = asyncHandler(async (req, res) => {
    // 1. Extract token / identifier from request headers or query params
    let rawToken =
        req.headers['x-session-token'] ||
        req.headers['authorization'] ||
        req.headers['x-table-token'] ||
        req.headers['x-session-id'] ||
        req.query.token ||
        req.query.sessionId ||
        req.query.session_id;

    if (!rawToken) {
        throw new ApiError(401, 'Session token or session ID is required.');
    }

    if (rawToken.startsWith('Bearer ')) {
        rawToken = rawToken.slice(7).trim();
    }

    let session = null;

    // 2. Attempt resolution via JWT (session token or QR token)
    try {
        const decoded = jwt.verify(rawToken, JWT_SECRET);

        if (decoded.sessionId && mongoose.Types.ObjectId.isValid(decoded.sessionId)) {
            session = await TableSession.findById(decoded.sessionId);
        } else if (decoded.tableNumber) {
            const table = await Table.findOne({
                table_number: decoded.tableNumber.toUpperCase(),
                is_active: true
            });

            if (table) {
                session = await TableSession.findOne({
                    table_id: table._id,
                    status: {
                        $in: [
                            TABLE_SESSION_STATUS.OPEN,
                            TABLE_SESSION_STATUS.ACTIVE_SERVICE,
                            TABLE_SESSION_STATUS.AWAITING_SETTLEMENT
                        ]
                    }
                });
            }
        }
    } catch {
        // Not a valid JWT, fallback to raw ObjectId or table number lookup
    }

    // 3. Fallback resolution: direct ObjectId or table number lookup
    if (!session && mongoose.Types.ObjectId.isValid(rawToken)) {
        session = await TableSession.findById(rawToken);
    }

    if (!session) {
        // Try looking up table by table number
        const table = await Table.findOne({
            table_number: rawToken.toUpperCase(),
            is_active: true
        });

        if (table) {
            session = await TableSession.findOne({
                table_id: table._id,
                status: {
                    $in: [
                        TABLE_SESSION_STATUS.OPEN,
                        TABLE_SESSION_STATUS.ACTIVE_SERVICE,
                        TABLE_SESSION_STATUS.AWAITING_SETTLEMENT
                    ]
                }
            });
        }
    }

    if (!session) {
        throw new ApiError(404, 'Active table session not found. Please scan the table QR code.');
    }

    // 4. Fetch orders for this session
    const orders = await Order.find({
        table_session_id: session._id,
        status: { $ne: ORDER_STATUS.CANCELLED }
    }).sort({ createdAt: -1 });

    const liveOrder = orders.length > 0 ? orders[0] : null;

    // 5. Fetch or compute current bill
    let bill = await Bill.findOne({ table_session_id: session._id });

    let subtotalPaise = 0;
    let taxPaise = 0;
    for (const order of orders) {
        subtotalPaise += order.subtotal_paise || 0;
        taxPaise += order.tax_paise || 0;
    }
    const finalTotalPaise = subtotalPaise + taxPaise;

    if (!bill) {
        bill = {
            table_session_id: session._id,
            table_number: session.table_number,
            subtotal_paise: subtotalPaise,
            tax_paise: taxPaise,
            discount_paise: 0,
            final_total_paise: finalTotalPaise,
            paid_amount_paise: 0,
            status: BILL_STATUS.DRAFT
        };
    } else if (bill.status === BILL_STATUS.DRAFT) {
        // Keep draft bill synced with current items
        bill.subtotal_paise = subtotalPaise;
        bill.tax_paise = taxPaise;
        bill.final_total_paise = subtotalPaise + taxPaise - (bill.discount_paise || 0);
    }

    return res.status(200).json(
        new ApiResponse(200, {
            session,
            table_number: session.table_number,
            status: liveOrder ? liveOrder.status : session.status,
            order_status: liveOrder ? liveOrder.status : null,
            liveOrder,
            live_order: liveOrder,
            order: liveOrder,
            orders,
            bill
        }, 'Current session state hydrated successfully.')
    );
});

export default { getCurrentSessionState };
