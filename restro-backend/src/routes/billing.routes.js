import { Router } from 'express';
import {
    getOrCreateBillForSession,
    finalizeBill,
    recordPayment,
    getBillById
} from '../controllers/billing.controller.js';
import { verifyStaffToken, authorizeRoles } from '../middlewares/auth.middleware.js';
import { STAFF_ROLES } from '../constants.js';

const router = Router();

// Get or generate bill for a table session
router.get('/sessions/:sessionId', getOrCreateBillForSession);

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
