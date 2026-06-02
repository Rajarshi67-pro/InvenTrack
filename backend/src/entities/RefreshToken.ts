import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User';

@Entity('REFRESH_TOKENS')
export class RefreshToken {
  @PrimaryColumn({ name: 'TOKEN_ID', type: 'varchar2', length: 36 })
  id!: string;

  @Column({ name: 'USER_ID', type: 'varchar2', length: 36 })
  userId!: string;

  @Column({ name: 'TOKEN', type: 'varchar2', length: 500, unique: true })
  token!: string;

  @Column({ name: 'TOKEN_FAMILY', type: 'varchar2', length: 36 })
  tokenFamily!: string;

  @Column({ name: 'EXPIRES_AT', type: 'date' })
  expiresAt!: Date;

  @Column({ name: 'IS_REVOKED', type: 'number', default: 0 })
  isRevoked!: number;

  @CreateDateColumn({ name: 'CREATED_AT', type: 'date' })
  createdAt!: Date;

  @ManyToOne(() => User, (u) => u.refreshTokens)
  @JoinColumn({ name: 'USER_ID' })
  user!: User;

  @BeforeInsert()
  generateId() { if (!this.id) this.id = uuidv4(); }

  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}
