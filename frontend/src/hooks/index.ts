import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehousesApi, productsApi, inventoryApi, suppliersApi, purchaseOrdersApi, forecastingApi, notificationsApi, usersApi, dashboardApi } from '../api';

// ── Warehouses ──
export const useWarehouses = (params?: Record<string, unknown>) =>
  useQuery({ queryKey: ['warehouses', params], queryFn: () => warehousesApi.getAll(params) });

export const useWarehouse = (id: string) =>
  useQuery({ queryKey: ['warehouses', id], queryFn: () => warehousesApi.getById(id), enabled: !!id });

export const useCreateWarehouse = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: warehousesApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['warehouses'] }) });
};
export const useUpdateWarehouse = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: unknown }) => warehousesApi.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['warehouses'] }) });
};
export const useDeleteWarehouse = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: warehousesApi.delete, onSuccess: () => qc.invalidateQueries({ queryKey: ['warehouses'] }) });
};

// ── Products ──
export const useProducts = (params?: Record<string, unknown>) =>
  useQuery({ queryKey: ['products', params], queryFn: () => productsApi.getAll(params) });

export const useProduct = (id: string) =>
  useQuery({ queryKey: ['products', id], queryFn: () => productsApi.getById(id), enabled: !!id });

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: productsApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }) });
};
export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: unknown }) => productsApi.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }) });
};
export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: productsApi.delete, onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }) });
};
export const useLowStockProducts = () =>
  useQuery({ queryKey: ['products', 'low-stock'], queryFn: productsApi.getLowStock });

// ── Inventory ──
export const useStockMovements = (params?: Record<string, unknown>) =>
  useQuery({ queryKey: ['inventory', 'movements', params], queryFn: () => inventoryApi.getMovements(params) });

export const useInventoryLevels = (warehouseId?: string) =>
  useQuery({ queryKey: ['inventory', 'levels', warehouseId], queryFn: () => inventoryApi.getLevels(warehouseId) });

export const useStockIn = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: inventoryApi.stockIn, onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); qc.invalidateQueries({ queryKey: ['inventory'] }); } });
};
export const useStockOut = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: inventoryApi.stockOut, onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); qc.invalidateQueries({ queryKey: ['inventory'] }); } });
};
export const useTransfer = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: inventoryApi.transfer, onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); qc.invalidateQueries({ queryKey: ['inventory'] }); } });
};

// ── Suppliers ──
export const useSuppliers = (params?: Record<string, unknown>) =>
  useQuery({ queryKey: ['suppliers', params], queryFn: () => suppliersApi.getAll(params) });

export const useSupplier = (id: string) =>
  useQuery({ queryKey: ['suppliers', id], queryFn: () => suppliersApi.getById(id), enabled: !!id });

export const useCreateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: suppliersApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }) });
};
export const useUpdateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: unknown }) => suppliersApi.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }) });
};
export const useDeleteSupplier = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: suppliersApi.delete, onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }) });
};

// ── Purchase Orders ──
export const usePurchaseOrders = (params?: Record<string, unknown>) =>
  useQuery({ queryKey: ['purchase-orders', params], queryFn: () => purchaseOrdersApi.getAll(params) });

export const usePurchaseOrder = (id: string) =>
  useQuery({ queryKey: ['purchase-orders', id], queryFn: () => purchaseOrdersApi.getById(id), enabled: !!id });

export const useCreatePO = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: purchaseOrdersApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['purchase-orders'] }) });
};
export const useUpdatePOStatus = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) => purchaseOrdersApi.updateStatus(id, status, notes), onSuccess: () => qc.invalidateQueries({ queryKey: ['purchase-orders'] }) });
};

// ── Forecasting ──
export const useForecast = (productId: string, periods: number, model: string) =>
  useQuery({ queryKey: ['forecast', productId, periods, model], queryFn: () => forecastingApi.forecast(productId, periods, model), enabled: !!productId });

export const useForecastDashboard = () =>
  useQuery({ queryKey: ['forecast', 'dashboard'], queryFn: forecastingApi.getDashboard });

export const useOracleAnalytics = () =>
  useQuery({ queryKey: ['oracle-analytics'], queryFn: forecastingApi.getOracleAnalytics });

// ── Notifications ──
export const useNotifications = (params?: Record<string, unknown>) =>
  useQuery({ queryKey: ['notifications', params], queryFn: () => notificationsApi.getAll(params), refetchInterval: 30000 });

export const useMarkRead = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: notificationsApi.markRead, onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
};
export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: notificationsApi.markAllRead, onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
};

// ── Users ──
export const useUsers = (params?: Record<string, unknown>) =>
  useQuery({ queryKey: ['users', params], queryFn: () => usersApi.getAll(params) });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: usersApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }) });
};
export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: unknown }) => usersApi.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }) });
};
export const useToggleUserActive = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: usersApi.toggleActive, onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }) });
};

// ── Dashboard ──
export const useDashboardStats = () =>
  useQuery({ queryKey: ['dashboard', 'stats'], queryFn: dashboardApi.getStats, refetchInterval: 60000 });
export const useInventoryTrends = () =>
  useQuery({ queryKey: ['dashboard', 'inventory-trends'], queryFn: dashboardApi.getInventoryTrends });
export const useSupplierPerformance = () =>
  useQuery({ queryKey: ['dashboard', 'supplier-performance'], queryFn: dashboardApi.getSupplierPerformance });
export const useWarehouseUtilization = () =>
  useQuery({ queryKey: ['dashboard', 'warehouse-utilization'], queryFn: dashboardApi.getWarehouseUtilization });
export const useAuditLogs = (params?: Record<string, unknown>) =>
  useQuery({ queryKey: ['audit-logs', params], queryFn: () => dashboardApi.getAuditLogs(params) });
