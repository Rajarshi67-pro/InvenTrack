import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Product } from './Product';
import { PurchaseOrder } from './PurchaseOrder';

@Entity('SUPPLIERS')
export class Supplier {
  @PrimaryColumn({ name: 'SUPPLIER_ID', type: 'varchar2', length: 36 })
  id!: string;

  @Column({ name: 'NAME', type: 'varchar2', length: 150 })
  name!: string;

  @Column({ name: 'CONTACT_PERSON', type: 'varchar2', length: 100 })
  contactPerson!: string;

  @Column({ name: 'PHONE', type: 'varchar2', length: 20 })
  phone!: string;

  @Column({ name: 'EMAIL', type: 'varchar2', length: 150 })
  email!: string;

  @Column({ name: 'ADDRESS', type: 'varchar2', length: 300 })
  address!: string;

  @Column({ name: 'CITY', type: 'varchar2', length: 100 })
  city!: string;

  @Column({ name: 'STATE', type: 'varchar2', length: 100 })
  state!: string;

  @Column({ name: 'COUNTRY', type: 'varchar2', length: 100 })
  country!: string;

  @Column({ name: 'GST_NUMBER', type: 'varchar2', length: 20, nullable: true })
  gstNumber?: string;

  @Column({ name: 'LEAD_TIME_DAYS', type: 'number', default: 7 })
  leadTimeDays!: number;

  @Column({ name: 'PAYMENT_TERMS', type: 'varchar2', length: 200, nullable: true })
  paymentTerms?: string;

  @Column({ name: 'RATING', type: 'number', precision: 3, scale: 1, default: 0 })
  rating!: number;

  @Column({ name: 'TOTAL_ORDERS', type: 'number', default: 0 })
  totalOrders!: number;

  @Column({ name: 'ON_TIME_DELIVERIES', type: 'number', default: 0 })
  onTimeDeliveries!: number;

  @Column({ name: 'NOTES', type: 'varchar2', length: 500, nullable: true })
  notes?: string;

  @Column({ name: 'IS_ACTIVE', type: 'number', default: 1 })
  isActive!: number;

  @CreateDateColumn({ name: 'CREATED_AT', type: 'date' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'UPDATED_AT', type: 'date' })
  updatedAt!: Date;

  @OneToMany(() => Product, (p) => p.supplier)
  products!: Product[];

  @OneToMany(() => PurchaseOrder, (po) => po.supplier)
  purchaseOrders!: PurchaseOrder[];

  get deliveryPerformance(): number {
    if (this.totalOrders === 0) return 0;
    return Math.round((this.onTimeDeliveries / this.totalOrders) * 100);
  }

  @BeforeInsert()
  generateId() { if (!this.id) this.id = uuidv4(); }
}
