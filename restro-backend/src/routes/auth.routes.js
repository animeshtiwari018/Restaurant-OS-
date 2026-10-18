import { Router } from 'express';
import {
    registerStaff,
    loginStaff,
    getStaffProfile
} from '../controllers/auth.controller.js';
import { verifyStaffToken, authorizeRoles } from '../middlewares/auth.middleware.js';
import { STAFF_ROLES } from '../constants.js';

const router = Router();

// Public routes
router.post('/login', loginStaff);

// Bootstrap or Admin route for staff creation
router.post('/register', registerStaff);

// Protected routes
router.get('/me', verifyStaffToken, getStaffProfile);

export default router;
