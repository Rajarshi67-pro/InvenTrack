import { PurchaseOrder } from './PurchaseOrder';
import { Product } from './Product';
export declare class PurchaseOrderItem {
    id: string;
    purchaseOrderId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    receivedQuantity: number;
    purchaseOrder: PurchaseOrder;
    product: Product;
    setTotalAndId(): void;
}
//# sourceMappingURL=PurchaseOrderItem.d.ts.map