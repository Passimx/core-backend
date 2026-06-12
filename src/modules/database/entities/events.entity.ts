import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('events')
export class EventsEntity {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;
}
