"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsController = void 0;
const ok = (res, data, message = 'Success', status = 200) => res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });
const MOCK_SETTINGS = {
    companyName: 'SupplySync AI Enterprise',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    lowStockThreshold: 20,
    emailNotifications: true,
    autoForecast: true,
    forecastPeriod: 6,
    allowManagerCreatePO: false,
};
exports.settingsController = {
    async get(req, res, next) {
        try {
            ok(res, MOCK_SETTINGS);
        }
        catch (e) {
            next(e);
        }
    },
    async update(req, res, next) {
        try {
            ok(res, { ...MOCK_SETTINGS, ...req.body }, 'Settings saved');
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=settings.controller.js.map