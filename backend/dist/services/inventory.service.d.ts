import { StockMovement } from "../entities/StockMovement";
import type { StockInDto, StockOutDto, StockTransferDto, StockAdjustmentDto, PaginationQuery, PaginatedResponse } from "../types";
export declare const inventoryService: {
    stockIn(dto: StockInDto, userId: string): Promise<StockMovement>;
    stockOut(dto: StockOutDto, userId: string): Promise<StockMovement>;
    transfer(dto: StockTransferDto, userId: string): Promise<void>;
    adjustment(dto: StockAdjustmentDto, userId: string): Promise<StockMovement>;
    getMovements(query: PaginationQuery & {
        type?: string;
        warehouseId?: string;
        productId?: string;
    }): Promise<PaginatedResponse<StockMovement>>;
};
//# sourceMappingURL=inventory.service.d.ts.map