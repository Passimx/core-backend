import { Module } from '@nestjs/common';
import { SocketModule } from './socket/socket.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { AuthGuard } from '../common/guards/auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [DatabaseModule, SocketModule, AuthModule],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
