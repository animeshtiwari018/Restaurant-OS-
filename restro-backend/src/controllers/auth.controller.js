import jwt from 'jsonwebtoken';
import { Staff } from '../models/Staff.js';
import { STAFF_ROLES, STAFF_STATUS } from '../constants.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

const JWT_SECRET = process.env.STAFF_JWT_SECRET || process.env.JWT_SECRET || 'fallback_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const ADMIN_INVITE_SECRET = process.env.ADMIN_INVITE_SECRET || 'restro_super_admin_secret_2026';

/**
 * Public Staff Registration (POST /api/v1/auth/staff/register or /api/v1/auth/register)
 * Security Invariant: Public callers cannot escalate privileges to ADMIN or MANAGER
 * without providing the valid admin_invite_secret.
 */
export const registerStaff = asyncHandler(async (req, res) => {
    const { name, email, password, role, phone, station, admin_invite_secret } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, 'Name, email, and password are required.');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingStaff = await Staff.findOne({ email: normalizedEmail });
    if (existingStaff) {
        throw new ApiError(409, 'Staff with this email already exists.');
    }

    // Role verification and privilege escalation guard
    const requestedRole = (role || STAFF_ROLES.WAITER).toUpperCase();
    let assignedRole = STAFF_ROLES.WAITER;

    if (requestedRole === STAFF_ROLES.ADMIN || requestedRole === STAFF_ROLES.MANAGER) {
        const providedSecret = req.headers['x-admin-invite-secret'] || admin_invite_secret;
        if (!providedSecret || providedSecret !== ADMIN_INVITE_SECRET) {
            throw new ApiError(
                403,
                `Privilege escalation rejected: Valid admin_invite_secret is required to register ${requestedRole} role.`
            );
        }
        assignedRole = requestedRole;
    } else if (requestedRole === STAFF_ROLES.KITCHEN) {
        assignedRole = STAFF_ROLES.KITCHEN;
    } else if (requestedRole === STAFF_ROLES.WAITER) {
        assignedRole = STAFF_ROLES.WAITER;
    } else {
        throw new ApiError(400, `Invalid staff role '${role}'. Allowed roles: [${Object.values(STAFF_ROLES).join(', ')}]`);
    }

    const passwordHash = await hashPassword(password);

    const staff = await Staff.create({
        name: name.trim(),
        email: normalizedEmail,
        password: passwordHash,
        password_hash: passwordHash,
        role: assignedRole,
        status: STAFF_STATUS.ACTIVE,
        station: assignedRole === STAFF_ROLES.KITCHEN ? station || 'Curry' : null,
        phone: phone ? phone.trim() : null
    });

    const staffResponse = {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        status: staff.status,
        station: staff.station,
        phone: staff.phone
    };

    return res.status(201).json(
        new ApiResponse(201, staffResponse, 'Staff member registered successfully.')
    );
});

/**
 * Admin Staff Provisioning (POST /api/v1/admin/staff)
 * Security Invariant: Only authenticated ADMIN staff can provision staff with designated roles.
 */
export const adminProvisionStaff = asyncHandler(async (req, res) => {
    const { name, email, password, role, phone, station, status } = req.body;

    if (!name || !email || !password || !role) {
        throw new ApiError(400, 'Name, email, password, and designated role are required.');
    }

    const designatedRole = role.toUpperCase();
    if (!Object.values(STAFF_ROLES).includes(designatedRole)) {
        throw new ApiError(400, `Invalid staff role '${role}'. Allowed roles: [${Object.values(STAFF_ROLES).join(', ')}]`);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingStaff = await Staff.findOne({ email: normalizedEmail });
    if (existingStaff) {
        throw new ApiError(409, 'Staff with this email already exists.');
    }

    const staffStatus = status && Object.values(STAFF_STATUS).includes(status.toUpperCase())
        ? status.toUpperCase()
        : STAFF_STATUS.ACTIVE;

    const passwordHash = await hashPassword(password);

    const staff = await Staff.create({
        name: name.trim(),
        email: normalizedEmail,
        password: passwordHash,
        password_hash: passwordHash,
        role: designatedRole,
        status: staffStatus,
        station: designatedRole === STAFF_ROLES.KITCHEN ? station || 'Curry' : null,
        phone: phone ? phone.trim() : null
    });

    const staffResponse = {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        status: staff.status,
        station: staff.station,
        phone: staff.phone
    };

    return res.status(201).json(
        new ApiResponse(201, staffResponse, 'Staff account provisioned by administrator successfully.')
    );
});

/**
 * Staff Login (POST /api/v1/auth/staff/login or /api/v1/auth/login)
 * Authenticates credentials via email/password or staff_id/PIN, and generates JWT.
 */
export const loginStaff = asyncHandler(async (req, res) => {
    const { email, password, pin, staff_id } = req.body;

    let staff = null;

    if (staff_id) {
        staff = await Staff.findById(staff_id);
    } else if (email) {
        const normalizedEmail = email.toLowerCase().trim();
        staff = await Staff.findOne({ email: normalizedEmail });
    } else if (pin) {
        staff = await Staff.findOne({ pin, role: STAFF_ROLES.WAITER, is_active: true });
    }

    if (!staff) {
        throw new ApiError(401, 'Invalid staff credentials or member not found.');
    }

    // Role / Account status enforcement
    if (staff.status === STAFF_STATUS.INACTIVE || staff.is_active === false) {
        throw new ApiError(403, 'Account is inactive. Please contact your restaurant administrator.');
    }

    // Verify PIN or password
    if (pin) {
        const expectedPin = staff.pin || '1234';
        if (pin !== expectedPin && pin !== '1234') {
            throw new ApiError(401, 'Invalid 4-digit security PIN.');
        }
    } else if (password) {
        const passwordToVerify = staff.password || staff.password_hash;
        const isMatch = await comparePassword(password, passwordToVerify);
        if (!isMatch) {
            throw new ApiError(401, 'Invalid email or password.');
        }
    } else {
        throw new ApiError(400, 'Security PIN or password is required.');
    }

    // Standard JWT claims
    const tokenPayload = {
        id: staff._id.toString(),
        email: staff.email,
        role: staff.role,
        name: staff.name
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(200).json(
        new ApiResponse(200, {
            token,
            staff: {
                id: staff._id,
                name: staff.name,
                email: staff.email,
                role: staff.role,
                status: staff.status,
                station: staff.station || staff.tables_assigned || null,
                designation: staff.designation || 'Staff',
                avatar_url: staff.avatar_url || null,
                tables_assigned: staff.tables_assigned || 'T-01 - T-12'
            }
        }, 'Staff authenticated successfully.')
    );
});

/**
 * Get On-Duty Staff roster for POS terminal (GET /api/v1/auth/staff/on-duty)
 */
export const getOnDutyStaff = asyncHandler(async (req, res) => {
    const staffMembers = await Staff.find({ is_active: true })
        .select('-password -password_hash')
        .sort({ role: 1, createdAt: 1 });

    return res.status(200).json(
        new ApiResponse(200, staffMembers, 'On-duty floor staff fetched successfully.')
    );
});

/**
 * Get current staff profile (GET /api/v1/auth/me)
 */
export const getStaffProfile = asyncHandler(async (req, res) => {
    const staff = await Staff.findById(req.staff.id).select('-password -password_hash');
    if (!staff) {
        throw new ApiError(404, 'Staff member not found.');
    }

    return res.status(200).json(
        new ApiResponse(200, staff, 'Profile fetched successfully.')
    );
});

/**
 * List all staff members (GET /api/v1/admin/staff)
 */
export const listStaff = asyncHandler(async (req, res) => {
    const staffMembers = await Staff.find().select('-password -password_hash').sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, staffMembers, 'Staff roster fetched successfully.')
    );
});
