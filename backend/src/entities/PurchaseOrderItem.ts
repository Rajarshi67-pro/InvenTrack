import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { PurchaseOrder } from './PurchaseOrder';
import { Product } from './Product';

@Entity('PURCHASE_ORDER_ITEMS')
export class PurchaseOrderItem {
  @PrimaryColumn({ name: 'ITEM_ID', type: 'varchar2', length: 36 })
  id!: string;

  @Column({ name: 'PO_ID', type: 'varchar2', length: 36 })
  purchaseOrderId!: string;

  @Column({ name: 'PRODUCT_ID', type: 'varchar2', length: 36 })
  productId!: string;

  @Column({ name: 'QUANTITY', type: 'number' })
  quantity!: number;

  @Column({ name: 'UNIT_PRICE', type: 'number', precision: 14, scale: 2 })
  unitPrice!: number;

  @Column({ name: 'TOTAL_PRICE', type: 'number', precision: 14, scale: 2 })
  totalPrice!: number;

  @Column({ name: 'RECEIVED_QUANTITY', type: 'number', default: 0 })
  receivedQuantity!: number;

  @ManyToOne(() => PurchaseOrder, (po) => po.items)
  @JoinColumn({ name: 'PO_ID' })
  purchaseOrder!: PurchaseOrder;

  @ManyToOne(() => Product, (p) => p.purchaseOrderItems)
  @JoinColumn({ name: 'PRODUCT_ID' })
  product!: Product;

  @BeforeInsert()
  setTotalAndId() {
    if (!this.id) this.id = uuidv4();
    this.totalPrice = this.quantity * this.unitPrice;
  }
}
