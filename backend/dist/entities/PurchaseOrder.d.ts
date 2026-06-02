import { Supplier } from './Supplier';
import { Warehouse } from './Warehouse';
import { User } from './User';
import { PurchaseOrderItem } from './PurchaseOrderItem';
export declare class PurchaseOrder {
    id: string;
    poNumber: string;
    supplierId: string;
    warehouseId: string;
    createdBy: string;
    approvedBy?: string;
    status: string;
    totalAmount: number;
    expectedDeliveryDate: Date;
    actualDeliveryDate?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    supplier: Supplier;
    warehouse: Warehouse;
    creator: User;
    items: PurchaseOrderItem[];
    generateId(): void;
}
//# sourceMappingURL=PurchaseOrder.d.ts.map