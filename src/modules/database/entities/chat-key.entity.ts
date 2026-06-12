import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';
import { ChatEntity } from './chat.entity';

@Entity({ name: 'chat_keys' })
export class ChatKeyEntity {
  @Column({ name: 'chat_id', primary: true })
  readonly chatId: string;

  @Column({ name: 'user_id', primary: true })
  readonly userId: string;

  @Column({ name: 'encryption_key', length: 2 ** 12, nullable: true })
  readonly encryptionKey: string;

  @Column({ name: 'read_message_number', type: 'bigint', default: 0 })
  readonly readMessageNumber: number;

  @ManyToOne(() => ChatEntity)
  @JoinColumn({ name: 'chat_id' })
  readonly chat: ChatEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  readonly user: UserEntity;
}
