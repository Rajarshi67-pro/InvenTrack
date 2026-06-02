import { Product } from './Product';
import { StockMovement } from './StockMovement';
export declare class Warehouse {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode?: string;
    contactPerson: string;
    contactPhone: string;
    contactEmail?: string;
    capacity: number;
    currentStockCount: number;
    isActive: number;
    createdAt: Date;
    updatedAt: Date;
    products: Product[];
    stockMovements: StockMovement[];
    get utilizationPercent(): number;
    generateId(): void;
}
//# sourceMappingURL=Warehouse.d.ts.map