import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Envs } from '../../common/envs/envs';
import {
  type ClientSocket,
  CustomWebSocketClient,
} from './types/client-socket.type';
import { WsServer } from './raw/socket-server';
import { Body } from '@nestjs/common';
import { AuthService } from '../auth/services/auth.service';
import { EventsEnum } from './types/event.enum';
import { SubscribeMessageEnum } from './types/subscribe-message.enum';
import { EntityManager } from 'typeorm';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/requests/send-message.dto';
import { TokenType } from '../auth/types/token.type';

@WebSocketGateway(Envs.app.socketPort, {
  cors: {
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayDisconnect {
  constructor(
    private readonly wsServer: WsServer,
    private readonly authService: AuthService,
    private readonly em: EntityManager,
    private readonly messagesService: MessagesService,
  ) {}

  handleDisconnect(@ConnectedSocket() socket: ClientSocket) {
    return socket.client?.leaveConnection();
  }

  @SubscribeMessage(SubscribeMessageEnum.VERIFY)
  async verify(
    @ConnectedSocket() socket: ClientSocket,
    @Body() tokens: string[],
  ) {
    const sessions: TokenType[] = [];
    for (const token of tokens) {
      const tokenPayload = await this.authService.verifyTokenAsync(token);
      if (tokenPayload) sessions.push(tokenPayload);
      else
        socket.send(
          JSON.stringify({ event: EventsEnum.LOGOUT, data: { token } }),
        );
    }

    if (!sessions.length) return socket.close();

    await CustomWebSocketClient.createInstance(
      this.wsServer,
      this.em,
      socket,
      sessions,
    );
  }

  @SubscribeMessage(SubscribeMessageEnum.PING)
  pong(@ConnectedSocket() socket: ClientSocket): void {
    socket.client.emit(EventsEnum.PONG);
    socket.client.setPingTimeout();
  }

  @SubscribeMessage(SubscribeMessageEnum.SEND_MESSAGE)
  message(
    @ConnectedSocket() socket: ClientSocket,
    @MessageBody() body: { data: SendMessageDto },
  ) {
    return this.messagesService.onMessage(socket, body.data);
  }
}
