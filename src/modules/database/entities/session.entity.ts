import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { PushSubscriptionPayload } from '../../push-subscription/types/push-subscription.type';

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

  @Column({ name: 'lang', type: 'varchar', length: 2 ** 1, default: 'en' })
  readonly lang: string;

  @Column({ name: 'push_subscription_payload', type: 'jsonb', nullable: true })
  readonly pushSubscriptionPayload: PushSubscriptionPayload | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  readonly updatedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  readonly createdAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  readonly user: UserEntity;
}
