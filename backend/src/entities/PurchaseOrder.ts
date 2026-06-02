import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Supplier } from './Supplier';
import { Warehouse } from './Warehouse';
import { User } from './User';
import { PurchaseOrderItem } from './PurchaseOrderItem';

@Entity('PURCHASE_ORDERS')
export class PurchaseOrder {
  @PrimaryColumn({ name: 'PO_ID', type: 'varchar2', length: 36 })
  id!: string;

  @Column({ name: 'PO_NUMBER', type: 'varchar2', length: 50, unique: true })
  poNumber!: string;

  @Column({ name: 'SUPPLIER_ID', type: 'varchar2', length: 36 })
  supplierId!: string;

  @Column({ name: 'WAREHOUSE_ID', type: 'varchar2', length: 36 })
  warehouseId!: string;

  @Column({ name: 'CREATED_BY', type: 'varchar2', length: 36 })
  createdBy!: string;

  @Column({ name: 'APPROVED_BY', type: 'varchar2', length: 36, nullable: true })
  approvedBy?: string;

  @Column({ name: 'STATUS', type: 'varchar2', length: 20, default: 'DRAFT' })
  status!: string;

  @Column({ name: 'TOTAL_AMOUNT', type: 'number', precision: 14, scale: 2, default: 0 })
  totalAmount!: number;

  @Column({ name: 'EXPECTED_DELIVERY_DATE', type: 'date' })
  expectedDeliveryDate!: Date;

  @Column({ name: 'ACTUAL_DELIVERY_DATE', type: 'date', nullable: true })
  actualDeliveryDate?: Date;

  @Column({ name: 'NOTES', type: 'varchar2', length: 500, nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'CREATED_AT', type: 'date' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'UPDATED_AT', type: 'date' })
  updatedAt!: Date;

  @ManyToOne(() => Supplier, (s) => s.purchaseOrders)
  @JoinColumn({ name: 'SUPPLIER_ID' })
  supplier!: Supplier;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'WAREHOUSE_ID' })
  warehouse!: Warehouse;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'CREATED_BY' })
  creator!: User;

  @OneToMany(() => PurchaseOrderItem, (poi) => poi.purchaseOrder, { cascade: true })
  items!: PurchaseOrderItem[];

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = uuidv4();
    if (!this.poNumber) {
      const date = new Date();
      this.poNumber = `PO-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    }
  }
}
