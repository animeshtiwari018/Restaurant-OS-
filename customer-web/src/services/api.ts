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
  timeout: 15000,
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
};

// Dining Session API Services
export const sessionApi = {
  async resolveToken(token: string) {
    const res = await apiClient.get(`/tables/qr/${token}`);
    return res.data?.data || res.data;
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
    const res = await apiClient.get(`/billing/session/${sessionId}`);
    return res.data?.data || res.data;
  },

  async settleBill(sessionId: string, paymentMethod: 'UPI' | 'CARD' | 'CASH', amountPaise: number) {
    const res = await apiClient.post(`/billing/session/${sessionId}/settle`, {
      paymentMethod,
      amountPaise,
    });
    return res.data?.data || res.data;
  },
};

export default apiClient;
