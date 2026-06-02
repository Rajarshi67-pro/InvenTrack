import { Entity, PrimaryColumn, Column, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('ROLES')
export class Role {
  @PrimaryColumn({ name: 'ROLE_ID', type: 'varchar2', length: 36 })
  id!: string;

  @Column({ name: 'NAME', type: 'varchar2', length: 50, unique: true })
  name!: string;

  @Column({ name: 'DESCRIPTION', type: 'varchar2', length: 300, nullable: true })
  description?: string;

  @Column({ name: 'PERMISSIONS', type: 'clob', nullable: true })
  permissions?: string;

  @BeforeInsert()
  generateId() { if (!this.id) this.id = uuidv4(); }

  getPermissions(): string[] {
    try { return JSON.parse(this.permissions || '[]'); }
    catch { return []; }
  }
}
