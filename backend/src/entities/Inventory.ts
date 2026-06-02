import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Product } from './Product';
import { Warehouse } from './Warehouse';

@Entity('INVENTORY')
export class Inventory {
  @PrimaryColumn({ name: 'INVENTORY_ID', type: 'varchar2', length: 36 })
  id!: string;

  @Column({ name: 'PRODUCT_ID', type: 'varchar2', length: 36 })
  productId!: string;

  @Column({ name: 'WAREHOUSE_ID', type: 'varchar2', length: 36 })
  warehouseId!: string;

  @Column({ name: 'QUANTITY_ON_HAND', type: 'number', default: 0 })
  quantityOnHand!: number;

  @Column({ name: 'QUANTITY_RESERVED', type: 'number', default: 0 })
  quantityReserved!: number;

  @Column({ name: 'QUANTITY_AVAILABLE', type: 'number', default: 0 })
  quantityAvailable!: number;

  @Column({ name: 'LAST_AUDIT_DATE', type: 'date', nullable: true })
  lastAuditDate?: Date;

  @Column({ name: 'LAST_COUNT_QUANTITY', type: 'number', nullable: true })
  lastCountQuantity?: number;

  @Column({ name: 'AVERAGE_COST', type: 'number', precision: 14, scale: 2, default: 0 })
  averageCost!: number;

  @Column({ name: 'TOTAL_VALUE', type: 'number', precision: 14, scale: 2, default: 0 })
  totalValue!: number;

  @CreateDateColumn({ name: 'CREATED_AT', type: 'date' })
  createdAt!: Date;

  @Column({ name: 'UPDATED_AT', type: 'date', nullable: true })
  updatedAt?: Date;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'PRODUCT_ID' })
  product!: Product;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'WAREHOUSE_ID' })
  warehouse!: Warehouse;

  @BeforeInsert()
  generateId() { if (!this.id) this.id = uuidv4(); }
}
