import { Bill } from '../models/Bill.js';
import { Order } from '../models/Order.js';
import { TableSession } from '../models/TableSession.js';
import { Table } from '../models/Table.js';
import { BILL_STATUS, ORDER_STATUS, TABLE_SESSION_STATUS, TABLE_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } from '../constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Generate or get unified primary bill for a Table Session
 * Invariant: 1 Session = 1 Bill
 */
export const getOrCreateBillForSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const session = await TableSession.findById(sessionId);
    if (!session) {
        throw new ApiError(404, 'Table session not found.');
    }

    // 1. Fetch all non-cancelled orders for this session
    const orders = await Order.find({
        table_session_id: session._id,
        status: { $ne: ORDER_STATUS.CANCELLED }
    });

    if (orders.length === 0) {
        throw new ApiError(400, 'Cannot generate bill: No active orders placed for this table session.');
    }

    // Aggregate subtotal and tax across all orders in session
    let subtotalPaise = 0;
    let taxPaise = 0;

    for (const order of orders) {
        subtotalPaise += order.subtotal_paise;
        taxPaise += order.tax_paise;
    }

    const finalTotalPaise = subtotalPaise + taxPaise;

    // Check if bill already exists for this session
    let bill = await Bill.findOne({ table_session_id: session._id });

    if (!bill) {
        const count = await Bill.countDocuments();
        const entropy = Math.floor(100 + Math.random() * 900);
        const billNumber = `INV-${new Date().getFullYear()}-${1001 + count}-${entropy}`;

        bill = await Bill.create({
            bill_number: billNumber,
            table_session_id: session._id,
            table_number: session.table_number,
            subtotal_paise: subtotalPaise,
            tax_paise: taxPaise,
            final_total_paise: finalTotalPaise,
            status: BILL_STATUS.DRAFT
        });
    } else if (bill.status === BILL_STATUS.DRAFT) {
        // Recalculate bill if still in DRAFT
        bill.subtotal_paise = subtotalPaise;
        bill.tax_paise = taxPaise;
        bill.final_total_paise = subtotalPaise + taxPaise - (bill.discount_paise || 0);
        await bill.save();
    }

    // Update session state to AWAITING_SETTLEMENT
    if (session.status === TABLE_SESSION_STATUS.ACTIVE_SERVICE) {
        session.status = TABLE_SESSION_STATUS.AWAITING_SETTLEMENT;
        await session.save();
    }

    return res.status(200).json(
        new ApiResponse(200, { bill, orders }, 'Session primary bill retrieved successfully.')
    );
});

/**
 * Finalize / Lock Bill
 */
export const finalizeBill = asyncHandler(async (req, res) => {
    const { billId } = req.params;

    const bill = await Bill.findById(billId);
    if (!bill) {
        throw new ApiError(404, 'Bill not found.');
    }

    if (bill.status !== BILL_STATUS.DRAFT) {
        throw new ApiError(400, `Cannot finalize bill with status ${bill.status}.`);
    }

    bill.status = BILL_STATUS.FINALIZED;
    await bill.save();

    return res.status(200).json(
        new ApiResponse(200, bill, 'Bill finalized and locked for payment.')
    );
});

/**
 * Record payment towards a bill (Supports partial and full payments)
 */
export const recordPayment = asyncHandler(async (req, res) => {
    const { billId } = req.params;
    const { payment_method, amount_paise, transaction_reference } = req.body;

    if (!payment_method || !Object.values(PAYMENT_METHODS).includes(payment_method)) {
        throw new ApiError(400, `Invalid payment method. Allowed: [${Object.values(PAYMENT_METHODS).join(', ')}]`);
    }

    const payAmount = parseInt(amount_paise, 10);
    if (isNaN(payAmount) || payAmount <= 0) {
        throw new ApiError(400, 'Payment amount must be greater than zero.');
    }

    const bill = await Bill.findById(billId);
    if (!bill) {
        throw new ApiError(404, 'Bill not found.');
    }

    if (bill.status === BILL_STATUS.SETTLED) {
        throw new ApiError(400, 'This bill is already fully settled.');
    }

    // Record payment
    bill.payments.push({
        payment_method,
        amount_paise: payAmount,
        status: PAYMENT_STATUS.SUCCESS,
        transaction_reference: transaction_reference || null,
        recorded_by: req.staff?.id || null,
        paid_at: new Date()
    });

    bill.paid_amount_paise += payAmount;

    // Check if fully settled
    if (bill.paid_amount_paise >= bill.final_total_paise) {
        bill.status = BILL_STATUS.SETTLED;

        // Release session and reset table to AVAILABLE
        const session = await TableSession.findById(bill.table_session_id);
        if (session && session.status !== TABLE_SESSION_STATUS.CLOSED) {
            session.status = TABLE_SESSION_STATUS.CLOSED;
            session.closed_at = new Date();
            await session.save();
            await Table.findByIdAndUpdate(session.table_id, {
                status: TABLE_STATUS.AVAILABLE
            });
        }
    } else {
        bill.status = BILL_STATUS.PARTIALLY_PAID;
    }

    await bill.save();

    return res.status(200).json(
        new ApiResponse(200, bill, `Payment of ₹${(payAmount / 100).toFixed(2)} recorded. Bill status: ${bill.status}`)
    );
});

/**
 * Customer / Session Direct Settlement (Digital checkout from table)
 * Route: POST /api/v1/billing/sessions/:sessionId/settle
 */
export const settleSessionBill = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const { paymentMethod, amountPaise } = req.body;

    const session = await TableSession.findById(sessionId);
    if (!session) {
        throw new ApiError(404, 'Table session not found.');
    }

    let bill = await Bill.findOne({ table_session_id: session._id });
    if (!bill) {
        throw new ApiError(404, 'Bill not found for this session.');
    }

    const payAmount = parseInt(amountPaise, 10) || bill.final_total_paise;
    const method = paymentMethod || PAYMENT_METHODS.UPI;

    bill.payments.push({
        payment_method: method,
        amount_paise: payAmount,
        status: PAYMENT_STATUS.SUCCESS,
        paid_at: new Date()
    });

    bill.paid_amount_paise += payAmount;
    bill.status = BILL_STATUS.SETTLED;
    await bill.save();

    // Close session and free physical table
    session.status = TABLE_SESSION_STATUS.CLOSED;
    session.closed_at = new Date();
    await session.save();

    await Table.findByIdAndUpdate(session.table_id, {
        status: TABLE_STATUS.AVAILABLE
    });

    return res.status(200).json(
        new ApiResponse(200, bill, 'Session bill settled and table closed successfully.')
    );
});

/**
 * Get Bill by ID
 */
export const getBillById = asyncHandler(async (req, res) => {
    const { billId } = req.params;

    const bill = await Bill.findById(billId);
    if (!bill) {
        throw new ApiError(404, 'Bill not found.');
    }

    return res.status(200).json(
        new ApiResponse(200, bill, 'Bill fetched successfully.')
    );
});
