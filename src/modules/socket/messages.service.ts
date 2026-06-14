import { Injectable } from '@nestjs/common';
import { WsServer } from './raw/socket-server';
import { SendMessageDto } from './dto/requests/send-message.dto';
import { EventsEnum } from './types/event.enum';
import { EntityManager } from 'typeorm';
import { SessionEntity } from '../database/entities/session.entity';
import type { ClientSocket } from './types/client-socket.type';
import { UserEntity } from '../database/entities/user.entity';

@Injectable()
export class MessagesService {
  constructor(
    private readonly wsServer: WsServer,
    private readonly em: EntityManager,
  ) {}

  public async onMessage(socket: ClientSocket, body: SendMessageDto) {
    const { event, data } = body;
    switch (event) {
      case EventsEnum.LOGOUT:
        const currentSession = socket.client.sessions.find(
          (session) => session.sessionId === data.id,
        );
        if (!currentSession) return;

        const sessionId = data.id;
        const session = await this.em.findOne(SessionEntity, {
          where: { id: sessionId },
        });
        if (!session) return;

        const userRoom = this.wsServer.userRooms.get(session.userId);
        if (!userRoom) return;
        const connectionIds = Array.from(userRoom);

        for (const connectionId of connectionIds) {
          const connection = this.wsServer.connections.get(connectionId);
          await connection?.client.logout(session);
        }

        break;
      case EventsEnum.UPDATE_USER:
        const { id, ...payload } = data;
        const userSession = socket.client.sessions.find(
          (session) => session.userId === id,
        );
        if (!userSession) return;

        await this.em.update(UserEntity, { id }, payload);
        this.wsServer.toUserRoom(id!).emit(EventsEnum.UPDATE_USER, data);

        break;
    }
  }
}
