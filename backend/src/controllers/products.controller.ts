import { Request, Response, NextFunction } from "express";
import { productService } from "../services/product.service";
import type { ApiResponse } from "../types";

const ok = <T>(res: Response, data: T, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() } as ApiResponse<T>);

export const productsController = {
  async getAll(req: Request, res: Response, next: NextFunction) { try { ok(res, await productService.getAll(req.query as any)); } catch (e) { next(e); } },
  async getById(req: Request, res: Response, next: NextFunction) { try { ok(res, await productService.getById(req.params.id)); } catch (e) { next(e); } },
  async create(req: Request, res: Response, next: NextFunction) { try { ok(res, await productService.create(req.body, req.user?.userId), "Product created", 201); } catch (e) { next(e); } },
  async update(req: Request, res: Response, next: NextFunction) { try { ok(res, await productService.update(req.params.id, req.body, req.user?.userId)); } catch (e) { next(e); } },
  async delete(req: Request, res: Response, next: NextFunction) { try { await productService.delete(req.params.id, req.user?.userId); ok(res, null, "Product deleted"); } catch (e) { next(e); } },
  async getByBarcode(req: Request, res: Response, next: NextFunction) { try { ok(res, await productService.getByBarcode(req.query.barcode as string)); } catch (e) { next(e); } },
  async getLowStock(req: Request, res: Response, next: NextFunction) { try { ok(res, await productService.getLowStock()); } catch (e) { next(e); } },
};