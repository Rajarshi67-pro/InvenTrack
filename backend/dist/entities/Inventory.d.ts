import { Product } from './Product';
import { Warehouse } from './Warehouse';
export declare class Inventory {
    id: string;
    productId: string;
    warehouseId: string;
    quantityOnHand: number;
    quantityReserved: number;
    quantityAvailable: number;
    lastAuditDate?: Date;
    lastCountQuantity?: number;
    averageCost: number;
    totalValue: number;
    createdAt: Date;
    updatedAt?: Date;
    product: Product;
    warehouse: Warehouse;
    generateId(): void;
}
//# sourceMappingURL=Inventory.d.ts.map