import jwt from 'jsonwebtoken';
import { Staff } from '../models/Staff.js';
import { STAFF_ROLES } from '../constants.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

const JWT_SECRET = process.env.STAFF_JWT_SECRET || process.env.JWT_SECRET || 'fallback_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Register a new staff member (Admin or onboarding)
 */
export const registerStaff = asyncHandler(async (req, res) => {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, 'Name, email, and password are required.');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingStaff = await Staff.findOne({ email: normalizedEmail });
    if (existingStaff) {
        throw new ApiError(409, 'Staff with this email already exists.');
    }

    const assignedRole = role && Object.values(STAFF_ROLES).includes(role) ? role : STAFF_ROLES.WAITER;
    const passwordHash = await hashPassword(password);

    const staff = await Staff.create({
        name,
        email: normalizedEmail,
        password_hash: passwordHash,
        role: assignedRole,
        phone
    });

    const staffResponse = {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        phone: staff.phone
    };

    return res.status(201).json(
        new ApiResponse(201, staffResponse, 'Staff member registered successfully.')
    );
});

/**
 * Staff Login
 */
export const loginStaff = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, 'Email and password are required.');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const staff = await Staff.findOne({ email: normalizedEmail, is_active: true });
    if (!staff) {
        throw new ApiError(401, 'Invalid email or password.');
    }

    const isMatch = await comparePassword(password, staff.password_hash);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid email or password.');
    }

    const token = jwt.sign(
        {
            id: staff._id,
            name: staff.name,
            email: staff.email,
            role: staff.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json(
        new ApiResponse(200, {
            token,
            staff: {
                id: staff._id,
                name: staff.name,
                email: staff.email,
                role: staff.role
            }
        }, 'Login successful.')
    );
});

/**
 * Get current staff profile
 */
export const getStaffProfile = asyncHandler(async (req, res) => {
    const staff = await Staff.findById(req.staff.id).select('-password_hash');
    if (!staff) {
        throw new ApiError(404, 'Staff member not found.');
    }

    return res.status(200).json(
        new ApiResponse(200, staff, 'Profile fetched successfully.')
    );
});
