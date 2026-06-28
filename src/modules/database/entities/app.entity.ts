import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'apps' })
export class AppEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  readonly id: string;

  @Column({ name: 'name', type: 'varchar', length: 2 ** 4 })
  readonly name: string;

  @Column({ name: 'home_url', type: 'varchar', length: 2 ** 6 })
  readonly homeUrl: string;

  @Column({ name: 'icon_url', type: 'varchar', length: 2 ** 6 })
  readonly iconUrl: string;
}
