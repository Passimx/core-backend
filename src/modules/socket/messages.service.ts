import { Injectable } from '@nestjs/common';
import { WsServer } from './raw/socket-server';
import { SendMessageDto } from './dto/requests/send-message.dto';
import { EventsEnum } from './types/event.enum';
import { EntityManager, In } from 'typeorm';
import { SessionEntity } from '../database/entities/session.entity';
import type { ClientSocket } from './types/client-socket.type';
import { UserEntity } from '../database/entities/user.entity';
import { AuthService } from '../auth/services/auth.service';
import { TokenType } from '../auth/types/token.type';
import { CryptoUtils } from '../../common/utils/crypto.utils';
import { PushSubscriptionService } from '../push-subscription/push-subscription.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly em: EntityManager,
    private readonly wsServer: WsServer,
    private readonly authService: AuthService,
    private readonly pushSubscriptionService: PushSubscriptionService,
  ) {}

  public async onMessage(socket: ClientSocket, body: SendMessageDto) {
    const { event, data } = body;
    const sessions = Array.from(socket.client.sessions.values());
    const userIds = sessions.map((session) => session.userId);

    switch (event) {
      case EventsEnum.LOGOUT:
        const sessionIds = body.data.map((data) => data!.id);
        const pushUserIdSet = new Set<string>();

        const deletedSessionsFromDb = await this.em.find(SessionEntity, {
          where: { id: In(sessionIds), userId: In(userIds) },
        });

        if (deletedSessionsFromDb?.length !== sessionIds.length) return;

        deletedSessionsFromDb.forEach((session) =>
          pushUserIdSet.add(session.userId),
        );

        const pushUserIds = Array.from(pushUserIdSet);

        await this.em.delete(SessionEntity, {
          id: In(sessionIds),
          userId: In(pushUserIds),
        });

        for (const userId of pushUserIds) {
          const actualSessions = await this.em.find(SessionEntity, {
            where: { userId },
          });

          this.wsServer.toUserRoom(userId).emit(EventsEnum.UPDATE_USER, {
            id: userId,
            sessions: actualSessions,
          });

          const userRoom = this.wsServer.userRooms.get(userId);
          if (!userRoom) return;
          const connectionIds = Array.from(userRoom);

          for (const connectionId of connectionIds) {
            const connection = this.wsServer.connections.get(connectionId);
            connection?.client.logout(deletedSessionsFromDb);
          }
        }

        break;
      case EventsEnum.UPDATE_USER:
        const { id, ...payload } = data;
        const userSession = sessions.find((session) => session.userId === id);
        if (!userSession) return;

        await this.em.update(UserEntity, { id }, payload);
        this.wsServer.toUserRoom(id!).emit(EventsEnum.UPDATE_USER, data);

        await this.pushSubscriptionService.sendNotification(id!, {
          icon: 'https://passimx.com/assets/256-BNWfayz6.png',
          title: 'Уведомление',
          body: 'Обновление пользователя',
          // requireInteraction: true,
          // silent: true,
          data: { url: '/' },
        });

        break;
      case EventsEnum.VERIFY:
        const tokens = data;
        const tokenPayloads: TokenType[] = [];

        for (const token of tokens) {
          const tokenPayload = await this.authService.verifyTokenAsync(token);
          if (tokenPayload) tokenPayloads.push(tokenPayload);
          else
            socket.send(
              JSON.stringify({ event: EventsEnum.LOGOUT, data: { token } }),
            );
        }

        if (!tokenPayloads.length) return;
        await socket.client.verify(tokenPayloads, this.authService);

        break;

      case EventsEnum.SET_CONNECTION_RSA_PUBLIC_KEY_STRING:
        try {
          await CryptoUtils.importRSAKey(data, ['encrypt']);
          socket.client.rsaPublicKeyString = data;
        } catch (e) {
          console.log(e);
        }
        break;

      case EventsEnum.SEND_MESSAGE_TO_CONNECTION:
        const connectionId = body.connectionId;
        const connection = this.wsServer.connections.get(connectionId);
        if (!connection) return;

        connection.client.emit(data.event, data.data);

        break;
    }
  }
}
