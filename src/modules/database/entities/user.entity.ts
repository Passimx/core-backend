import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';
import { PeriodEnum } from '../types/period.enum';

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
  readonly firstName: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 2 ** 5,
    nullable: true,
  })
  readonly lastName: string;

  @Column({
    name: 'language_code',
    type: 'varchar',
    length: 2 ** 1,
    default: 'en',
  })
  readonly languageCode: string;

  @Column({ name: 'rsa_public_key', type: 'varchar', length: 2 ** 12 })
  readonly rsaPublicKey: string;

  @Column({
    name: 'encrypted_rsa_private_key',
    type: 'varchar',
    length: 2 ** 14,
  })
  readonly encryptedRsaPrivateKey!: string;

  @Column({
    name: 'auto_terminate_session',
    type: 'enum',
    enum: PeriodEnum,
    default: PeriodEnum.SIX_MONTH,
  })
  readonly autoTerminateSession: PeriodEnum;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  readonly createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  readonly updated: Date;
}
