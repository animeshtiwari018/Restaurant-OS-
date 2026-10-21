import { Router } from 'express';
import {
    getOrCreateBillForSession,
    finalizeBill,
    recordPayment,
    settleSessionBill,
    getBillById
} from '../controllers/billing.controller.js';
import { verifyStaffToken, authorizeRoles } from '../middlewares/auth.middleware.js';
import { STAFF_ROLES } from '../constants.js';

const router = Router();

// Get or generate bill for a table session (supports both singular and plural)
router.get('/sessions/:sessionId', getOrCreateBillForSession);
router.get('/session/:sessionId', getOrCreateBillForSession);

// Customer / table direct checkout settlement
router.post('/sessions/:sessionId/settle', settleSessionBill);
router.post('/session/:sessionId/settle', settleSessionBill);

// Get specific bill
router.get('/:billId', getBillById);

// Staff actions
router.post(
    '/:billId/finalize',
    verifyStaffToken,
    authorizeRoles(STAFF_ROLES.WAITER, STAFF_ROLES.ADMIN, STAFF_ROLES.MANAGER),
    finalizeBill
);

router.post(
    '/:billId/payments',
    verifyStaffToken,
    authorizeRoles(STAFF_ROLES.WAITER, STAFF_ROLES.ADMIN, STAFF_ROLES.MANAGER),
    recordPayment
);

export default router;
