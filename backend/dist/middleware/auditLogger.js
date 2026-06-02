"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = exports.auditLog = void 0;
const database_1 = require("../config/database");
const AuditLog_1 = require("../entities/AuditLog");
const auditLog = (action, entityType) => {
    return async (req, res, next) => {
        const originalJson = res.json.bind(res);
        let responseBody;
        let statusCode = 200;
        res.json = (body) => {
            responseBody = body;
            statusCode = res.statusCode;
            return originalJson(body);
        };
        next();
        // After response is sent, log the action
        res.on('finish', async () => {
            try {
                if (!database_1.AppDataSource.isInitialized)
                    return;
                const repo = database_1.AppDataSource.getRepository(AuditLog_1.AuditLog);
                const log = repo.create({
                    userId: req.user?.userId,
                    action,
                    entityType,
                    entityId: req.params.id,
                    newValues: JSON.stringify(req.body),
                    ipAddress: req.ip || req.socket.remoteAddress,
                    userAgent: req.headers['user-agent'],
                    status: statusCode < 400 ? 'SUCCESS' : 'FAILURE',
                    errorMessage: statusCode >= 400 ? JSON.stringify(responseBody) : undefined,
                });
                await repo.save(log);
            }
            catch { /* Silent fail — don't break response */ }
        });
    };
};
exports.auditLog = auditLog;
// Standalone audit logger (call explicitly in services)
const logAudit = async (data) => {
    try {
        if (!database_1.AppDataSource.isInitialized)
            return;
        const repo = database_1.AppDataSource.getRepository(AuditLog_1.AuditLog);
        const log = repo.create({
            ...data,
            oldValues: data.oldValues ? JSON.stringify(data.oldValues) : undefined,
            newValues: data.newValues ? JSON.stringify(data.newValues) : undefined,
            status: data.status || 'SUCCESS',
        });
        await repo.save(log);
    }
    catch { /* Silent fail */ }
};
exports.logAudit = logAudit;
//# sourceMappingURL=auditLogger.js.map