import { Router } from 'express';
import {
    registerStaff,
    loginStaff,
    getStaffProfile,
    adminProvisionStaff
} from '../controllers/auth.controller.js';
import { verifyStaffToken, authorizeRoles } from '../middlewares/auth.middleware.js';
import { STAFF_ROLES } from '../constants.js';

const router = Router();

// Public authentication & registration (with privilege escalation protection)
router.post('/login', loginStaff);
router.post('/staff/login', loginStaff);
router.post('/register', registerStaff);
router.post('/staff/register', registerStaff);

// Protected staff profile
router.get('/me', verifyStaffToken, getStaffProfile);

// Admin staff provisioning alias
router.post('/admin/staff', verifyStaffToken, authorizeRoles(STAFF_ROLES.ADMIN), adminProvisionStaff);

export default router;
