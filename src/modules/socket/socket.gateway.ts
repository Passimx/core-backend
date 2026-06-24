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
import { EventsEnum } from './types/event.enum';
import { SubscribeMessageEnum } from './types/subscribe-message.enum';
import { EntityManager } from 'typeorm';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/requests/send-message.dto';
import { SendAsyncMessageDto } from './dto/requests/send-async-message.dto';
import { AsyncMessagesService } from './async-messages.service';

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
    socket.client.emit(EventsEnum.SET_STATE_APP, { connectionId: socket.id });
  }

  handleDisconnect(@ConnectedSocket() socket: ClientSocket) {
    return socket.client?.leaveConnection();
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

  @SubscribeMessage(SubscribeMessageEnum.SEND_ASYNC_MESSAGE)
  asyncMessage(
    @ConnectedSocket() socket: ClientSocket,
    @MessageBody() body: { data: SendAsyncMessageDto; queryId: string },
  ) {
    return this.asyncMessagesService.onMessage(socket, body.data, body.queryId);
  }
}
