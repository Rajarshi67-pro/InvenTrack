import { Request, Response, NextFunction } from "express";
export declare const dashboardController: {
    getStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    getInventoryTrends(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSupplierPerformance(req: Request, res: Response, next: NextFunction): Promise<void>;
    getWarehouseUtilization(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=dashboard.controller.d.ts.map