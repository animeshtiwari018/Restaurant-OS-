import { Router } from 'express';
import {
    createOrder,
    getOrderById,
    getOrders,
    getUnassignedOrders,
    claimOrder,
    verifyOrder,
    rejectOrder
} from '../controllers/order.controller.js';
import { verifyStaffToken, authorizeRoles } from '../middlewares/auth.middleware.js';
import { STAFF_ROLES } from '../constants.js';

const router = Router();

// Customer / General routes
router.route('/')
    .post(createOrder)
    .get(getOrders);

// Waiter dispatch queue
router.get(
    '/unassigned',
    verifyStaffToken,
    authorizeRoles(STAFF_ROLES.WAITER, STAFF_ROLES.ADMIN, STAFF_ROLES.MANAGER),
    getUnassignedOrders
);

router.get('/:orderId', getOrderById);

// Waiter actions
router.post(
    '/:orderId/claim',
    verifyStaffToken,
    authorizeRoles(STAFF_ROLES.WAITER, STAFF_ROLES.ADMIN),
    claimOrder
);

router.post(
    '/:orderId/verify',
    verifyStaffToken,
    authorizeRoles(STAFF_ROLES.WAITER, STAFF_ROLES.ADMIN),
    verifyOrder
);

router.post(
    '/:orderId/reject',
    verifyStaffToken,
    authorizeRoles(STAFF_ROLES.WAITER, STAFF_ROLES.ADMIN),
    rejectOrder
);

export default router;
