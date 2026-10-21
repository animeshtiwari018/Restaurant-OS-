/**
 * Domain Models & Types for Restro Manage
 * Strictly aligned with backend database schema and Stitch UI
 */

export type DietaryLabel = 'VEG' | 'NON_VEG' | 'VEGAN' | 'GLUTEN_FREE';

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  basis: string; // e.g. "Per 250g serving"
}

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price_paise: number; // authoritative integer paise
  image_url?: string;
  image_urls?: string[];
  category_id: string;
  dietary_labels: DietaryLabel[];
  allergens: string[];
  nutrition: NutritionInfo;
  prep_time_minutes: number;
  is_available: boolean;
  rating?: number;
  rating_count?: number;
  is_chef_pick?: boolean;
}

export interface MenuCategory {
  _id: string;
  name: string;
  slug: string;
  item_count: number;
  icon?: string;
}

export interface CartItem {
  menu_item_id: string;
  item: MenuItem;
  quantity: number;
  special_instructions?: string;
}

export type OrderStatus =
  | 'PENDING_VERIFICATION'
  | 'CLAIMED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type KitchenItemStatus = 'QUEUED' | 'PREPARING' | 'READY';

export interface OrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  price_paise: number;
  special_instructions?: string;
  status?: KitchenItemStatus;
}

export interface Order {
  _id: string;
  session_id: string;
  order_number: string;
  table_number: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal_paise: number;
  tax_paise: number;
  total_paise: number;
  created_at: string;
  waiter_name?: string;
}

export interface BillSummary {
  sessionId: string;
  subtotalPaise: number;
  taxPaise: number; // 5% GST
  totalPaise: number;
  paidPaise: number;
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'SETTLED';
  orders?: Order[];
}

export interface TableSession {
  sessionId: string;
  tableNumber: string;
  floor: string;
  status: 'OPEN' | 'ACTIVE_SERVICE' | 'AWAITING_SETTLEMENT' | 'CLOSED';
  waiterName?: string;
  guestCount?: number;
}

export interface KitchenTicketItem {
  id: string;
  name: string;
  quantity: number;
  special_instructions?: string;
  status: KitchenItemStatus;
}

export interface KitchenTicket {
  id: string;
  order_id: string;
  table_number: string;
  station: 'Curry' | 'Tandoor & Breads' | 'Beverages';
  items: KitchenTicketItem[];
  created_at: string;
  elapsed_minutes: number;
  status: 'QUEUED' | 'PREPARING' | 'READY';
}
