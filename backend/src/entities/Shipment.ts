import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Supplier } from './Supplier';
import { User } from './User';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'shipment_number', unique: true }) shipmentNumber!: string;
  @Column({ name: 'supplier_id', nullable: true }) supplierId?: string;
  @Column({ name: 'warehouse_id', nullable: true }) warehouseId?: string;
  @Column({ name: 'type', default: 'INBOUND' }) type!: string; // INBOUND | OUTBOUND
  @Column({ name: 'status', default: 'CREATED' }) status!: string; // CREATED | PACKED | DISPATCHED | IN_TRANSIT | DELIVERED
  @Column({ name: 'carrier', nullable: true }) carrier?: string;
  @Column({ name: 'tracking_number', nullable: true }) trackingNumber?: string;
  @Column({ name: 'expected_delivery', type: 'date', nullable: true }) expectedDelivery?: Date;
  @Column({ name: 'actual_delivery', type: 'date', nullable: true }) actualDelivery?: Date;
  @Column({ name: 'notes', nullable: true }) notes?: string;
  @Column({ name: 'created_by', nullable: true }) createdBy?: string;
  @Column({ name: 'is_active', default: 1 }) isActive!: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}
