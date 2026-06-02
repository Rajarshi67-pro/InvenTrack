import {
  Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn, BeforeInsert
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Warehouse } from './Warehouse';
import { AuditLog } from './AuditLog';
import { RefreshToken } from './RefreshToken';
import { Notification } from './Notification';

@Entity('USERS')
export class User {
  @PrimaryColumn({ name: 'USER_ID', type: 'varchar2', length: 36 })
  id!: string;

  @Column({ name: 'FULL_NAME', type: 'varchar2', length: 100 })
  fullName!: string;

  @Column({ name: 'EMAIL', type: 'varchar2', length: 150, unique: true })
  email!: string;

  @Column({ name: 'PASSWORD_HASH', type: 'varchar2', length: 255 })
  passwordHash!: string;

  @Column({ name: 'ROLE', type: 'varchar2', length: 20, default: 'MANAGER' })
  role!: string;

  @Column({ name: 'PHONE', type: 'varchar2', length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'IS_ACTIVE', type: 'number', default: 1 })
  isActive!: number;

  @Column({ name: 'WAREHOUSE_ID', type: 'varchar2', length: 36, nullable: true })
  warehouseId?: string;

  @Column({ name: 'LAST_LOGIN', type: 'date', nullable: true })
  lastLogin?: Date;

  @Column({ name: 'RESET_TOKEN', type: 'varchar2', length: 255, nullable: true })
  resetToken?: string;

  @Column({ name: 'RESET_TOKEN_EXPIRY', type: 'date', nullable: true })
  resetTokenExpiry?: Date;

  @Column({ name: 'FAILED_LOGIN_ATTEMPTS', type: 'number', default: 0 })
  failedLoginAttempts!: number;

  @Column({ name: 'LOCKED_UNTIL', type: 'date', nullable: true })
  lockedUntil?: Date;

  @CreateDateColumn({ name: 'CREATED_AT', type: 'date' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'UPDATED_AT', type: 'date' })
  updatedAt!: Date;

  @ManyToOne(() => Warehouse, { nullable: true })
  @JoinColumn({ name: 'WAREHOUSE_ID' })
  warehouse?: Warehouse;

  @OneToMany(() => RefreshToken, (rt) => rt.user)
  refreshTokens!: RefreshToken[];

  @OneToMany(() => AuditLog, (al) => al.user)
  auditLogs!: AuditLog[];

  @OneToMany(() => Notification, (n) => n.user)
  notifications!: Notification[];

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = uuidv4();
  }

  toSafeObject() {
    const { passwordHash, resetToken, resetTokenExpiry, ...safe } = this;
    return safe;
  }
}
