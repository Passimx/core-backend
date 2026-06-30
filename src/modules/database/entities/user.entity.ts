import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { PeriodEnum } from '../types/period.enum';
import { SessionEntity } from './session.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @Column({ name: 'id', type: 'varchar', length: 2 ** 7, primary: true })
  readonly id: string;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 2 ** 5,
    nullable: true,
  })
  readonly firstName?: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 2 ** 5,
    nullable: true,
  })
  readonly lastName?: string;

  @Column({
    name: 'rsa_public_key',
    type: 'varchar',
    length: 2 ** 12,
  })
  readonly rsaPublicKey: string;

  @Column({ name: 'seed_phrase_hash', type: 'varchar', length: 2 ** 6 })
  readonly seedPhraseHash: string;

  @Column({
    name: 'encrypted_rsa_private_key',
    type: 'varchar',
    length: 2 ** 14,
  })
  readonly encryptedRsaPrivateKey: string;

  @Column({
    name: 'auto_terminate_session',
    type: 'enum',
    enum: PeriodEnum,
    default: PeriodEnum.NEVER,
  })
  readonly autoTerminateSession: PeriodEnum;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  readonly createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  readonly updated: Date;

  @OneToMany(() => SessionEntity, (session) => session.user)
  readonly sessions: SessionEntity[];
}
