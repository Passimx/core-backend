import { Injectable } from '@nestjs/common';
import type { ClientSocket } from './types/client-socket.type';
import { SendAsyncMessageType } from './types/request/send-async-message.type';
import { logger } from '../../common/logger/logger';

@Injectable()
export class AsyncMessagesService {
  constructor() {
    // private readonly authService: AuthService,
    // private readonly wsServer: WsServer,
    // private readonly em: EntityManager,
  }

  public onMessage(
    socket: ClientSocket,
    body: SendAsyncMessageType,
    queryId: string,
  ) {
    logger.info(queryId, body, socket.id);
    // const sessions = Array.from(socket.client.sessions.values());
    // const response: unknown = null;
    // const { event, data } = body;
    //
    // switch (event) {
    // case EventsEnum.GET_APPS:
    //   response = await this.em.find(AppEntity);
    //   break;
    //
    // case EventsEnum.GET_CONNECTION_RSA_PUBLIC_KEY_STRING:
    //   const connection = this.wsServer.connections.get(data);
    //   response = connection?.client.rsaPublicKeyString;
    //
    //   break;
    // case EventsEnum.LOGIN:
    //   const seedPhraseHash = data.seedPhraseHash;
    //   if (!seedPhraseHash?.length || !data.userId?.length) {
    //     response = null;
    //     break;
    //   }
    //
    //   if (sessions.find((session) => session.userId === data.userId)) {
    //     response = null;
    //     break;
    //   }
    //
    //   response = await this.authService.login(data);
    //
    //   break;
    // case EventsEnum.CREATE_USER:
    //   response = await this.authService.createUser(data);
    //
    //   break;
    // }
    // socket.client.emit(EventsEnum.RESEND_ASYNC_MESSAGE, {
    //   queryId,
    //   data: response,
    // });
  }
}
