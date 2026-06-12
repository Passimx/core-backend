import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ChatEntity } from './chat.entity';

@Entity('messages')
export class MessageEntity {
  @Column({ type: 'integer', primary: true })
  id: string;

  @Column({ type: 'varchar', length: 2 ** 10 })
  readonly text: string;

  @Column({ name: 'user_id' })
  readonly userId: UserEntity;

  @Column({ name: 'chat_id', primary: true })
  readonly chatId: UserEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', primary: true })
  readonly createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  readonly updatedAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  readonly from: UserEntity;

  @ManyToOne(() => ChatEntity)
  @JoinColumn({ name: 'chat_id' })
  readonly chat: ChatEntity;
}
