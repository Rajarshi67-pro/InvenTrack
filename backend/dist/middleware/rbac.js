"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireWarehouseAccess = exports.requireManagerOrAdmin = exports.requireAdmin = exports.requireRole = void 0;
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`,
                timestamp: new Date().toISOString(),
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireAdmin = (0, exports.requireRole)('ADMIN');
exports.requireManagerOrAdmin = (0, exports.requireRole)('ADMIN', 'MANAGER');
// Warehouse-scoped access: managers can only access their assigned warehouse
const requireWarehouseAccess = (warehouseIdParam = 'warehouseId') => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required', timestamp: new Date().toISOString() });
            return;
        }
        // Admins bypass warehouse restrictions
        if (req.user.role === 'ADMIN') {
            next();
            return;
        }
        const requestedWarehouseId = req.params[warehouseIdParam] || req.body[warehouseIdParam] || req.query[warehouseIdParam];
        if (requestedWarehouseId && req.user.warehouseId && requestedWarehouseId !== req.user.warehouseId) {
            res.status(403).json({
                success: false,
                message: 'You do not have access to this warehouse',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        next();
    };
};
exports.requireWarehouseAccess = requireWarehouseAccess;
//# sourceMappingURL=rbac.js.map