// =====================================================
// SHARED TYPESCRIPT TYPES — InvenTrack Pro
// =====================================================

export type UserRole = 'ADMIN' | 'MANAGER';

export type StockMovementType = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';

export type PurchaseOrderStatus = 'DRAFT' | 'APPROVED' | 'ORDERED' | 'DELIVERED' | 'CANCELLED';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type NotificationType = 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK' | 'PO_CREATED' | 'PO_APPROVED' | 'SUPPLIER_DELAY' | 'FORECAST_WARNING' | 'CAPACITY_WARNING';

export type ForecastModel = 'MOVING_AVERAGE' | 'LINEAR_REGRESSION' | 'ARIMA';

export type ExportFormat = 'PDF' | 'EXCEL' | 'CSV';

export type ReportType = 'INVENTORY' | 'WAREHOUSE' | 'SUPPLIER' | 'PURCHASE' | 'FORECAST';

// ── Pagination ──
export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
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

// ── API Response ──
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// ── Auth ──
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  warehouseId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    warehouseId?: string;
    lastLogin?: Date;
  };
  tokens: AuthTokens;
}

// ── Warehouse ──
export interface CreateWarehouseDto {
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
}

export interface UpdateWarehouseDto extends Partial<CreateWarehouseDto> {
  isActive?: boolean;
}

// ── Product ──
export interface CreateProductDto {
  name: string;
  sku: string;
  categoryId: string;
  description?: string;
  unitPrice: number;
  warehouseId: string;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  unitOfMeasure: string;
  weight?: number;
  dimensions?: string;
  supplierId?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  isActive?: boolean;
}

// ── Inventory ──
export interface StockInDto {
  productId: string;
  warehouseId: string;
  quantity: number;
  purchaseOrderId?: string;
  batchNumber?: string;
  expiryDate?: Date;
  unitCost?: number;
  remarks?: string;
}

export interface StockOutDto {
  productId: string;
  warehouseId: string;
  quantity: number;
  remarks?: string;
}

export interface StockTransferDto {
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  remarks?: string;
}

export interface StockAdjustmentDto {
  productId: string;
  warehouseId: string;
  newQuantity: number;
  reason: string;
}

// ── Supplier ──
export interface CreateSupplierDto {
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
  notes?: string;
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> {
  isActive?: boolean;
  rating?: number;
}

// ── Purchase Order ──
export interface CreatePODto {
  supplierId: string;
  warehouseId: string;
  expectedDeliveryDate: Date;
  items: POItemDto[];
  notes?: string;
}

export interface POItemDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdatePOStatusDto {
  status: PurchaseOrderStatus;
  notes?: string;
}

// ── Forecasting ──
export interface ForecastRequest {
  productId: string;
  periods: number;
  model: ForecastModel;
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

export interface ForecastPeriod {
  period: number;
  label: string;
  predictedDemand: number;
  upperBound: number;
  lowerBound: number;
}

// ── Report ──
export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  warehouseId?: string;
  productId?: string;
  supplierId?: string;
  format?: ExportFormat;
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

// ── Request extension ──
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
        warehouseId?: string;
      };
    }
  }
}
