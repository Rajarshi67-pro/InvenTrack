import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Product } from './Product';
import { StockMovement } from './StockMovement';

@Entity('WAREHOUSES')
export class Warehouse {
  @PrimaryColumn({ name: 'WAREHOUSE_ID', type: 'varchar2', length: 36 })
  id!: string;

  @Column({ name: 'NAME', type: 'varchar2', length: 150 })
  name!: string;

  @Column({ name: 'ADDRESS', type: 'varchar2', length: 300 })
  address!: string;

  @Column({ name: 'CITY', type: 'varchar2', length: 100 })
  city!: string;

  @Column({ name: 'STATE', type: 'varchar2', length: 100 })
  state!: string;

  @Column({ name: 'COUNTRY', type: 'varchar2', length: 100 })
  country!: string;

  @Column({ name: 'PIN_CODE', type: 'varchar2', length: 20, nullable: true })
  pinCode?: string;

  @Column({ name: 'CONTACT_PERSON', type: 'varchar2', length: 100 })
  contactPerson!: string;

  @Column({ name: 'CONTACT_PHONE', type: 'varchar2', length: 20 })
  contactPhone!: string;

  @Column({ name: 'CONTACT_EMAIL', type: 'varchar2', length: 150, nullable: true })
  contactEmail?: string;

  @Column({ name: 'CAPACITY', type: 'number' })
  capacity!: number;

  @Column({ name: 'CURRENT_STOCK_COUNT', type: 'number', default: 0 })
  currentStockCount!: number;

  @Column({ name: 'IS_ACTIVE', type: 'number', default: 1 })
  isActive!: number;

  @CreateDateColumn({ name: 'CREATED_AT', type: 'date' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'UPDATED_AT', type: 'date' })
  updatedAt!: Date;

  @OneToMany(() => Product, (p) => p.warehouse)
  products!: Product[];

  @OneToMany(() => StockMovement, (sm) => sm.warehouse)
  stockMovements!: StockMovement[];

  get utilizationPercent(): number {
    return this.capacity > 0 ? Math.round((this.currentStockCount / this.capacity) * 100) : 0;
  }

  @BeforeInsert()
  generateId() { if (!this.id) this.id = uuidv4(); }
}
