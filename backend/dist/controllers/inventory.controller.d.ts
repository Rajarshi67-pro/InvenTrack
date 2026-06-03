import { Request, Response, NextFunction } from "express";
export declare const inventoryController: {
    stockIn(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    stockOut(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    transfer(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    adjustment(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getMovements(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getLevels(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=inventory.controller.d.ts.map