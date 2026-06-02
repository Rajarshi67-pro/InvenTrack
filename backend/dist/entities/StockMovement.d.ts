import { Product } from './Product';
import { Warehouse } from './Warehouse';
import { User } from './User';
export declare class StockMovement {
    id: string;
    productId: string;
    warehouseId: string;
    movementType: string;
    quantity: number;
    fromWarehouseId?: string;
    toWarehouseId?: string;
    purchaseOrderId?: string;
    batchNumber?: string;
    expiryDate?: Date;
    unitCost?: number;
    performedBy: string;
    remarks?: string;
    wasBarcodeScan: number;
    createdAt: Date;
    product: Product;
    warehouse: Warehouse;
    performer: User;
    generateId(): void;
}
//# sourceMappingURL=StockMovement.d.ts.map