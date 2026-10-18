import { Router } from 'express';
import {
    createReservation,
    getReservations,
    updateReservationStatus,
    getAvailableTables
} from '../controllers/reservation.controller.js';
import { verifyStaffToken, authorizeRoles } from '../middlewares/auth.middleware.js';
import { STAFF_ROLES } from '../constants.js';

const router = Router();

// Resolve available tables for reservations
router.get('/available-tables', getAvailableTables);

// Create and view reservations
router.route('/')
    .post(createReservation)
    .get(getReservations);

// Staff updates status (cancel, no-show, complete)
router.patch(
    '/:reservationId/status',
    verifyStaffToken,
    authorizeRoles(STAFF_ROLES.ADMIN, STAFF_ROLES.MANAGER, STAFF_ROLES.WAITER),
    updateReservationStatus
);

export default router;
