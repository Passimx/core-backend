import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { WsServer } from './raw/socket-server';
import { AuthModule } from '../auth/auth.module';
import { MessagesService } from './messages.service';
import { AsyncMessagesService } from './async-messages.service';
import { PushSubscriptionModule } from '../push-subscription/push-subscription.module';

@Module({
  imports: [AuthModule, PushSubscriptionModule],
  providers: [WsServer, SocketGateway, MessagesService, AsyncMessagesService],
  exports: [WsServer],
})
export class SocketModule {}
