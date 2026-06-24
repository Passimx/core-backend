import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { WsServer } from './raw/socket-server';
import { AuthModule } from '../auth/auth.module';
import { MessagesService } from './messages.service';
import { AsyncMessagesService } from './async-messages.service';

@Module({
  imports: [AuthModule],
  providers: [WsServer, SocketGateway, MessagesService, AsyncMessagesService],
  exports: [WsServer],
})
export class SocketModule {}
