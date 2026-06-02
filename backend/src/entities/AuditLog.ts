import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User';

@Entity('AUDIT_LOGS')
export class AuditLog {
  @PrimaryColumn({ name: 'LOG_ID', type: 'varchar2', length: 36 })
  id!: string;

  @Column({ name: 'USER_ID', type: 'varchar2', length: 36, nullable: true })
  userId?: string;

  @Column({ name: 'ACTION', type: 'varchar2', length: 100 })
  action!: string;

  @Column({ name: 'ENTITY_TYPE', type: 'varchar2', length: 50 })
  entityType!: string;

  @Column({ name: 'ENTITY_ID', type: 'varchar2', length: 36, nullable: true })
  entityId?: string;

  @Column({ name: 'OLD_VALUES', type: 'clob', nullable: true })
  oldValues?: string;

  @Column({ name: 'NEW_VALUES', type: 'clob', nullable: true })
  newValues?: string;

  @Column({ name: 'IP_ADDRESS', type: 'varchar2', length: 50, nullable: true })
  ipAddress?: string;

  @Column({ name: 'USER_AGENT', type: 'varchar2', length: 500, nullable: true })
  userAgent?: string;

  @Column({ name: 'STATUS', type: 'varchar2', length: 20, default: 'SUCCESS' })
  status!: string;

  @Column({ name: 'ERROR_MESSAGE', type: 'varchar2', length: 500, nullable: true })
  errorMessage?: string;

  @CreateDateColumn({ name: 'CREATED_AT', type: 'date' })
  createdAt!: Date;

  @ManyToOne(() => User, (u) => u.auditLogs, { nullable: true })
  @JoinColumn({ name: 'USER_ID' })
  user?: User;

  @BeforeInsert()
  generateId() { if (!this.id) this.id = uuidv4(); }
}
