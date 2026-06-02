import { Request, Response, NextFunction } from "express";
export declare const productsController: {
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    getByBarcode(req: Request, res: Response, next: NextFunction): Promise<void>;
    getLowStock(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=products.controller.d.ts.map