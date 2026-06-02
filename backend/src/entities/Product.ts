import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Warehouse } from './Warehouse';
import { Supplier } from './Supplier';
import { StockMovement } from './StockMovement';
import { PurchaseOrderItem } from './PurchaseOrderItem';
import { Forecast } from './Forecast';

@Entity('PRODUCTS')
export class Product {
  @PrimaryColumn({ name: 'PRODUCT_ID', type: 'varchar2', length: 36 })
  id!: string;

  @Column({ name: 'SKU', type: 'varchar2', length: 100, unique: true })
  sku!: string;

  @Column({ name: 'NAME', type: 'varchar2', length: 200 })
  name!: string;

  @Column({ name: 'CATEGORY', type: 'varchar2', length: 100 })
  category!: string;

  @Column({ name: 'DESCRIPTION', type: 'varchar2', length: 1000, nullable: true })
  description?: string;

  @Column({ name: 'UNIT_PRICE', type: 'number', precision: 14, scale: 2 })
  unitPrice!: number;

  @Column({ name: 'QUANTITY', type: 'number', default: 0 })
  quantity!: number;

  @Column({ name: 'MIN_STOCK_LEVEL', type: 'number', default: 10 })
  minStockLevel!: number;

  @Column({ name: 'MAX_STOCK_LEVEL', type: 'number', default: 1000 })
  maxStockLevel!: number;

  @Column({ name: 'REORDER_POINT', type: 'number', default: 20 })
  reorderPoint!: number;

  @Column({ name: 'UNIT_OF_MEASURE', type: 'varchar2', length: 50, default: 'UNIT' })
  unitOfMeasure!: string;

  @Column({ name: 'WEIGHT', type: 'number', nullable: true })
  weight?: number;

  @Column({ name: 'DIMENSIONS', type: 'varchar2', length: 100, nullable: true })
  dimensions?: string;

  @Column({ name: 'BARCODE', type: 'varchar2', length: 255, nullable: true })
  barcode?: string;

  @Column({ name: 'BARCODE_TYPE', type: 'varchar2', length: 20, default: 'CODE128' })
  barcodeType!: string;

  @Column({ name: 'WAREHOUSE_ID', type: 'varchar2', length: 36, nullable: true })
  warehouseId?: string;

  @Column({ name: 'SUPPLIER_ID', type: 'varchar2', length: 36, nullable: true })
  supplierId?: string;

  @Column({ name: 'IS_ACTIVE', type: 'number', default: 1 })
  isActive!: number;

  @CreateDateColumn({ name: 'CREATED_AT', type: 'date' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'UPDATED_AT', type: 'date' })
  updatedAt!: Date;

  @ManyToOne(() => Warehouse, (w) => w.products, { nullable: true })
  @JoinColumn({ name: 'WAREHOUSE_ID' })
  warehouse?: Warehouse;

  @ManyToOne(() => Supplier, (s) => s.products, { nullable: true })
  @JoinColumn({ name: 'SUPPLIER_ID' })
  supplier?: Supplier;

  @OneToMany(() => StockMovement, (sm) => sm.product)
  stockMovements!: StockMovement[];

  @OneToMany(() => PurchaseOrderItem, (poi) => poi.product)
  purchaseOrderItems!: PurchaseOrderItem[];

  @OneToMany(() => Forecast, (f) => f.product)
  forecasts!: Forecast[];

  get stockStatus(): string {
    if (this.quantity === 0) return 'OUT_OF_STOCK';
    if (this.quantity <= this.minStockLevel) return 'LOW_STOCK';
    if (this.quantity >= this.maxStockLevel) return 'OVERSTOCK';
    return 'NORMAL';
  }

  get inventoryValue(): number {
    return this.quantity * this.unitPrice;
  }

  @BeforeInsert()
  generateId() { if (!this.id) this.id = uuidv4(); }
}
