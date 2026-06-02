import { Warehouse } from './Warehouse';
import { Supplier } from './Supplier';
import { StockMovement } from './StockMovement';
import { PurchaseOrderItem } from './PurchaseOrderItem';
import { Forecast } from './Forecast';
export declare class Product {
    id: string;
    sku: string;
    name: string;
    category: string;
    description?: string;
    unitPrice: number;
    quantity: number;
    minStockLevel: number;
    maxStockLevel: number;
    reorderPoint: number;
    unitOfMeasure: string;
    weight?: number;
    dimensions?: string;
    barcode?: string;
    barcodeType: string;
    warehouseId?: string;
    supplierId?: string;
    isActive: number;
    createdAt: Date;
    updatedAt: Date;
    warehouse?: Warehouse;
    supplier?: Supplier;
    stockMovements: StockMovement[];
    purchaseOrderItems: PurchaseOrderItem[];
    forecasts: Forecast[];
    get stockStatus(): string;
    get inventoryValue(): number;
    generateId(): void;
}
//# sourceMappingURL=Product.d.ts.map