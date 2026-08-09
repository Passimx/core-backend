import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
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
import { SubscribeMessageEnum } from './types/request/subscribe-message.enum';
import { EntityManager } from 'typeorm';
import { MessagesService } from './messages.service';
import { type SendMessageType } from './types/request/send-message.type';
import { SendAsyncMessageType } from './types/request/send-async-message.type';
import { AsyncMessagesService } from './async-messages.service';
import { ResponseEventsEnum } from './types/response/response.events.enum';

@WebSocketGateway(Envs.app.socketPort, {
  cors: {
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayDisconnect, OnGatewayConnection {
  constructor(
    private readonly wsServer: WsServer,
    private readonly em: EntityManager,
    private readonly messagesService: MessagesService,
    private readonly asyncMessagesService: AsyncMessagesService,
  ) {}

  handleConnection(@ConnectedSocket() socket: ClientSocket) {
    CustomWebSocketClient.createInstance(this.wsServer, this.em, socket);
    this.wsServer
      .toConnection(socket.id)
      .emit({ event: ResponseEventsEnum.GET_CONNECTION_ID, data: socket.id });
  }

  handleDisconnect(@ConnectedSocket() socket: ClientSocket) {
    return socket.client?.leaveConnection();
  }

  @SubscribeMessage(SubscribeMessageEnum.PING)
  pong(@ConnectedSocket() socket: ClientSocket): void {
    this.wsServer
      .toConnection(socket.id)
      .emit({ event: ResponseEventsEnum.PONG });
    socket.client.setPingTimeout();
  }

  @SubscribeMessage(SubscribeMessageEnum.SEND_MESSAGE)
  message(
    @ConnectedSocket() socket: ClientSocket,
    @MessageBody() body: SendMessageType,
  ) {
    return this.messagesService.onMessage(socket, body);
  }

  @SubscribeMessage(SubscribeMessageEnum.SEND_ASYNC_MESSAGE)
  asyncMessage(
    @ConnectedSocket() socket: ClientSocket,
    @MessageBody() body: { data: SendAsyncMessageType; queryId: string },
  ) {
    return this.asyncMessagesService.onMessage(socket, body.data, body.queryId);
  }
}
