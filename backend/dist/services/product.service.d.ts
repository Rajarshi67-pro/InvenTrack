import { Product } from "../entities/Product";
import type { CreateProductDto, UpdateProductDto, PaginationQuery, PaginatedResponse } from "../types";
export declare const productService: {
    getAll(query: PaginationQuery & {
        category?: string;
        stockStatus?: string;
        warehouseId?: string;
    }): Promise<PaginatedResponse<Product>>;
    getById(id: string): Promise<Product>;
    create(dto: CreateProductDto, userId?: string): Promise<Product>;
    update(id: string, dto: UpdateProductDto, userId?: string): Promise<Product>;
    delete(id: string, userId?: string): Promise<void>;
    getByBarcode(barcode: string): Promise<Product>;
    getLowStock(): Promise<Product[]>;
    getOutOfStock(): Promise<Product[]>;
};
//# sourceMappingURL=product.service.d.ts.map