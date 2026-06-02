import { Request, Response, NextFunction } from "express";
export declare const dashboardController: {
    getStats(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getInventoryTrends(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSupplierPerformance(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getWarehouseUtilization(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=dashboard.controller.d.ts.map