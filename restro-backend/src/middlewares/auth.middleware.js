import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const JWT_SECRET = process.env.STAFF_JWT_SECRET || process.env.JWT_SECRET || 'fallback_secret_key';

/**
 * Verify Staff JWT token
 */
export const verifyStaffToken = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        throw new ApiError(401, 'Authentication required! Please provide a valid token.');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.staff = decoded;
        next();
    } catch (err) {
        throw new ApiError(403, 'Invalid or expired token.');
    }
});

/**
 * Role-Based Access Control (RBAC) middleware
 * @param  {...string} allowedRoles 
 */
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.staff || !allowedRoles.includes(req.staff.role)) {
            throw new ApiError(403, `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`);
        }
        next();
    };
};
