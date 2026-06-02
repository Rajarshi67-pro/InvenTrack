/**
 * InvenTrack Pro — Complete Mock API Server
 * Runs entirely in-memory. No Oracle DB required.
 * Supports: Auth (JWT), all CRUD, Inventory, Forecasting, Reports, Notifications
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = 'inventrack-mock-secret-key-2025';

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ─── Logging ───────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── In-Memory Data Store ──────────────────────────────────
const uuid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

const USERS = [
  { id: 'user-admin-001', fullName: 'System Administrator', email: 'admin@inventrack.com', passwordHash: bcrypt.hashSync('Admin@123', 10), role: 'ADMIN', isActive: 1, phone: '+91 9876500001', warehouseId: null, lastLogin: null, createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'user-mgr-001', fullName: 'Priya Sharma', email: 'manager@inventrack.com', passwordHash: bcrypt.hashSync('Manager@123', 10), role: 'MANAGER', isActive: 1, phone: '+91 9876500002', warehouseId: 'wh-001', lastLogin: null, createdAt: '2025-01-05T00:00:00.000Z' },
  { id: 'user-mgr-002', fullName: 'Rahul Verma', email: 'rahul@inventrack.com', passwordHash: bcrypt.hashSync('Manager@123', 10), role: 'MANAGER', isActive: 1, phone: '+91 9876500003', warehouseId: 'wh-002', lastLogin: null, createdAt: '2025-02-10T00:00:00.000Z' },
];

const WAREHOUSES = [
  { id: 'wh-001', name: 'Mumbai Central', address: 'Plot 12, MIDC Industrial Area, Andheri East', city: 'Mumbai', state: 'Maharashtra', country: 'India', pinCode: '400093', contactPerson: 'Rajesh Kumar', contactPhone: '+91 9876543210', contactEmail: 'mumbai@inventrack.com', capacity: 10000, currentStockCount: 6240, utilizationPercent: 62, isActive: 1, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: now() },
  { id: 'wh-002', name: 'Delhi North', address: 'Sector 63, Phase IV, NSEZ', city: 'Delhi', state: 'Delhi', country: 'India', pinCode: '201307', contactPerson: 'Amit Singh', contactPhone: '+91 9876543211', contactEmail: 'delhi@inventrack.com', capacity: 8000, currentStockCount: 7120, utilizationPercent: 89, isActive: 1, createdAt: '2025-01-15T00:00:00.000Z', updatedAt: now() },
  { id: 'wh-003', name: 'Bangalore South', address: '45, Electronic City Phase 1', city: 'Bangalore', state: 'Karnataka', country: 'India', pinCode: '560100', contactPerson: 'Sneha Reddy', contactPhone: '+91 9876543212', contactEmail: 'bangalore@inventrack.com', capacity: 12000, currentStockCount: 3600, utilizationPercent: 30, isActive: 1, createdAt: '2025-02-01T00:00:00.000Z', updatedAt: now() },
  { id: 'wh-004', name: 'Hyderabad West', address: 'Hitec City, Madhapur', city: 'Hyderabad', state: 'Telangana', country: 'India', pinCode: '500081', contactPerson: 'Kiran Rao', contactPhone: '+91 9876543213', contactEmail: 'hyderabad@inventrack.com', capacity: 9000, currentStockCount: 7650, utilizationPercent: 85, isActive: 1, createdAt: '2025-03-01T00:00:00.000Z', updatedAt: now() },
];

const SUPPLIERS = [
  { id: 'sup-001', name: 'TechParts India Pvt Ltd', contactPerson: 'Vikram Joshi', phone: '+91 9000111222', email: 'sales@techparts.in', address: '45 Industrial Zone, Pimpri', city: 'Pune', state: 'Maharashtra', country: 'India', gstNumber: '27AABCT1234A1Z5', leadTimeDays: 7, paymentTerms: 'Net 30', rating: 4.2, totalOrders: 47, onTimeDeliveries: 43, deliveryPerformance: 91, isActive: 1, createdAt: '2025-01-10T00:00:00.000Z' },
  { id: 'sup-002', name: 'Global Electronics Corp', contactPerson: 'Sarah Johnson', phone: '+1 555-0100', email: 'orders@globalelec.com', address: '200 Tech Park Boulevard', city: 'Bangalore', state: 'Karnataka', country: 'India', gstNumber: '29AABCG5678B1Z3', leadTimeDays: 14, paymentTerms: 'Net 45', rating: 4.5, totalOrders: 32, onTimeDeliveries: 31, deliveryPerformance: 97, isActive: 1, createdAt: '2025-01-20T00:00:00.000Z' },
  { id: 'sup-003', name: 'Bharat Auto Components', contactPerson: 'Suresh Patel', phone: '+91 8000222333', email: 'info@bharatauto.co.in', address: '78 Auto Nagar', city: 'Rajkot', state: 'Gujarat', country: 'India', gstNumber: '24AABCB9012C1Z1', leadTimeDays: 5, paymentTerms: 'Net 15', rating: 3.8, totalOrders: 28, onTimeDeliveries: 22, deliveryPerformance: 79, isActive: 1, createdAt: '2025-02-05T00:00:00.000Z' },
  { id: 'sup-004', name: 'Premium Packaging Solutions', contactPerson: 'Meena Iyer', phone: '+91 7000333444', email: 'supply@prempack.com', address: '23 Paper Mill Road', city: 'Chennai', state: 'Tamil Nadu', country: 'India', gstNumber: '33AABCP3456D1Z9', leadTimeDays: 3, paymentTerms: 'Advance', rating: 4.7, totalOrders: 156, onTimeDeliveries: 152, deliveryPerformance: 97, isActive: 1, createdAt: '2025-02-15T00:00:00.000Z' },
];

const PRODUCTS = [
  { id: 'prod-001', sku: 'ELEC-LPT-001', name: 'Dell Latitude 7420 Laptop', category: 'Electronics', description: '14" FHD, Intel i7-11th Gen, 16GB RAM, 512GB SSD', unitPrice: 89999, quantity: 45, minStockLevel: 10, maxStockLevel: 200, reorderPoint: 20, unitOfMeasure: 'UNIT', barcode: 'ELEC-LPT-001', warehouseId: 'wh-001', supplierId: 'sup-002', isActive: 1, stockStatus: 'NORMAL', inventoryValue: 4049955, createdAt: '2025-01-15T00:00:00.000Z' },
  { id: 'prod-002', sku: 'ELEC-MON-001', name: 'LG 27" 4K IPS Monitor', category: 'Electronics', description: '27-inch 4K UHD IPS display, 60Hz, HDR400', unitPrice: 42500, quantity: 8, minStockLevel: 10, maxStockLevel: 100, reorderPoint: 15, unitOfMeasure: 'UNIT', barcode: 'ELEC-MON-001', warehouseId: 'wh-001', supplierId: 'sup-002', isActive: 1, stockStatus: 'LOW_STOCK', inventoryValue: 340000, createdAt: '2025-01-20T00:00:00.000Z' },
  { id: 'prod-003', sku: 'FURN-CHR-001', name: 'Ergonomic Office Chair Pro', category: 'Furniture', description: 'Lumbar support, adjustable armrests, mesh back', unitPrice: 18500, quantity: 0, minStockLevel: 5, maxStockLevel: 50, reorderPoint: 10, unitOfMeasure: 'UNIT', barcode: 'FURN-CHR-001', warehouseId: 'wh-002', supplierId: 'sup-001', isActive: 1, stockStatus: 'OUT_OF_STOCK', inventoryValue: 0, createdAt: '2025-02-01T00:00:00.000Z' },
  { id: 'prod-004', sku: 'MACH-DRL-001', name: 'Bosch Industrial Drill Press', category: 'Machinery', description: '1500W, 16-speed, cast iron table, digital depth stop', unitPrice: 125000, quantity: 12, minStockLevel: 3, maxStockLevel: 30, reorderPoint: 5, unitOfMeasure: 'UNIT', barcode: 'MACH-DRL-001', warehouseId: 'wh-003', supplierId: 'sup-003', isActive: 1, stockStatus: 'NORMAL', inventoryValue: 1500000, createdAt: '2025-02-10T00:00:00.000Z' },
  { id: 'prod-005', sku: 'OFFC-PPR-A4', name: 'A4 Copier Paper (500 sheets)', category: 'Office Supplies', description: '80 GSM, white, acid-free, ream of 500', unitPrice: 350, quantity: 1240, minStockLevel: 100, maxStockLevel: 5000, reorderPoint: 200, unitOfMeasure: 'REAM', barcode: 'OFFC-PPR-A4', warehouseId: 'wh-001', supplierId: 'sup-004', isActive: 1, stockStatus: 'OVERSTOCK', inventoryValue: 434000, createdAt: '2025-02-15T00:00:00.000Z' },
  { id: 'prod-006', sku: 'ELEC-KBD-001', name: 'Mechanical Gaming Keyboard', category: 'Electronics', description: 'Cherry MX Red switches, RGB backlight, TKL layout', unitPrice: 8999, quantity: 67, minStockLevel: 20, maxStockLevel: 300, reorderPoint: 40, unitOfMeasure: 'UNIT', barcode: 'ELEC-KBD-001', warehouseId: 'wh-002', supplierId: 'sup-002', isActive: 1, stockStatus: 'NORMAL', inventoryValue: 602933, createdAt: '2025-03-01T00:00:00.000Z' },
  { id: 'prod-007', sku: 'FOOD-COF-001', name: 'Nescafe Premium Coffee (1kg)', category: 'Food & Beverage', description: 'Instant coffee, rich aroma, 1kg tin', unitPrice: 1200, quantity: 3, minStockLevel: 20, maxStockLevel: 500, reorderPoint: 50, unitOfMeasure: 'TIN', barcode: 'FOOD-COF-001', warehouseId: 'wh-004', supplierId: 'sup-004', isActive: 1, stockStatus: 'LOW_STOCK', inventoryValue: 3600, createdAt: '2025-03-10T00:00:00.000Z' },
  { id: 'prod-008', sku: 'CLTH-UNIF-L', name: 'Company Uniform (Large)', category: 'Clothing', description: 'Blue polo shirt with company logo, polyester blend', unitPrice: 750, quantity: 200, minStockLevel: 50, maxStockLevel: 1000, reorderPoint: 100, unitOfMeasure: 'PIECE', barcode: 'CLTH-UNIF-L', warehouseId: 'wh-001', supplierId: 'sup-001', isActive: 1, stockStatus: 'NORMAL', inventoryValue: 150000, createdAt: '2025-03-15T00:00:00.000Z' },
  { id: 'prod-009', sku: 'RAW-STL-ROD', name: 'Steel Rod 12mm x 6m', category: 'Raw Materials', description: 'IS 1786 Fe500 grade, TMT steel rod', unitPrice: 4200, quantity: 15, minStockLevel: 30, maxStockLevel: 500, reorderPoint: 60, unitOfMeasure: 'PCS', barcode: 'RAW-STL-ROD', warehouseId: 'wh-003', supplierId: 'sup-003', isActive: 1, stockStatus: 'LOW_STOCK', inventoryValue: 63000, createdAt: '2025-04-01T00:00:00.000Z' },
  { id: 'prod-010', sku: 'ELEC-SRV-R1', name: 'Dell PowerEdge R340 Server', category: 'Electronics', description: 'Intel Xeon E-2234, 16GB ECC RAM, 1TB HDD', unitPrice: 345000, quantity: 4, minStockLevel: 2, maxStockLevel: 20, reorderPoint: 3, unitOfMeasure: 'UNIT', barcode: 'ELEC-SRV-R1', warehouseId: 'wh-002', supplierId: 'sup-002', isActive: 1, stockStatus: 'NORMAL', inventoryValue: 1380000, createdAt: '2025-04-10T00:00:00.000Z' },
  { id: 'prod-011', sku: 'FURN-DSK-001', name: 'Height-Adjustable Standing Desk', category: 'Furniture', description: 'Electric sit-stand desk, 140x70cm, oak finish', unitPrice: 32000, quantity: 18, minStockLevel: 5, maxStockLevel: 50, reorderPoint: 8, unitOfMeasure: 'UNIT', barcode: 'FURN-DSK-001', warehouseId: 'wh-001', supplierId: 'sup-001', isActive: 1, stockStatus: 'NORMAL', inventoryValue: 576000, createdAt: '2025-04-20T00:00:00.000Z' },
  { id: 'prod-012', sku: 'OFFC-PRN-001', name: 'HP LaserJet Pro M404n', category: 'Office Supplies', description: 'Monochrome laser printer, 38 ppm, Ethernet', unitPrice: 21500, quantity: 0, minStockLevel: 3, maxStockLevel: 30, reorderPoint: 5, unitOfMeasure: 'UNIT', barcode: 'OFFC-PRN-001', warehouseId: 'wh-004', supplierId: 'sup-002', isActive: 1, stockStatus: 'OUT_OF_STOCK', inventoryValue: 0, createdAt: '2025-05-01T00:00:00.000Z' },
];

const PURCHASE_ORDERS = [
  { id: 'po-001', poNumber: 'PO-2025-0001', supplierId: 'sup-001', warehouseId: 'wh-001', createdBy: 'user-admin-001', approvedBy: 'user-admin-001', status: 'DELIVERED', totalAmount: 750000, expectedDeliveryDate: '2025-03-15T00:00:00.000Z', actualDeliveryDate: '2025-03-14T00:00:00.000Z', notes: 'Q1 restocking order', createdAt: '2025-03-01T00:00:00.000Z', items: [{ id: 'poi-001', productId: 'prod-001', quantity: 10, unitPrice: 89999, totalPrice: 899990, receivedQuantity: 10 }, { id: 'poi-002', productId: 'prod-008', quantity: 100, unitPrice: 750, totalPrice: 75000, receivedQuantity: 100 }] },
  { id: 'po-002', poNumber: 'PO-2025-0002', supplierId: 'sup-002', warehouseId: 'wh-002', createdBy: 'user-admin-001', approvedBy: 'user-admin-001', status: 'ORDERED', totalAmount: 430000, expectedDeliveryDate: '2025-06-20T00:00:00.000Z', actualDeliveryDate: null, notes: 'Electronics restock', createdAt: '2025-06-01T00:00:00.000Z', items: [{ id: 'poi-003', productId: 'prod-002', quantity: 8, unitPrice: 42500, totalPrice: 340000, receivedQuantity: 0 }, { id: 'poi-004', productId: 'prod-006', quantity: 10, unitPrice: 8999, totalPrice: 89990, receivedQuantity: 0 }] },
  { id: 'po-003', poNumber: 'PO-2025-0003', supplierId: 'sup-004', warehouseId: 'wh-001', createdBy: 'user-mgr-001', approvedBy: null, status: 'DRAFT', totalAmount: 70000, expectedDeliveryDate: '2025-07-01T00:00:00.000Z', actualDeliveryDate: null, notes: 'Office supplies monthly', createdAt: '2025-06-02T00:00:00.000Z', items: [{ id: 'poi-005', productId: 'prod-005', quantity: 200, unitPrice: 350, totalPrice: 70000, receivedQuantity: 0 }] },
  { id: 'po-004', poNumber: 'PO-2025-0004', supplierId: 'sup-003', warehouseId: 'wh-003', createdBy: 'user-admin-001', approvedBy: 'user-admin-001', status: 'APPROVED', totalAmount: 315000, expectedDeliveryDate: '2025-06-25T00:00:00.000Z', actualDeliveryDate: null, notes: 'Raw material Q2', createdAt: '2025-06-01T00:00:00.000Z', items: [{ id: 'poi-006', productId: 'prod-009', quantity: 75, unitPrice: 4200, totalPrice: 315000, receivedQuantity: 0 }] },
];

let STOCK_MOVEMENTS = [
  { id: 'sm-001', productId: 'prod-001', warehouseId: 'wh-001', movementType: 'IN', quantity: 10, performedBy: 'user-admin-001', remarks: 'PO-2025-0001 delivery', createdAt: '2025-03-14T10:00:00.000Z' },
  { id: 'sm-002', productId: 'prod-001', warehouseId: 'wh-001', movementType: 'OUT', quantity: 3, performedBy: 'user-mgr-001', remarks: 'Issued to IT department', createdAt: '2025-03-20T14:00:00.000Z' },
  { id: 'sm-003', productId: 'prod-005', warehouseId: 'wh-001', movementType: 'IN', quantity: 500, performedBy: 'user-admin-001', remarks: 'Bulk purchase', createdAt: '2025-04-01T09:00:00.000Z' },
  { id: 'sm-004', productId: 'prod-006', warehouseId: 'wh-002', movementType: 'OUT', quantity: 15, performedBy: 'user-mgr-002', remarks: 'Office setup - Delhi branch', createdAt: '2025-04-15T11:00:00.000Z' },
  { id: 'sm-005', productId: 'prod-002', warehouseId: 'wh-001', movementType: 'OUT', quantity: 5, performedBy: 'user-mgr-001', remarks: 'Sales order fulfillment', createdAt: '2025-05-10T15:00:00.000Z' },
  { id: 'sm-006', productId: 'prod-004', warehouseId: 'wh-003', movementType: 'IN', quantity: 5, performedBy: 'user-admin-001', remarks: 'New stock from supplier', createdAt: '2025-05-20T08:00:00.000Z' },
];

let NOTIFICATIONS = [
  { id: 'notif-001', userId: 'user-admin-001', type: 'LOW_STOCK', title: 'Low Stock Alert', message: 'LG 27" 4K IPS Monitor (ELEC-MON-001) is running low — 8 units remaining (minimum: 10)', entityType: 'PRODUCT', entityId: 'prod-002', isRead: 0, severity: 'HIGH', createdAt: '2025-06-01T08:00:00.000Z' },
  { id: 'notif-002', userId: 'user-admin-001', type: 'OUT_OF_STOCK', title: 'Out of Stock Alert', message: 'Ergonomic Office Chair Pro (FURN-CHR-001) is now out of stock!', entityType: 'PRODUCT', entityId: 'prod-003', isRead: 0, severity: 'CRITICAL', createdAt: '2025-06-01T09:00:00.000Z' },
  { id: 'notif-003', userId: 'user-admin-001', type: 'PO_CREATED', title: 'New Purchase Order', message: 'PO PO-2025-0003 created for ₹70,000 by Priya Sharma', entityType: 'PURCHASE_ORDER', entityId: 'po-003', isRead: 0, severity: 'LOW', createdAt: '2025-06-02T06:00:00.000Z' },
  { id: 'notif-004', userId: 'user-admin-001', type: 'FORECAST_WARNING', title: 'Forecast Warning', message: 'Nescafe Premium Coffee demand predicted to spike 40% next month', entityType: 'PRODUCT', entityId: 'prod-007', isRead: 1, severity: 'MEDIUM', createdAt: '2025-05-30T12:00:00.000Z' },
  { id: 'notif-005', userId: 'user-admin-001', type: 'OVERSTOCK', title: 'Overstock Alert', message: 'A4 Copier Paper (OFFC-PPR-A4) is overstocked — 1,240 units (maximum: 1,000)', entityType: 'PRODUCT', entityId: 'prod-005', isRead: 1, severity: 'MEDIUM', createdAt: '2025-05-28T14:00:00.000Z' },
  { id: 'notif-006', userId: 'user-mgr-001', type: 'LOW_STOCK', title: 'Low Stock Alert', message: 'Steel Rod 12mm (RAW-STL-ROD) is critically low — 15 units remaining (minimum: 30)', entityType: 'PRODUCT', entityId: 'prod-009', isRead: 0, severity: 'HIGH', createdAt: '2025-06-02T07:00:00.000Z' },
];

let AUDIT_LOGS = [
  { id: 'log-001', userId: 'user-admin-001', action: 'LOGIN', entityType: 'AUTH', entityId: null, status: 'SUCCESS', ipAddress: '192.168.1.10', createdAt: '2025-06-02T06:00:00.000Z' },
  { id: 'log-002', userId: 'user-admin-001', action: 'CREATE_WAREHOUSE', entityType: 'WAREHOUSE', entityId: 'wh-004', status: 'SUCCESS', ipAddress: '192.168.1.10', createdAt: '2025-03-01T09:00:00.000Z' },
  { id: 'log-003', userId: 'user-mgr-001', action: 'STOCK_OUT', entityType: 'INVENTORY', entityId: 'prod-001', status: 'SUCCESS', ipAddress: '192.168.1.22', createdAt: '2025-03-20T14:00:00.000Z' },
  { id: 'log-004', userId: 'user-admin-001', action: 'CREATE_PO', entityType: 'PURCHASE_ORDER', entityId: 'po-002', status: 'SUCCESS', ipAddress: '192.168.1.10', createdAt: '2025-06-01T10:00:00.000Z' },
  { id: 'log-005', userId: 'user-mgr-002', action: 'LOGIN', entityType: 'AUTH', entityId: null, status: 'SUCCESS', ipAddress: '192.168.1.35', createdAt: '2025-06-02T07:00:00.000Z' },
  { id: 'log-006', userId: 'user-admin-001', action: 'UPDATE_PRODUCT', entityType: 'PRODUCT', entityId: 'prod-008', status: 'SUCCESS', ipAddress: '192.168.1.10', createdAt: '2025-05-15T11:00:00.000Z' },
];

// ─── Helpers ────────────────────────────────────────────────
const paginate = (arr, page = 1, limit = 20, search = '', searchFields = []) => {
  let filtered = arr;
  if (search && searchFields.length) {
    const s = search.toLowerCase();
    filtered = arr.filter(item => searchFields.some(f => String(item[f] || '').toLowerCase().includes(s)));
  }
  const total = filtered.length;
  const p = parseInt(page) || 1;
  const l = Math.min(parseInt(limit) || 20, 100);
  const data = filtered.slice((p - 1) * l, p * l);
  return { data, total, page: p, limit: l, totalPages: Math.ceil(total / l), hasNext: p < Math.ceil(total / l), hasPrev: p > 1 };
};

const success = (res, data, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });

const error = (res, message = 'Error', status = 400) =>
  res.status(status).json({ success: false, message, error: message, timestamp: new Date().toISOString() });

// ─── JWT Middleware ──────────────────────────────────────────
const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return error(res, 'Authentication required', 401);
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET);
    req.user = payload;
    next();
  } catch { error(res, 'Invalid or expired token', 401); }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') return error(res, 'Admin access required', 403);
  next();
};

const issueTokens = (user) => {
  const accessToken = jwt.sign({ userId: user.id, email: user.email, role: user.role, warehouseId: user.warehouseId }, JWT_SECRET, { expiresIn: '24h' });
  const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET + '-refresh', { expiresIn: '7d' });
  return { accessToken, refreshToken, expiresIn: 86400 };
};

const safeUser = (u) => ({ id: u.id, fullName: u.fullName, email: u.email, role: u.role, isActive: u.isActive, phone: u.phone, warehouseId: u.warehouseId, lastLogin: u.lastLogin, createdAt: u.createdAt });

// ─── AUTH ROUTES ─────────────────────────────────────────────
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return error(res, 'Email and password required', 400);
  const user = USERS.find(u => u.email === email.toLowerCase());
  if (!user) return error(res, 'Invalid email or password', 401);
  if (!bcrypt.compareSync(password, user.passwordHash)) return error(res, 'Invalid email or password', 401);
  if (!user.isActive) return error(res, 'Account is deactivated', 403);
  user.lastLogin = new Date().toISOString();
  AUDIT_LOGS.unshift({ id: uuid(), userId: user.id, action: 'LOGIN', entityType: 'AUTH', entityId: null, status: 'SUCCESS', ipAddress: req.ip, createdAt: now() });
  const tokens = issueTokens(user);
  success(res, { user: safeUser(user), tokens }, 'Login successful');
});

app.post('/api/v1/auth/logout', authenticate, (req, res) => {
  success(res, null, 'Logged out successfully');
});

app.post('/api/v1/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return error(res, 'Refresh token required', 400);
  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET + '-refresh');
    const user = USERS.find(u => u.id === payload.userId);
    if (!user) return error(res, 'User not found', 401);
    const tokens = issueTokens(user);
    success(res, { tokens }, 'Tokens refreshed');
  } catch { error(res, 'Invalid refresh token', 401); }
});

app.get('/api/v1/auth/me', authenticate, (req, res) => {
  const user = USERS.find(u => u.id === req.user.userId);
  if (!user) return error(res, 'User not found', 404);
  success(res, safeUser(user));
});

app.put('/api/v1/auth/me', authenticate, (req, res) => {
  const user = USERS.find(u => u.id === req.user.userId);
  if (!user) return error(res, 'Not found', 404);
  if (req.body.fullName) user.fullName = req.body.fullName;
  if (req.body.phone) user.phone = req.body.phone;
  success(res, safeUser(user), 'Profile updated');
});

app.post('/api/v1/auth/forgot-password', (req, res) => {
  success(res, null, 'If the email exists, a reset link has been sent');
});

app.post('/api/v1/auth/reset-password', (req, res) => {
  success(res, null, 'Password reset successfully (mock mode)');
});

app.put('/api/v1/auth/change-password', authenticate, (req, res) => {
  success(res, null, 'Password changed (mock mode)');
});

app.post('/api/v1/auth/register', authenticate, requireAdmin, (req, res) => {
  const { fullName, email, password, role, warehouseId, phone } = req.body;
  if (USERS.find(u => u.email === email?.toLowerCase())) return error(res, 'Email already registered', 409);
  const user = { id: uuid(), fullName, email: email.toLowerCase(), passwordHash: bcrypt.hashSync(password, 10), role, isActive: 1, phone, warehouseId: warehouseId || null, lastLogin: null, createdAt: now() };
  USERS.push(user);
  success(res, safeUser(user), 'User registered', 201);
});

// ─── WAREHOUSES ──────────────────────────────────────────────
app.get('/api/v1/warehouses', authenticate, (req, res) => {
  const result = paginate(WAREHOUSES.filter(w => w.isActive), req.query.page, req.query.limit, req.query.search, ['name', 'city', 'state']);
  success(res, result);
});
app.get('/api/v1/warehouses/:id', authenticate, (req, res) => {
  const w = WAREHOUSES.find(w => w.id === req.params.id);
  if (!w) return error(res, 'Warehouse not found', 404);
  success(res, w);
});
app.post('/api/v1/warehouses', authenticate, requireAdmin, (req, res) => {
  const w = { id: uuid(), ...req.body, currentStockCount: 0, utilizationPercent: 0, isActive: 1, createdAt: now(), updatedAt: now() };
  WAREHOUSES.push(w);
  success(res, w, 'Warehouse created', 201);
});
app.put('/api/v1/warehouses/:id', authenticate, requireAdmin, (req, res) => {
  const idx = WAREHOUSES.findIndex(w => w.id === req.params.id);
  if (idx === -1) return error(res, 'Warehouse not found', 404);
  WAREHOUSES[idx] = { ...WAREHOUSES[idx], ...req.body, updatedAt: now() };
  success(res, WAREHOUSES[idx]);
});
app.delete('/api/v1/warehouses/:id', authenticate, requireAdmin, (req, res) => {
  const idx = WAREHOUSES.findIndex(w => w.id === req.params.id);
  if (idx === -1) return error(res, 'Warehouse not found', 404);
  WAREHOUSES[idx].isActive = 0;
  success(res, null, 'Warehouse deleted');
});

// ─── PRODUCTS ────────────────────────────────────────────────
app.get('/api/v1/products', authenticate, (req, res) => {
  let products = PRODUCTS.filter(p => p.isActive);
  if (req.query.category) products = products.filter(p => p.category === req.query.category);
  if (req.query.stockStatus) products = products.filter(p => p.stockStatus === req.query.stockStatus);
  if (req.query.warehouseId) products = products.filter(p => p.warehouseId === req.query.warehouseId);
  const result = paginate(products, req.query.page, req.query.limit, req.query.search, ['name', 'sku', 'barcode', 'category']);
  // Enrich with warehouse/supplier
  result.data = result.data.map(p => ({ ...p, warehouse: WAREHOUSES.find(w => w.id === p.warehouseId) || null, supplier: SUPPLIERS.find(s => s.id === p.supplierId) || null }));
  success(res, result);
});
app.get('/api/v1/products/barcode', authenticate, (req, res) => {
  const p = PRODUCTS.find(p => p.barcode === req.query.barcode || p.sku === req.query.barcode);
  if (!p) return error(res, 'Product not found for barcode', 404);
  success(res, { ...p, warehouse: WAREHOUSES.find(w => w.id === p.warehouseId) });
});
app.get('/api/v1/products/low-stock', authenticate, (req, res) => {
  success(res, PRODUCTS.filter(p => p.isActive && p.quantity <= p.minStockLevel));
});
app.get('/api/v1/products/:id', authenticate, (req, res) => {
  const p = PRODUCTS.find(p => p.id === req.params.id);
  if (!p) return error(res, 'Product not found', 404);
  success(res, { ...p, warehouse: WAREHOUSES.find(w => w.id === p.warehouseId), supplier: SUPPLIERS.find(s => s.id === p.supplierId) });
});
app.post('/api/v1/products', authenticate, requireAdmin, (req, res) => {
  if (PRODUCTS.find(p => p.sku === req.body.sku)) return error(res, 'SKU already exists', 409);
  const p = { id: uuid(), ...req.body, barcode: req.body.sku, isActive: 1, stockStatus: 'NORMAL', inventoryValue: 0, createdAt: now(), updatedAt: now() };
  PRODUCTS.push(p);
  success(res, p, 'Product created', 201);
});
app.put('/api/v1/products/:id', authenticate, requireAdmin, (req, res) => {
  const idx = PRODUCTS.findIndex(p => p.id === req.params.id);
  if (idx === -1) return error(res, 'Product not found', 404);
  PRODUCTS[idx] = { ...PRODUCTS[idx], ...req.body };
  success(res, PRODUCTS[idx]);
});
app.delete('/api/v1/products/:id', authenticate, requireAdmin, (req, res) => {
  const idx = PRODUCTS.findIndex(p => p.id === req.params.id);
  if (idx === -1) return error(res, 'Product not found', 404);
  PRODUCTS[idx].isActive = 0;
  success(res, null, 'Product deleted');
});

// ─── INVENTORY ───────────────────────────────────────────────
const updateProductStatus = (p) => {
  if (p.quantity === 0) p.stockStatus = 'OUT_OF_STOCK';
  else if (p.quantity > p.maxStockLevel) p.stockStatus = 'OVERSTOCK';
  else if (p.quantity <= p.minStockLevel) p.stockStatus = 'LOW_STOCK';
  else p.stockStatus = 'NORMAL';
  p.inventoryValue = p.quantity * p.unitPrice;
};

app.post('/api/v1/inventory/stock-in', authenticate, (req, res) => {
  const { productId, warehouseId, quantity, remarks } = req.body;
  const p = PRODUCTS.find(p => p.id === productId);
  if (!p) return error(res, 'Product not found', 404);
  if (!Number.isInteger(quantity) && quantity <= 0) return error(res, 'Invalid quantity', 400);
  p.quantity += parseInt(quantity);
  updateProductStatus(p);
  const mv = { id: uuid(), productId, warehouseId, movementType: 'IN', quantity: parseInt(quantity), performedBy: req.user.userId, remarks: remarks || 'Stock received', createdAt: now() };
  STOCK_MOVEMENTS.unshift(mv);
  AUDIT_LOGS.unshift({ id: uuid(), userId: req.user.userId, action: 'STOCK_IN', entityType: 'INVENTORY', entityId: productId, status: 'SUCCESS', ipAddress: req.ip, createdAt: now() });
  success(res, mv, 'Stock in recorded', 201);
});

app.post('/api/v1/inventory/stock-out', authenticate, (req, res) => {
  const { productId, warehouseId, quantity, remarks } = req.body;
  const p = PRODUCTS.find(p => p.id === productId);
  if (!p) return error(res, 'Product not found', 404);
  if (p.quantity < quantity) return error(res, `Insufficient stock. Available: ${p.quantity}`, 422);
  p.quantity -= parseInt(quantity);
  updateProductStatus(p);
  const mv = { id: uuid(), productId, warehouseId, movementType: 'OUT', quantity: parseInt(quantity), performedBy: req.user.userId, remarks: remarks || 'Stock issued', createdAt: now() };
  STOCK_MOVEMENTS.unshift(mv);
  if (p.quantity === 0) NOTIFICATIONS.unshift({ id: uuid(), userId: 'user-admin-001', type: 'OUT_OF_STOCK', title: 'Out of Stock!', message: `${p.name} is now out of stock`, entityType: 'PRODUCT', entityId: p.id, isRead: 0, severity: 'CRITICAL', createdAt: now() });
  else if (p.quantity <= p.minStockLevel) NOTIFICATIONS.unshift({ id: uuid(), userId: 'user-admin-001', type: 'LOW_STOCK', title: 'Low Stock Alert', message: `${p.name} is low — ${p.quantity} units remaining`, entityType: 'PRODUCT', entityId: p.id, isRead: 0, severity: 'HIGH', createdAt: now() });
  success(res, mv, 'Stock out recorded', 201);
});

app.post('/api/v1/inventory/transfer', authenticate, (req, res) => {
  const { productId, fromWarehouseId, toWarehouseId, quantity, remarks } = req.body;
  const p = PRODUCTS.find(p => p.id === productId);
  if (!p) return error(res, 'Product not found', 404);
  if (p.quantity < quantity) return error(res, `Insufficient stock. Available: ${p.quantity}`, 422);
  const mv = { id: uuid(), productId, warehouseId: fromWarehouseId, movementType: 'TRANSFER', quantity: parseInt(quantity), performedBy: req.user.userId, remarks: remarks || `Transfer to ${toWarehouseId}`, createdAt: now() };
  STOCK_MOVEMENTS.unshift(mv);
  success(res, null, 'Transfer completed');
});

app.post('/api/v1/inventory/adjustment', authenticate, (req, res) => {
  const { productId, warehouseId, newQuantity, reason } = req.body;
  const p = PRODUCTS.find(p => p.id === productId);
  if (!p) return error(res, 'Product not found', 404);
  const delta = newQuantity - p.quantity;
  p.quantity = parseInt(newQuantity);
  updateProductStatus(p);
  const mv = { id: uuid(), productId, warehouseId, movementType: 'ADJUSTMENT', quantity: Math.abs(delta), performedBy: req.user.userId, remarks: `Adjustment: ${reason}. Delta: ${delta > 0 ? '+' : ''}${delta}`, createdAt: now() };
  STOCK_MOVEMENTS.unshift(mv);
  success(res, mv, 'Adjustment recorded');
});

app.get('/api/v1/inventory/movements', authenticate, (req, res) => {
  let movements = STOCK_MOVEMENTS;
  if (req.query.type) movements = movements.filter(m => m.movementType === req.query.type);
  if (req.query.warehouseId) movements = movements.filter(m => m.warehouseId === req.query.warehouseId);
  if (req.query.productId) movements = movements.filter(m => m.productId === req.query.productId);
  const result = paginate(movements, req.query.page, req.query.limit);
  result.data = result.data.map(m => ({ ...m, product: PRODUCTS.find(p => p.id === m.productId) || null, warehouse: WAREHOUSES.find(w => w.id === m.warehouseId) || null, performer: safeUser(USERS.find(u => u.id === m.performedBy) || USERS[0]) }));
  success(res, result);
});

app.get('/api/v1/inventory/levels', authenticate, (req, res) => {
  success(res, paginate(PRODUCTS.filter(p => p.isActive), req.query.page, req.query.limit));
});

// ─── SUPPLIERS ───────────────────────────────────────────────
app.get('/api/v1/suppliers', authenticate, (req, res) => {
  success(res, paginate(SUPPLIERS.filter(s => s.isActive), req.query.page, req.query.limit, req.query.search, ['name', 'city', 'contactPerson']));
});
app.get('/api/v1/suppliers/:id/performance', authenticate, (req, res) => {
  const s = SUPPLIERS.find(s => s.id === req.params.id);
  if (!s) return error(res, 'Supplier not found', 404);
  const pos = PURCHASE_ORDERS.filter(po => po.supplierId === s.id);
  success(res, { supplier: s, totalOrders: pos.length, deliveredOrders: pos.filter(p => p.status === 'DELIVERED').length, rating: s.rating, deliveryRate: s.deliveryPerformance, recentOrders: pos.slice(0, 5) });
});
app.get('/api/v1/suppliers/:id', authenticate, (req, res) => {
  const s = SUPPLIERS.find(s => s.id === req.params.id);
  if (!s) return error(res, 'Supplier not found', 404);
  success(res, s);
});
app.post('/api/v1/suppliers', authenticate, requireAdmin, (req, res) => {
  const s = { id: uuid(), ...req.body, rating: 0, totalOrders: 0, onTimeDeliveries: 0, deliveryPerformance: 0, isActive: 1, createdAt: now() };
  SUPPLIERS.push(s);
  success(res, s, 'Supplier created', 201);
});
app.put('/api/v1/suppliers/:id', authenticate, requireAdmin, (req, res) => {
  const idx = SUPPLIERS.findIndex(s => s.id === req.params.id);
  if (idx === -1) return error(res, 'Supplier not found', 404);
  SUPPLIERS[idx] = { ...SUPPLIERS[idx], ...req.body };
  success(res, SUPPLIERS[idx]);
});
app.delete('/api/v1/suppliers/:id', authenticate, requireAdmin, (req, res) => {
  const idx = SUPPLIERS.findIndex(s => s.id === req.params.id);
  if (idx === -1) return error(res, 'Supplier not found', 404);
  SUPPLIERS[idx].isActive = 0;
  success(res, null, 'Supplier deleted');
});

// ─── PURCHASE ORDERS ─────────────────────────────────────────
app.get('/api/v1/purchase-orders', authenticate, (req, res) => {
  let pos = PURCHASE_ORDERS;
  if (req.query.status) pos = pos.filter(p => p.status === req.query.status);
  const result = paginate(pos, req.query.page, req.query.limit);
  result.data = result.data.map(po => ({ ...po, supplier: SUPPLIERS.find(s => s.id === po.supplierId), warehouse: WAREHOUSES.find(w => w.id === po.warehouseId) }));
  success(res, result);
});
app.get('/api/v1/purchase-orders/:id', authenticate, (req, res) => {
  const po = PURCHASE_ORDERS.find(p => p.id === req.params.id);
  if (!po) return error(res, 'PO not found', 404);
  success(res, { ...po, supplier: SUPPLIERS.find(s => s.id === po.supplierId), warehouse: WAREHOUSES.find(w => w.id === po.warehouseId), items: po.items.map(i => ({ ...i, product: PRODUCTS.find(p => p.id === i.productId) })) });
});
app.post('/api/v1/purchase-orders', authenticate, (req, res) => {
  const { supplierId, warehouseId, expectedDeliveryDate, notes, items } = req.body;
  const totalAmount = (items || []).reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const poNumber = `PO-2025-${String(PURCHASE_ORDERS.length + 1).padStart(4, '0')}`;
  const po = { id: uuid(), poNumber, supplierId, warehouseId, createdBy: req.user.userId, approvedBy: null, status: 'DRAFT', totalAmount, expectedDeliveryDate, actualDeliveryDate: null, notes, createdAt: now(), items: (items || []).map((i, idx) => ({ id: uuid(), ...i, totalPrice: i.quantity * i.unitPrice, receivedQuantity: 0 })) };
  PURCHASE_ORDERS.unshift(po);
  success(res, po, 'PO created', 201);
});
app.patch('/api/v1/purchase-orders/:id/status', authenticate, (req, res) => {
  const po = PURCHASE_ORDERS.find(p => p.id === req.params.id);
  if (!po) return error(res, 'PO not found', 404);
  const VALID = { DRAFT: ['APPROVED', 'CANCELLED'], APPROVED: ['ORDERED', 'CANCELLED'], ORDERED: ['DELIVERED', 'CANCELLED'], DELIVERED: [], CANCELLED: [] };
  if (!VALID[po.status]?.includes(req.body.status)) return error(res, `Cannot transition from ${po.status} to ${req.body.status}`, 422);
  po.status = req.body.status;
  if (req.body.status === 'DELIVERED') {
    po.actualDeliveryDate = now();
    po.items.forEach(item => {
      const p = PRODUCTS.find(p => p.id === item.productId);
      if (p) { p.quantity += item.quantity; updateProductStatus(p); item.receivedQuantity = item.quantity; }
    });
    AUDIT_LOGS.unshift({ id: uuid(), userId: req.user.userId, action: 'PO_STATUS_DELIVERED', entityType: 'PURCHASE_ORDER', entityId: po.id, status: 'SUCCESS', ipAddress: req.ip, createdAt: now() });
  }
  success(res, po, `PO status updated to ${po.status}`);
});
app.delete('/api/v1/purchase-orders/:id', authenticate, requireAdmin, (req, res) => {
  const idx = PURCHASE_ORDERS.findIndex(p => p.id === req.params.id);
  if (idx === -1) return error(res, 'PO not found', 404);
  if (PURCHASE_ORDERS[idx].status !== 'DRAFT') return error(res, 'Only DRAFT POs can be deleted', 422);
  PURCHASE_ORDERS.splice(idx, 1);
  success(res, null, 'PO deleted');
});

// ─── FORECASTING ─────────────────────────────────────────────
const movingAverage = (data, periods, win = 3) => {
  const ext = [...data];
  const d = new Date();
  return Array.from({ length: periods }, (_, i) => {
    const slice = ext.slice(-win);
    const pred = slice.reduce((a, b) => a + b, 0) / slice.length;
    const std = Math.sqrt(slice.reduce((s, v) => s + (v - pred) ** 2, 0) / slice.length) || pred * 0.1;
    ext.push(pred);
    const date = new Date(d.getFullYear(), d.getMonth() + i + 1, 1);
    return { period: i + 1, label: date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), predictedDemand: Math.round(Math.max(0, pred)), upperBound: Math.round(pred + 2 * std), lowerBound: Math.round(Math.max(0, pred - 2 * std)) };
  });
};

app.post('/api/v1/forecasting/forecast', authenticate, (req, res) => {
  const { productId, periods = 6, model = 'MOVING_AVERAGE' } = req.body;
  const p = PRODUCTS.find(p => p.id === productId);
  if (!p) return error(res, 'Product not found', 404);
  // Generate realistic historical data based on product quantity
  const baseMonthly = Math.max(5, Math.round(p.quantity * 0.15));
  const history = Array.from({ length: 12 }, (_, i) => Math.round(baseMonthly * (0.8 + Math.random() * 0.4)));
  const predictions = movingAverage(history, periods);
  const avgDemand = predictions.reduce((s, p) => s + p.predictedDemand, 0) / predictions.length;
  success(res, { productId, productName: p.name, model, predictions, reorderSuggestion: Math.ceil(avgDemand * 2), safetyStock: Math.ceil(avgDemand * 0.2), accuracy: 78 + Math.random() * 15 });
});

app.get('/api/v1/forecasting/dashboard', authenticate, (req, res) => {
  success(res, PRODUCTS.filter(p => p.isActive).slice(0, 5).map(p => ({ productId: p.id, productName: p.name, currentStock: p.quantity, stockStatus: p.stockStatus })));
});

app.get('/api/v1/forecasting/oracle-analytics', authenticate, (req, res) => {
  success(res, { predictionScore: '87/100', shortageRisks: 3, reorderRecommendations: 12, optimizationGain: '+18.4%', riskAlerts: [{ product: 'LG 27" Monitor', risk: 'HIGH', daysToStockout: 7 }, { product: 'Coffee (1kg)', risk: 'MEDIUM', daysToStockout: 5 }, { product: 'Steel Rod', risk: 'HIGH', daysToStockout: 10 }], source: 'MOCK_ANALYTICS' });
});

// ─── REPORTS ─────────────────────────────────────────────────
app.post('/api/v1/reports/generate', authenticate, (req, res) => {
  const { type = 'INVENTORY', format = 'CSV' } = req.body;
  let csvRows = [];
  if (type === 'INVENTORY') {
    csvRows = ['"SKU","Name","Category","Quantity","Unit Price","Stock Status"', ...PRODUCTS.filter(p => p.isActive).map(p => `"${p.sku}","${p.name}","${p.category}","${p.quantity}","${p.unitPrice}","${p.stockStatus}"`)];
  } else if (type === 'SUPPLIER') {
    csvRows = ['"Name","City","Rating","Lead Time (days)","Delivery %"', ...SUPPLIERS.filter(s => s.isActive).map(s => `"${s.name}","${s.city}","${s.rating}","${s.leadTimeDays}","${s.deliveryPerformance}"`)];
  } else if (type === 'WAREHOUSE') {
    csvRows = ['"Name","City","Capacity","Current Stock","Utilization %"', ...WAREHOUSES.filter(w => w.isActive).map(w => `"${w.name}","${w.city}","${w.capacity}","${w.currentStockCount}","${w.utilizationPercent}"`)];
  } else if (type === 'PURCHASE') {
    csvRows = ['"PO Number","Supplier","Status","Total Amount","Expected Delivery"', ...PURCHASE_ORDERS.map(po => `"${po.poNumber}","${SUPPLIERS.find(s => s.id === po.supplierId)?.name || ''}","${po.status}","${po.totalAmount}","${po.expectedDeliveryDate}"`)];
  }
  const csv = csvRows.join('\n');
  res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="report-${type.toLowerCase()}.csv"` });
  res.send(csv);
});

// ─── NOTIFICATIONS ───────────────────────────────────────────
app.get('/api/v1/notifications', authenticate, (req, res) => {
  let notifs = NOTIFICATIONS.filter(n => n.userId === req.user.userId);
  if (req.query.isRead !== undefined) notifs = notifs.filter(n => n.isRead === parseInt(req.query.isRead));
  success(res, paginate(notifs, req.query.page, req.query.limit));
});
app.patch('/api/v1/notifications/read-all', authenticate, (req, res) => {
  NOTIFICATIONS.filter(n => n.userId === req.user.userId).forEach(n => n.isRead = 1);
  success(res, null, 'All notifications marked as read');
});
app.patch('/api/v1/notifications/:id/read', authenticate, (req, res) => {
  const n = NOTIFICATIONS.find(n => n.id === req.params.id && n.userId === req.user.userId);
  if (!n) return error(res, 'Not found', 404);
  n.isRead = 1;
  success(res, null, 'Marked as read');
});
app.delete('/api/v1/notifications/:id', authenticate, (req, res) => {
  const idx = NOTIFICATIONS.findIndex(n => n.id === req.params.id && n.userId === req.user.userId);
  if (idx === -1) return error(res, 'Not found', 404);
  NOTIFICATIONS.splice(idx, 1);
  success(res, null, 'Deleted');
});

// ─── USERS ───────────────────────────────────────────────────
app.get('/api/v1/users', authenticate, requireAdmin, (req, res) => {
  const result = paginate(USERS, req.query.page, req.query.limit, req.query.search, ['fullName', 'email']);
  result.data = result.data.map(u => ({ ...safeUser(u), warehouse: WAREHOUSES.find(w => w.id === u.warehouseId) || null }));
  success(res, result);
});
app.get('/api/v1/users/:id', authenticate, requireAdmin, (req, res) => {
  const u = USERS.find(u => u.id === req.params.id);
  if (!u) return error(res, 'User not found', 404);
  success(res, { ...safeUser(u), warehouse: WAREHOUSES.find(w => w.id === u.warehouseId) });
});
app.put('/api/v1/users/:id', authenticate, requireAdmin, (req, res) => {
  const u = USERS.find(u => u.id === req.params.id);
  if (!u) return error(res, 'User not found', 404);
  const { fullName, phone, role, warehouseId } = req.body;
  if (fullName) u.fullName = fullName;
  if (phone) u.phone = phone;
  if (role) u.role = role;
  if (warehouseId !== undefined) u.warehouseId = warehouseId;
  success(res, safeUser(u));
});
app.patch('/api/v1/users/:id/toggle-active', authenticate, requireAdmin, (req, res) => {
  const u = USERS.find(u => u.id === req.params.id);
  if (!u) return error(res, 'User not found', 404);
  if (u.id === req.user.userId) return error(res, 'Cannot deactivate yourself', 400);
  u.isActive = u.isActive === 1 ? 0 : 1;
  success(res, safeUser(u), `User ${u.isActive ? 'activated' : 'deactivated'}`);
});

// ─── DASHBOARD ───────────────────────────────────────────────
app.get('/api/v1/dashboard/stats', authenticate, (req, res) => {
  const products = PRODUCTS.filter(p => p.isActive);
  const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= p.minStockLevel).length;
  const outOfStock = products.filter(p => p.quantity === 0).length;
  const totalInventoryValue = products.reduce((s, p) => s + p.quantity * p.unitPrice, 0);
  const pendingPOs = PURCHASE_ORDERS.filter(p => ['DRAFT', 'APPROVED', 'ORDERED'].includes(p.status)).length;
  const activeAlerts = NOTIFICATIONS.filter(n => !n.isRead).length;
  success(res, { totalWarehouses: WAREHOUSES.filter(w => w.isActive).length, totalProducts: products.length, totalSuppliers: SUPPLIERS.filter(s => s.isActive).length, totalInventoryValue, lowStockProducts: lowStock, outOfStockProducts: outOfStock, pendingPurchaseOrders: pendingPOs, incomingShipments: PURCHASE_ORDERS.filter(p => p.status === 'ORDERED').length, activeAlerts });
});

app.get('/api/v1/dashboard/inventory-trends', authenticate, (_req, res) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const m = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return { month: months[m.getMonth()], value: Math.floor(Math.random() * 300000 + 500000), in: Math.floor(Math.random() * 150 + 50), out: Math.floor(Math.random() * 100 + 30) };
  });
  success(res, { monthly });
});

app.get('/api/v1/dashboard/supplier-performance', authenticate, (_req, res) => {
  success(res, { suppliers: SUPPLIERS.filter(s => s.isActive).map(s => ({ name: s.name.substring(0, 16), performance: s.deliveryPerformance, rating: s.rating })) });
});

app.get('/api/v1/dashboard/warehouse-utilization', authenticate, (_req, res) => {
  success(res, { warehouses: WAREHOUSES.filter(w => w.isActive).map(w => ({ name: w.name, utilization: w.utilizationPercent, fill: w.utilizationPercent > 80 ? '#ef4444' : w.utilizationPercent > 60 ? '#f59e0b' : '#22c55e' })) });
});

app.get('/api/v1/dashboard/audit-logs', authenticate, requireAdmin, (req, res) => {
  const result = paginate(AUDIT_LOGS, req.query.page, req.query.limit, req.query.search, ['action', 'entityType']);
  result.data = result.data.map(log => ({ ...log, user: safeUser(USERS.find(u => u.id === log.userId) || USERS[0]) }));
  success(res, result);
});

// ─── Health Check ────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'OK', mode: 'MOCK', timestamp: new Date().toISOString(), version: '1.0.0' }));
app.get('/api/docs.json', (_req, res) => res.json({ openapi: '3.0.0', info: { title: 'InvenTrack Pro Mock API', version: '1.0.0', description: 'Running in mock mode — no Oracle DB required' } }));

// 404 handler
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log(`║  InvenTrack Pro — Mock API Server                ║`);
  console.log(`║  Running on http://localhost:${PORT}              ║`);
  console.log(`║  Mode: MOCK (no Oracle DB required)              ║`);
  console.log(`║  Demo: admin@inventrack.com / Admin@123          ║`);
  console.log('╚══════════════════════════════════════════════════╝\n');
});
