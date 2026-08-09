import { Injectable } from '@nestjs/common';
import { WsServer } from './raw/socket-server';
import { SendMessageType } from './types/request/send-message.type';
import { EventsEnum } from './types/event.enum';
import type { ClientSocket } from './types/client-socket.type';
import { CryptoService } from '../../@passimx/services/crypto.service';
import { logger } from '../../common/logger/logger';
import { ResponseEventsEnum } from './types/response/response.events.enum';

@Injectable()
export class MessagesService {
  constructor(
    // private readonly em: EntityManager,
    private readonly wsServer: WsServer,
    // private readonly authService: AuthService,
    // private readonly pushSubscriptionService: PushSubscriptionService,
  ) {}

  public async onMessage(socket: ClientSocket, body: SendMessageType) {
    const { event, data } = body;
    let wsServer = this.wsServer;
    // const sessions = Array.from(socket.client.sessions.values());
    // const userIds = sessions.map((session) => session.userId);

    switch (event) {
      case EventsEnum.JOIN_CONNECTION_TO_CHANNELS:
        this.wsServer.joinConnectionToChannel(socket, data);
        break;

      case EventsEnum.LEAVE_CONNECTION_TO_CHANNELS:
        this.wsServer.leaveConnectionFromChannel(socket, data);
        break;

      case EventsEnum.SEND_TO_CHANNEL:
        const channel = this.wsServer.getChannel(data.channelId);

        if (!channel?.sendVerifyKey) break;

        const result = await CryptoService.verifyByEd25519(
          channel.sendVerifyKey,
          data.message,
          data.signature,
        );
        if (!result) break;

        this.wsServer.toChannel(data.channelId).emit({
          event: ResponseEventsEnum.MESSAGE,
          data: {
            from: {
              channel: {
                id: channel.id,
                init: channel.init!,
                data: channel.data,
              },
            },
            message: data.message,
            signature: data.signature,
          },
        });
        break;

      case EventsEnum.CREATE_CHANNEL:
        try {
          const id = CryptoService.getHash(data.init);

          const [ownerVerifyKey, sendVerifyKey] = await Promise.all([
            CryptoService.importEd25519Key(
              data.init.ownerVerifyKeyString,
              'public',
            ),
            CryptoService.importEd25519Key(
              data.init.sendVerifyKeyString,
              'public',
            ),
          ]);

          this.wsServer.createChannel(socket, {
            id,
            init: data.init,
            data: data.data,
            ownerVerifyKey,
            sendVerifyKey,
          });
        } catch (e) {
          logger.error(e);
        }
        break;

      case EventsEnum.CALL_ACTION:
        wsServer = this.wsServer;

        if (data.to.channelId) {
          const channel = wsServer.getChannel(data.to.channelId);
          if (!channel) return;

          channel.listenActionConnections.forEach((connectionId) => {
            wsServer = wsServer.toConnection(connectionId);
          });
        }
        if (data.to.connectionId)
          wsServer = wsServer.toConnection(data.to.connectionId);

        wsServer.emit({
          event: ResponseEventsEnum.CALL_ACTION,
          data: {
            from: { connection: { id: socket.id } },
            to: data.to,
            action: data.action,
            actionId: data.actionId,
            payload: data.payload,
          },
        });
        break;

      case EventsEnum.REPLY_ACTION:
        wsServer = this.wsServer;

        if (data.to.channelId) {
          const channel = wsServer.getChannel(data.to.channelId);
          if (!channel) return;

          channel.listenActionConnections.forEach((connectionId) => {
            wsServer = wsServer.toConnection(connectionId);
          });
        }
        if (data.to.connectionId)
          wsServer = wsServer.toConnection(data.to.connectionId);

        wsServer.emit({
          event: EventsEnum.REPLY_ACTION,
          data: { actionId: data.actionId, payload: data.payload },
        });
        break;
      // case EventsEnum.LOGOUT:
      //   const sessionIds = body.data.map((data) => data!.id);
      //   const pushUserIdSet = new Set<string>();
      //
      //   const deletedSessionsFromDb = await this.em.find(SessionEntity, {
      //     where: { id: In(sessionIds), userId: In(userIds) },
      //   });
      //
      //   if (deletedSessionsFromDb?.length !== sessionIds.length) return;
      //
      //   deletedSessionsFromDb.forEach((session) =>
      //     pushUserIdSet.add(session.userId),
      //   );
      //
      //   const pushUserIds = Array.from(pushUserIdSet);
      //
      //   await this.em.delete(SessionEntity, {
      //     id: In(sessionIds),
      //     userId: In(pushUserIds),
      //   });
      //
      //   for (const userId of pushUserIds) {
      //     const actualSessions = await this.em.find(SessionEntity, {
      //       where: { userId },
      //     });
      //
      //     this.wsServer.toUserRoom(userId).emit({
      //       event: EventsEnum.UPDATE_USER,
      //       data: {
      //         id: userId,
      //         sessions: actualSessions,
      //       },
      //     });
      //
      //     const userRoom = this.wsServer.rooms.get(userId);
      //     if (!userRoom) return;
      //     const connectionIds = Array.from(userRoom);
      //
      //     for (const connectionId of connectionIds) {
      //       const connection = this.wsServer.connections.get(connectionId);
      //       connection?.client.logout(deletedSessionsFromDb);
      //     }
      //   }
      //
      //   break;
      // case EventsEnum.UPDATE_USER:
      //   const { id, ...payload } = data;
      //   const userSession = sessions.find((session) => session.userId === id);
      //   if (!userSession || !id) return;
      //
      //   await this.em.update(UserEntity, { id }, payload);
      //   this.wsServer
      //     .toUserRoom(id)
      //     .emit({ event: EventsEnum.UPDATE_USER, data });
      //
      //   await this.pushSubscriptionService.sendNotification(id, {
      //     icon: 'https://passimx.com/assets/256-BNWfayz6.png',
      //     title: 'Уведомление',
      //     body: 'Обновление пользователя',
      //     // requireInteraction: true,
      //     // silent: true,
      //     data: { url: '/' },
      //   });
      //
      //   break;
      // case EventsEnum.VERIFY:
      //   const tokens = data;
      //   const tokenPayloads: UserTokenType[] = [];
      //
      //   for (const token of tokens) {
      //     const tokenPayload = await this.authService.verifyTokenAsync(token);
      //     if (tokenPayload) tokenPayloads.push(tokenPayload);
      //     else
      //       socket.send(
      //         JSON.stringify({ event: EventsEnum.LOGOUT, data: { token } }),
      //       );
      //   }
      //
      //   if (!tokenPayloads.length) return;
      //   await socket.client.verify(tokenPayloads, this.authService);
      //
      //   break;

      // case EventsEnum.SET_CONNECTION_RSA_PUBLIC_KEY_STRING:
      //   try {
      //     const roomName = CryptoUtils.getHash(data);
      //     await CryptoUtils.importRSAKey(data, ['encrypt']);
      //     socket.client.rsaPublicKeyString = data;
      //
      //     // this.wsServer.joinConnectionToChat(socket.id, roomName);
      //     socket.client.chatNames.add(roomName);
      //   } catch (e) {
      //     console.log(e);
      //   }
      //   break;
    }
  }
}
