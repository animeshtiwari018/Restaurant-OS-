import { Router } from 'express';
import {
    getActiveTickets,
    updateTicketItemStatus,
    updateTicketStatus,
    markOrderServed
} from '../controllers/kitchen.controller.js';
import { verifyStaffToken, authorizeRoles } from '../middlewares/auth.middleware.js';
import { STAFF_ROLES } from '../constants.js';

const router = Router();

// Protect all kitchen routes with staff token
router.use(verifyStaffToken);

// KDS tickets view
router.get(
    '/tickets',
    authorizeRoles(STAFF_ROLES.KITCHEN, STAFF_ROLES.ADMIN, STAFF_ROLES.MANAGER, STAFF_ROLES.WAITER),
    getActiveTickets
);

// Kitchen chef updates ticket
router.patch(
    '/tickets/:ticketId/status',
    authorizeRoles(STAFF_ROLES.KITCHEN, STAFF_ROLES.ADMIN),
    updateTicketStatus
);

// Kitchen chef updates individual dish
router.patch(
    '/tickets/:ticketId/items/:itemId/status',
    authorizeRoles(STAFF_ROLES.KITCHEN, STAFF_ROLES.ADMIN),
    updateTicketItemStatus
);

// Waiter marks order as served
router.post(
    '/orders/:orderId/serve',
    authorizeRoles(STAFF_ROLES.WAITER, STAFF_ROLES.ADMIN),
    markOrderServed
);

export default router;
