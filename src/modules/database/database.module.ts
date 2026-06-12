import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'path';
import { Envs } from '../../common/envs/envs';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: Envs.database.host,
      port: Envs.database.port,
      database: Envs.database.database,
      username: Envs.database.username,
      password: Envs.database.password,
      synchronize: true,
      // logging: true,
      entities: [resolve(__dirname + '/../**/*.entity{.ts,.js}')],
    }),
  ],
})
export class DatabaseModule {}
