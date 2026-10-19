import { Router } from 'express';
import { adminProvisionStaff, listStaff } from '../controllers/auth.controller.js';
import { verifyStaffToken, authorizeRoles } from '../middlewares/auth.middleware.js';
import { STAFF_ROLES } from '../constants.js';

const router = Router();

// Protect all admin endpoints with staff token
router.use(verifyStaffToken);

// Admin Staff Management
router.post('/staff', authorizeRoles(STAFF_ROLES.ADMIN), adminProvisionStaff);
router.get('/staff', authorizeRoles(STAFF_ROLES.ADMIN, STAFF_ROLES.MANAGER), listStaff);

export default router;
