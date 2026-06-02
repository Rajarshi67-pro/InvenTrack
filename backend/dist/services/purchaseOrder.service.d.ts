import { PurchaseOrder } from "../entities/PurchaseOrder";
import type { CreatePODto, PaginationQuery, PaginatedResponse } from "../types";
export declare const purchaseOrderService: {
    getAll(query: PaginationQuery & {
        status?: string;
        supplierId?: string;
    }): Promise<PaginatedResponse<PurchaseOrder>>;
    getById(id: string): Promise<PurchaseOrder>;
    create(dto: CreatePODto, userId: string): Promise<PurchaseOrder>;
    updateStatus(id: string, status: string, userId: string, notes?: string): Promise<PurchaseOrder>;
    delete(id: string, userId: string): Promise<void>;
};
//# sourceMappingURL=purchaseOrder.service.d.ts.map