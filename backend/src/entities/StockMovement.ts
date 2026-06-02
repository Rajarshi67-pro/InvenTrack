import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Product } from './Product';
import { Warehouse } from './Warehouse';
import { User } from './User';

@Entity('STOCK_MOVEMENTS')
export class StockMovement {
  @PrimaryColumn({ name: 'MOVEMENT_ID', type: 'varchar2', length: 36 })
  id!: string;

  @Column({ name: 'PRODUCT_ID', type: 'varchar2', length: 36 })
  productId!: string;

  @Column({ name: 'WAREHOUSE_ID', type: 'varchar2', length: 36 })
  warehouseId!: string;

  @Column({ name: 'MOVEMENT_TYPE', type: 'varchar2', length: 20 })
  movementType!: string; // IN | OUT | TRANSFER | ADJUSTMENT

  @Column({ name: 'QUANTITY', type: 'number' })
  quantity!: number;

  @Column({ name: 'FROM_WAREHOUSE_ID', type: 'varchar2', length: 36, nullable: true })
  fromWarehouseId?: string;

  @Column({ name: 'TO_WAREHOUSE_ID', type: 'varchar2', length: 36, nullable: true })
  toWarehouseId?: string;

  @Column({ name: 'PURCHASE_ORDER_ID', type: 'varchar2', length: 36, nullable: true })
  purchaseOrderId?: string;

  @Column({ name: 'BATCH_NUMBER', type: 'varchar2', length: 100, nullable: true })
  batchNumber?: string;

  @Column({ name: 'EXPIRY_DATE', type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ name: 'UNIT_COST', type: 'number', precision: 14, scale: 2, nullable: true })
  unitCost?: number;

  @Column({ name: 'PERFORMED_BY', type: 'varchar2', length: 36 })
  performedBy!: string;

  @Column({ name: 'REMARKS', type: 'varchar2', length: 500, nullable: true })
  remarks?: string;

  @Column({ name: 'BARCODE_SCAN', type: 'number', default: 0 })
  wasBarcodeScan!: number;

  @CreateDateColumn({ name: 'CREATED_AT', type: 'date' })
  createdAt!: Date;

  @ManyToOne(() => Product, (p) => p.stockMovements)
  @JoinColumn({ name: 'PRODUCT_ID' })
  product!: Product;

  @ManyToOne(() => Warehouse, (w) => w.stockMovements)
  @JoinColumn({ name: 'WAREHOUSE_ID' })
  warehouse!: Warehouse;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'PERFORMED_BY' })
  performer!: User;

  @BeforeInsert()
  generateId() { if (!this.id) this.id = uuidv4(); }
}
