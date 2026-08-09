import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'apps' })
export class AppEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  readonly id: string;

  @Column({ name: 'name', type: 'varchar', length: 2 ** 4 })
  readonly name: string;

  @Column({ name: 'home_url', type: 'varchar', length: 2 ** 6 })
  readonly homeUrl: string;

  @Column({ name: 'user_id' })
  readonly userId: string;

  @Column({ name: 'icon_url', type: 'varchar', length: 2 ** 6 })
  readonly iconUrl: string;

  @DeleteDateColumn({ name: 'deleted_at' })
  readonly deletedAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  readonly user: UserEntity;
}
