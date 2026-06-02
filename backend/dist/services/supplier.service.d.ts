import { Supplier } from "../entities/Supplier";
import { PurchaseOrder } from "../entities/PurchaseOrder";
import type { CreateSupplierDto, UpdateSupplierDto, PaginationQuery, PaginatedResponse } from "../types";
export declare const supplierService: {
    getAll(query: PaginationQuery): Promise<PaginatedResponse<Supplier>>;
    getById(id: string): Promise<Supplier>;
    create(dto: CreateSupplierDto, userId?: string): Promise<Supplier>;
    update(id: string, dto: UpdateSupplierDto, userId?: string): Promise<Supplier>;
    delete(id: string, userId?: string): Promise<void>;
    getPerformanceAnalytics(supplierId: string): Promise<{
        supplier: Supplier;
        totalOrders: number;
        deliveredOrders: number;
        onTimeDeliveries: number;
        deliveryRate: number;
        avgLeadTimeDays: number;
        rating: number;
        recentOrders: PurchaseOrder[];
    }>;
};
//# sourceMappingURL=supplier.service.d.ts.map