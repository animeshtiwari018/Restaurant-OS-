import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { MenuItem, MenuCategory, Order, BillSummary, KitchenTicket, KitchenItemStatus } from '@/types/dining';

export const getApiBaseUrl = (): string => {
  const defaultUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return defaultUrl.replace('localhost', hostname).replace('127.0.0.1', hostname);
    }
  }
  return defaultUrl;
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to dynamically attach auth token and ensure dynamic baseURL
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.baseURL = getApiBaseUrl();
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('restro_auth_token') || localStorage.getItem('restro_session_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Menu API Services
export const menuApi = {
  async getCategories(): Promise<MenuCategory[]> {
    const res = await apiClient.get('/menu/categories');
    return res.data?.data || res.data || [];
  },

  async getMenuItems(categoryId?: string): Promise<MenuItem[]> {
    const params = categoryId ? { category_id: categoryId } : {};
    const res = await apiClient.get('/menu/items', { params });
    return res.data?.data || res.data || [];
  },

  async getMenuItemById(id: string): Promise<MenuItem> {
    const res = await apiClient.get(`/menu/items/${id}`);
    return res.data?.data || res.data;
  },

  async createMenuItem(payload: any): Promise<MenuItem> {
    const res = await apiClient.post('/menu/items', payload);
    return res.data?.data || res.data;
  },

  async updateMenuItem(id: string, payload: any): Promise<MenuItem> {
    const res = await apiClient.put(`/menu/items/${id}`, payload);
    return res.data?.data || res.data;
  },

  async toggleItemAvailability(id: string, is_available: boolean): Promise<MenuItem> {
    const res = await apiClient.patch(`/menu/items/${id}`, { is_available });
    return res.data?.data || res.data;
  },
};

// Dining Session API Services
export const sessionApi = {
  async resolveToken(token: string) {
    const res = await apiClient.get('/tables/verify-session', { params: { token } });
    const data = res.data?.data || res.data;
    return {
      tableNumber: data.table?.table_number || data.session?.table_number || data.tableNumber,
      floor: data.table?.floor || data.floor || 'Ground Floor Dining',
      sessionId: data.session?._id || data.sessionId,
      sessionToken: data.sessionToken,
      waiterName: data.session?.waiter_name || data.waiterName || 'Rahul S.',
      ...data,
    };
  },

  async getSession(sessionId: string) {
    const res = await apiClient.get(`/sessions/${sessionId}`);
    return res.data?.data || res.data;
  },

  async pingWaiter(sessionId: string, type: 'WATER' | 'ASSISTANCE' | 'CLEANING' = 'ASSISTANCE') {
    const res = await apiClient.post(`/sessions/${sessionId}/call-waiter`, { type });
    return res.data?.data || res.data;
  },
};

// Customer Orders API Services
export const orderApi = {
  async placeOrder(payload: {
    session_id: string;
    items: { menu_item_id: string; quantity: number; special_instructions?: string }[];
  }): Promise<Order> {
    const res = await apiClient.post('/orders', payload);
    return res.data?.data || res.data;
  },

  async getOrder(orderId: string): Promise<Order> {
    const res = await apiClient.get(`/orders/${orderId}`);
    return res.data?.data || res.data;
  },

  async getSessionOrders(sessionId: string): Promise<Order[]> {
    const res = await apiClient.get(`/orders/session/${sessionId}`);
    return res.data?.data || res.data || [];
  },
};

// Waiter Terminal Services
export const waiterApi = {
  async getQueueOrders(): Promise<Order[]> {
    const res = await apiClient.get('/orders/waiter/queue');
    return res.data?.data || res.data || [];
  },

  async claimOrder(orderId: string): Promise<Order> {
    const res = await apiClient.post(`/orders/${orderId}/claim`);
    return res.data?.data || res.data;
  },

  async verifyOrder(
    orderId: string,
    action: 'CONFIRM' | 'REJECT',
    verificationData?: { customerPresent: boolean; allergensReviewed: boolean; rejectionReason?: string }
  ): Promise<Order> {
    const res = await apiClient.post(`/orders/${orderId}/verify`, {
      action,
      ...verificationData,
    });
    return res.data?.data || res.data;
  },
};

// Kitchen Display Services
export const kitchenApi = {
  async getTickets(station?: string): Promise<KitchenTicket[]> {
    const params = station ? { station } : {};
    const res = await apiClient.get('/kitchen/tickets', { params });
    return res.data?.data || res.data || [];
  },

  async updateItemStatus(ticketId: string, itemId: string, status: KitchenItemStatus) {
    const res = await apiClient.patch(`/kitchen/tickets/${ticketId}/items/${itemId}/status`, { status });
    return res.data?.data || res.data;
  },
};

// Billing & Settlement Services
export const billingApi = {
  async getBillSummary(sessionId: string): Promise<BillSummary> {
    const res = await apiClient.get(`/billing/sessions/${sessionId}`);
    return res.data?.data || res.data;
  },

  async settleBill(sessionId: string, paymentMethod: 'UPI' | 'CARD' | 'CASH', amountPaise: number) {
    const res = await apiClient.post(`/billing/sessions/${sessionId}/settle`, {
      paymentMethod,
      amountPaise,
    });
    return res.data?.data || res.data;
  },
};

// Staff Authentication Services
export const authApi = {
  async staffLogin(credentials: { email?: string; password?: string; pin?: string; staff_id?: string }) {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data?.data || res.data;
  },

  async getOnDutyStaff(): Promise<any[]> {
    const res = await apiClient.get('/auth/staff/on-duty');
    return res.data?.data || res.data || [];
  },

  async waiterPinLogin(staffId: string, pin: string) {
    const res = await apiClient.post('/auth/login', { staff_id: staffId, pin });
    return res.data?.data || res.data;
  },

  async getStaffProfile() {
    const res = await apiClient.get('/auth/me');
    return res.data?.data || res.data;
  },
};

// Client-side Staff Session Helpers
export const staffAuth = {
  setSession(token: string, staff: { id: string; name: string; email: string; role: string }) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('restro_staff_token', token);
    localStorage.setItem('restro_staff_user', JSON.stringify(staff));
    // Set cookie for Next.js Route Guard Middleware (expires in 24h)
    document.cookie = `staff_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`;
  },

  clearSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('restro_staff_token');
    localStorage.removeItem('restro_staff_user');
    document.cookie = 'staff_token=; path=/; max-age=0; SameSite=Lax';
  },

  getUser(): { id: string; name: string; email: string; role: string } | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('restro_staff_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('restro_staff_token');
  },
};

export default apiClient;
