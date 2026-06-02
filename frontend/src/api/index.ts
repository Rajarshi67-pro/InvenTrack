import api from './client';
import { LoginRequest, LoginResponse, User, ApiResponse } from '../types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/login', data);
    return res.data.data!;
  },
  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken });
  },
  refresh: async (refreshToken: string) => {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/refresh', { refreshToken });
    return res.data.data!;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data!;
  },
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const res = await api.put<ApiResponse<User>>('/auth/me', data);
    return res.data.data!;
  },
  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },
  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, password });
  },
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await api.put('/auth/change-password', { oldPassword, newPassword });
  },
};

export const warehousesApi = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get('/warehouses', { params });
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/warehouses/${id}`);
    return res.data.data;
  },
  create: async (data: unknown) => {
    const res = await api.post('/warehouses', data);
    return res.data.data;
  },
  update: async (id: string, data: unknown) => {
    const res = await api.put(`/warehouses/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string) => {
    await api.delete(`/warehouses/${id}`);
  },
  getUtilization: async (id: string) => {
    const res = await api.get(`/warehouses/${id}/utilization`);
    return res.data.data;
  },
  getInventory: async (id: string) => {
    const res = await api.get(`/warehouses/${id}/inventory`);
    return res.data.data;
  },
};

export const productsApi = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get('/products', { params });
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/products/${id}`);
    return res.data.data;
  },
  create: async (data: unknown) => {
    const res = await api.post('/products', data);
    return res.data.data;
  },
  update: async (id: string, data: unknown) => {
    const res = await api.put(`/products/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string) => {
    await api.delete(`/products/${id}`);
  },
  getBarcode: async (id: string) => {
    const res = await api.get(`/products/${id}/barcode`);
    return res.data.data;
  },
  findByBarcode: async (barcode: string) => {
    const res = await api.get('/products/barcode', { params: { barcode } });
    return res.data.data;
  },
  getLowStock: async () => {
    const res = await api.get('/products/low-stock');
    return res.data.data;
  },
};

export const inventoryApi = {
  stockIn: async (data: unknown) => {
    const res = await api.post('/inventory/stock-in', data);
    return res.data.data;
  },
  stockOut: async (data: unknown) => {
    const res = await api.post('/inventory/stock-out', data);
    return res.data.data;
  },
  transfer: async (data: unknown) => {
    const res = await api.post('/inventory/transfer', data);
    return res.data.data;
  },
  adjustment: async (data: unknown) => {
    const res = await api.post('/inventory/adjustment', data);
    return res.data.data;
  },
  getMovements: async (params?: Record<string, unknown>) => {
    const res = await api.get('/inventory/movements', { params });
    return res.data.data;
  },
  getLevels: async (warehouseId?: string) => {
    const res = await api.get('/inventory/levels', { params: { warehouseId } });
    return res.data.data;
  },
};

export const suppliersApi = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get('/suppliers', { params });
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/suppliers/${id}`);
    return res.data.data;
  },
  create: async (data: unknown) => {
    const res = await api.post('/suppliers', data);
    return res.data.data;
  },
  update: async (id: string, data: unknown) => {
    const res = await api.put(`/suppliers/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string) => {
    await api.delete(`/suppliers/${id}`);
  },
  getPerformance: async (id: string) => {
    const res = await api.get(`/suppliers/${id}/performance`);
    return res.data.data;
  },
};

export const purchaseOrdersApi = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get('/purchase-orders', { params });
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/purchase-orders/${id}`);
    return res.data.data;
  },
  create: async (data: unknown) => {
    const res = await api.post('/purchase-orders', data);
    return res.data.data;
  },
  updateStatus: async (id: string, status: string, notes?: string) => {
    const res = await api.patch(`/purchase-orders/${id}/status`, { status, notes });
    return res.data.data;
  },
  delete: async (id: string) => {
    await api.delete(`/purchase-orders/${id}`);
  },
};

export const forecastingApi = {
  forecast: async (productId: string, periods: number, model: string) => {
    const res = await api.post('/forecasting/forecast', { productId, periods, model });
    return res.data.data;
  },
  getDashboard: async () => {
    const res = await api.get('/forecasting/dashboard');
    return res.data.data;
  },
  getOracleAnalytics: async () => {
    const res = await api.get('/forecasting/oracle-analytics');
    return res.data.data;
  },
};

export const reportsApi = {
  generate: async (type: string, filters: unknown) => {
    const res = await api.post('/reports/generate', { type, ...filters as object }, { responseType: 'blob' });
    return res.data;
  },
};

export const notificationsApi = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get('/notifications', { params });
    return res.data.data;
  },
  markRead: async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
  },
  markAllRead: async () => {
    await api.patch('/notifications/read-all');
  },
  delete: async (id: string) => {
    await api.delete(`/notifications/${id}`);
  },
};

export const usersApi = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get('/users', { params });
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/users/${id}`);
    return res.data.data;
  },
  create: async (data: unknown) => {
    const res = await api.post('/auth/register', data);
    return res.data.data;
  },
  update: async (id: string, data: unknown) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data.data;
  },
  toggleActive: async (id: string) => {
    const res = await api.patch(`/users/${id}/toggle-active`);
    return res.data.data;
  },
};

export const dashboardApi = {
  getStats: async () => {
    const res = await api.get('/dashboard/stats');
    return res.data.data;
  },
  getInventoryTrends: async () => {
    const res = await api.get('/dashboard/inventory-trends');
    return res.data.data;
  },
  getSupplierPerformance: async () => {
    const res = await api.get('/dashboard/supplier-performance');
    return res.data.data;
  },
  getWarehouseUtilization: async () => {
    const res = await api.get('/dashboard/warehouse-utilization');
    return res.data.data;
  },
  getStockMovements: async () => {
    const res = await api.get('/dashboard/stock-movements');
    return res.data.data;
  },
  getAuditLogs: async (params?: Record<string, unknown>) => {
    const res = await api.get('/dashboard/audit-logs', { params });
    return res.data.data;
  },
};
