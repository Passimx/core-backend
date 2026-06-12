import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatEnum } from '../types/chat.enum';

@Entity({ name: 'chats' })
export class ChatEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  readonly id: string;

  @Column({ type: 'varchar', length: 2 ** 7, nullable: true })
  readonly title: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: ChatEnum,
    nullable: true,
  })
  readonly type: ChatEnum;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  readonly createdAt: Date;
}
