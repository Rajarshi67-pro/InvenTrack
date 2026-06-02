import { Warehouse } from "../entities/Warehouse";
import type { CreateWarehouseDto, UpdateWarehouseDto, PaginationQuery, PaginatedResponse } from "../types";
export declare const warehouseService: {
    getAll(query: PaginationQuery): Promise<PaginatedResponse<Warehouse>>;
    getById(id: string): Promise<Warehouse>;
    create(dto: CreateWarehouseDto, userId?: string): Promise<Warehouse>;
    update(id: string, dto: UpdateWarehouseDto, userId?: string): Promise<Warehouse>;
    delete(id: string, userId?: string): Promise<void>;
};
//# sourceMappingURL=warehouse.service.d.ts.map