/**
 * RESTRO MANAGE - Domain Constants and State Enums
 * Authoritative Enums strictly aligned with system architecture & state machines
 */

export const STAFF_ROLES = Object.freeze({
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    WAITER: 'WAITER',
    KITCHEN: 'KITCHEN'
});

export const TABLE_STATUS = Object.freeze({
    AVAILABLE: 'AVAILABLE',
    OCCUPIED: 'OCCUPIED',
    RESERVED: 'RESERVED',
    OUT_OF_SERVICE: 'OUT_OF_SERVICE'
});

export const TABLE_SESSION_STATUS = Object.freeze({
    OPEN: 'OPEN',
    ACTIVE_SERVICE: 'ACTIVE_SERVICE',
    AWAITING_SETTLEMENT: 'AWAITING_SETTLEMENT',
    CLOSED: 'CLOSED',
    CANCELLED: 'CANCELLED'
});

export const ORDER_STATUS = Object.freeze({
    PENDING_VERIFICATION: 'PENDING_VERIFICATION',
    CLAIMED: 'CLAIMED',
    CONFIRMED: 'CONFIRMED',
    REJECTED: 'REJECTED',
    PREPARING: 'PREPARING',
    READY: 'READY',
    SERVED: 'SERVED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
});

export const KITCHEN_TICKET_STATUS = Object.freeze({
    QUEUED: 'QUEUED',
    PREPARING: 'PREPARING',
    READY: 'READY',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
});

export const KITCHEN_ITEM_STATUS = Object.freeze({
    QUEUED: 'QUEUED',
    PREPARING: 'PREPARING',
    READY: 'READY'
});

export const RESERVATION_STATUS = Object.freeze({
    REQUESTED: 'REQUESTED',
    OTP_VERIFIED: 'OTP_VERIFIED',
    AWAITING_DEPOSIT: 'AWAITING_DEPOSIT',
    CONFIRMED: 'CONFIRMED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    NO_SHOW: 'NO_SHOW'
});

export const BILL_STATUS = Object.freeze({
    DRAFT: 'DRAFT',
    FINALIZED: 'FINALIZED',
    PARTIALLY_PAID: 'PARTIALLY_PAID',
    SETTLED: 'SETTLED',
    CANCELLED: 'CANCELLED'
});

export const PAYMENT_STATUS = Object.freeze({
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED'
});

export const PAYMENT_METHODS = Object.freeze({
    CASH: 'CASH',
    UPI: 'UPI',
    CARD: 'CARD',
    ONLINE: 'ONLINE'
});
