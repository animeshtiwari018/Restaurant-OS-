import { Order } from '../models/Order.js';
import { MenuItem } from '../models/MenuItem.js';
import { TableSession } from '../models/TableSession.js';
import { ORDER_STATUS, TABLE_SESSION_STATUS } from '../constants.js';
import { ApiError } from '../utils/apiError.js';

export const OrderService = {
    /**
     * Create an order from customer cart
     * Enforces authoritative pricing & active session check
     */
    async createOrder({ sessionId, rawItems, customerPhone, customerNotes }) {
        if (!sessionId) {
            throw new ApiError(400, 'Table session ID is required.');
        }

        if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
            throw new ApiError(400, 'Cart must contain at least one item.');
        }

        // 1. Verify Table Session
        const session = await TableSession.findById(sessionId);
        if (!session) {
            throw new ApiError(404, 'Active table session not found.');
        }

        if (session.status === TABLE_SESSION_STATUS.CLOSED || session.status === TABLE_SESSION_STATUS.CANCELLED) {
            throw new ApiError(400, `Cannot place order on a ${session.status} table session.`);
        }

        // 2. Fetch authoritative menu items
        const itemIds = rawItems.map((item) => item.menu_item_id);
        const dbMenuItems = await MenuItem.find({ _id: { $in: itemIds } });
        const dbItemMap = new Map(dbMenuItems.map((item) => [item._id.toString(), item]));

        let subtotalPaise = 0;
        const itemSnapshots = [];

        for (const rawItem of rawItems) {
            const dbItem = dbItemMap.get(rawItem.menu_item_id.toString());
            if (!dbItem) {
                throw new ApiError(404, `Menu item with ID ${rawItem.menu_item_id} does not exist.`);
            }

            if (!dbItem.is_available) {
                throw new ApiError(400, `Item "${dbItem.name}" is currently sold out / unavailable.`);
            }

            const quantity = parseInt(rawItem.quantity, 10);
            if (isNaN(quantity) || quantity <= 0) {
                throw new ApiError(400, `Invalid quantity for item "${dbItem.name}".`);
            }

            // Authoritative server calculation
            const itemSubtotal = dbItem.price_paise * quantity;
            subtotalPaise += itemSubtotal;

            itemSnapshots.push({
                menu_item_id: dbItem._id,
                name: dbItem.name,
                unit_price_paise: dbItem.price_paise,
                quantity,
                subtotal_paise: itemSubtotal,
                special_instructions: rawItem.special_instructions ? rawItem.special_instructions.trim() : ''
            });
        }

        // 3. Tax calculation: Standard 5% GST for restaurant services (in integer paise)
        const taxPaise = Math.round(subtotalPaise * 0.05);
        const totalAmountPaise = subtotalPaise + taxPaise;

        // 4. Create Order
        const order = await Order.create({
            table_session_id: session._id,
            table_number: session.table_number,
            customer_phone: customerPhone || session.customer_phone || null,
            customer_notes: customerNotes ? customerNotes.trim() : '',
            items: itemSnapshots,
            subtotal_paise: subtotalPaise,
            tax_paise: taxPaise,
            total_amount_paise: totalAmountPaise,
            status: ORDER_STATUS.PENDING_VERIFICATION
        });

        // 5. Update session to ACTIVE_SERVICE if it was OPEN
        if (session.status === TABLE_SESSION_STATUS.OPEN) {
            session.status = TABLE_SESSION_STATUS.ACTIVE_SERVICE;
            if (customerPhone && !session.customer_phone) {
                session.customer_phone = customerPhone;
            }
            await session.save();
        }

        return order;
    }
};

export default OrderService;
