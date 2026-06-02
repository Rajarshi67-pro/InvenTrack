"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../config/jwt");
const database_1 = require("../config/database");
const User_1 = require("../entities/User");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Access token required',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        const token = authHeader.split(' ')[1];
        const payload = (0, jwt_1.verifyAccessToken)(token);
        // Verify user still exists and is active
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { id: payload.userId } });
        if (!user || user.isActive === 0) {
            res.status(401).json({
                success: false,
                message: 'User account is inactive or does not exist',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        // Check account lock
        if (user.lockedUntil && new Date() < user.lockedUntil) {
            res.status(403).json({
                success: false,
                message: `Account locked until ${user.lockedUntil.toISOString()}`,
                timestamp: new Date().toISOString(),
            });
            return;
        }
        req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
            warehouseId: user.warehouseId,
        };
        next();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid token';
        res.status(401).json({
            success: false,
            message: `Authentication failed: ${message}`,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=authenticate.js.map