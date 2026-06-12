import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'sessions' })
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  readonly id: string;

  @Column({ name: 'user_id' })
  readonly userId: string;

  @Column({ name: 'encryption_user_agent', type: 'varchar', length: 2 ** 12 })
  readonly encryptionUserAgent!: string;

  @Column({ name: 'is_online', type: 'boolean', default: false })
  readonly isOnline!: boolean;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  readonly updatedAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  readonly user: UserEntity;
}
