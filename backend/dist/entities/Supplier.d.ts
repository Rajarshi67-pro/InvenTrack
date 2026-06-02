import { Product } from './Product';
import { PurchaseOrder } from './PurchaseOrder';
export declare class Supplier {
    id: string;
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    country: string;
    gstNumber?: string;
    leadTimeDays: number;
    paymentTerms?: string;
    rating: number;
    totalOrders: number;
    onTimeDeliveries: number;
    notes?: string;
    isActive: number;
    createdAt: Date;
    updatedAt: Date;
    products: Product[];
    purchaseOrders: PurchaseOrder[];
    get deliveryPerformance(): number;
    generateId(): void;
}
//# sourceMappingURL=Supplier.d.ts.map