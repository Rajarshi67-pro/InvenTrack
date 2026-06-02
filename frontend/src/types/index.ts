// =====================================================
// FRONTEND TYPES — InvenTrack Pro
// =====================================================

export type UserRole = 'ADMIN' | 'MANAGER';

export type StockMovementType = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';

export type POStatus = 'DRAFT' | 'APPROVED' | 'ORDERED' | 'DELIVERED' | 'CANCELLED';

export type StockStatus = 'NORMAL' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK';

export type NotificationType =
  | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK'
  | 'PO_CREATED' | 'PO_APPROVED'
  | 'SUPPLIER_DELAY' | 'FORECAST_WARNING' | 'CAPACITY_WARNING';

export type ForecastModel = 'MOVING_AVERAGE' | 'LINEAR_REGRESSION' | 'ARIMA';

export type ExportFormat = 'PDF' | 'EXCEL' | 'CSV';

export type ReportType = 'INVENTORY' | 'WAREHOUSE' | 'SUPPLIER' | 'PURCHASE' | 'FORECAST';

// ── Auth ──
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  warehouseId?: string;
  isActive: number;
  lastLogin?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginRequest { email: string; password: string; }
export interface LoginResponse {
  user: User;
  tokens: { accessToken: string; refreshToken: string; expiresIn: number; };
}

// ── Warehouse ──
export interface Warehouse {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode?: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  capacity: number;
  currentStockCount: number;
  utilizationPercent: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseDto {
  name: string; address: string; city: string; state: string;
  country: string; pinCode?: string; contactPerson: string;
  contactPhone: string; contactEmail?: string; capacity: number;
}

// ── Product ──
export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  description?: string;
  unitPrice: number;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  unitOfMeasure: string;
  weight?: number;
  dimensions?: string;
  barcode?: string;
  barcodeType: string;
  warehouseId?: string;
  supplierId?: string;
  isActive: number;
  stockStatus: StockStatus;
  inventoryValue: number;
  warehouse?: Warehouse;
  supplier?: Supplier;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string; sku: string; category: string; description?: string;
  unitPrice: number; warehouseId: string; quantity: number;
  minStockLevel: number; maxStockLevel: number; reorderPoint: number;
  unitOfMeasure: string; weight?: number; dimensions?: string; supplierId?: string;
}

// ── Supplier ──
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  gstNumber?: string;
  leadTimeDays: number;
  paymentTerms?: string;
  rating: number;
  totalOrders: number;
  onTimeDeliveries: number;
  deliveryPerformance: number;
  notes?: string;
  isActive: number;
  createdAt: string;
}

export interface CreateSupplierDto {
  name: string; contactPerson: string; phone: string; email: string;
  address: string; city: string; state: string; country: string;
  gstNumber?: string; leadTimeDays: number; paymentTerms?: string; notes?: string;
}

// ── Purchase Order ──
export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  warehouseId: string;
  createdBy: string;
  approvedBy?: string;
  status: POStatus;
  totalAmount: number;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  notes?: string;
  supplier: Supplier;
  warehouse: Warehouse;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity: number;
  product: Product;
}

export interface CreatePODto {
  supplierId: string; warehouseId: string;
  expectedDeliveryDate: string; notes?: string;
  items: { productId: string; quantity: number; unitPrice: number; }[];
}

// ── Inventory / Stock ──
export interface StockMovement {
  id: string;
  productId: string;
  warehouseId: string;
  movementType: StockMovementType;
  quantity: number;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  batchNumber?: string;
  unitCost?: number;
  performedBy: string;
  remarks?: string;
  wasBarcodeScan: number;
  product: Product;
  warehouse: Warehouse;
  createdAt: string;
}

export interface StockInDto { productId: string; warehouseId: string; quantity: number; purchaseOrderId?: string; batchNumber?: string; expiryDate?: string; unitCost?: number; remarks?: string; }
export interface StockOutDto { productId: string; warehouseId: string; quantity: number; remarks?: string; }
export interface StockTransferDto { productId: string; fromWarehouseId: string; toWarehouseId: string; quantity: number; remarks?: string; }
export interface StockAdjustmentDto { productId: string; warehouseId: string; newQuantity: number; reason: string; }

// ── Forecasting ──
export interface ForecastPeriod {
  period: number;
  label: string;
  predictedDemand: number;
  upperBound: number;
  lowerBound: number;
}

export interface ForecastResult {
  productId: string;
  productName: string;
  model: ForecastModel;
  predictions: ForecastPeriod[];
  reorderSuggestion: number;
  safetyStock: number;
  accuracy: number;
}

// ── Notification ──
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  isRead: number;
  severity: string;
  createdAt: string;
}

// ── Dashboard ──
export interface DashboardStats {
  totalWarehouses: number;
  totalProducts: number;
  totalSuppliers: number;
  totalInventoryValue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  pendingPurchaseOrders: number;
  incomingShipments: number;
  activeAlerts: number;
}

// ── API ──
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
