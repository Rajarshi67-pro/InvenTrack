import { Request, Response, NextFunction } from "express";
export declare const inventoryController: {
    stockIn(req: Request, res: Response, next: NextFunction): Promise<void>;
    stockOut(req: Request, res: Response, next: NextFunction): Promise<void>;
    transfer(req: Request, res: Response, next: NextFunction): Promise<void>;
    adjustment(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMovements(req: Request, res: Response, next: NextFunction): Promise<void>;
    getLevels(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=inventory.controller.d.ts.map