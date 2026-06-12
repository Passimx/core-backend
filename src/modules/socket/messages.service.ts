import { Injectable } from '@nestjs/common';
import { WsServer } from './raw/socket-server';
import { SendMessageDto } from './dto/requests/send-message.dto';
import { EventsEnum } from './types/event.enum';
import { EntityManager } from 'typeorm';
import { SessionEntity } from '../database/entities/session.entity';

@Injectable()
export class MessagesService {
  constructor(
    private readonly wsServer: WsServer,
    private readonly em: EntityManager,
  ) {}

  public async onMessage(body: SendMessageDto) {
    switch (body.event) {
      case EventsEnum.LOGOUT:
        const session = await this.em.findOneOrFail(SessionEntity, {
          where: { id: body.data },
        });

        const userRoom = this.wsServer.userRooms.get(session.userId);
        if (!userRoom) return;
        const connectionIds = Array.from(userRoom);

        for (const connectionId of connectionIds) {
          const connection = this.wsServer.connections.get(connectionId);
          await connection?.client.logout(session);
        }

        break;
    }
  }
}
