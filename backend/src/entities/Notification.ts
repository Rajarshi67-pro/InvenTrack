import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User';

@Entity('NOTIFICATIONS')
export class Notification {
  @PrimaryColumn({ name: 'NOTIFICATION_ID', type: 'varchar2', length: 36 })
  id!: string;

  @Column({ name: 'USER_ID', type: 'varchar2', length: 36 })
  userId!: string;

  @Column({ name: 'TYPE', type: 'varchar2', length: 50 })
  type!: string;

  @Column({ name: 'TITLE', type: 'varchar2', length: 200 })
  title!: string;

  @Column({ name: 'MESSAGE', type: 'varchar2', length: 1000 })
  message!: string;

  @Column({ name: 'ENTITY_TYPE', type: 'varchar2', length: 50, nullable: true })
  entityType?: string;

  @Column({ name: 'ENTITY_ID', type: 'varchar2', length: 36, nullable: true })
  entityId?: string;

  @Column({ name: 'IS_READ', type: 'number', default: 0 })
  isRead!: number;

  @Column({ name: 'SEVERITY', type: 'varchar2', length: 20, default: 'LOW' })
  severity!: string;

  @CreateDateColumn({ name: 'CREATED_AT', type: 'date' })
  createdAt!: Date;

  @ManyToOne(() => User, (u) => u.notifications)
  @JoinColumn({ name: 'USER_ID' })
  user!: User;

  @BeforeInsert()
  generateId() { if (!this.id) this.id = uuidv4(); }
}
