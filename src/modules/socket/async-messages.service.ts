import { Injectable } from '@nestjs/common';
import { WsServer } from './raw/socket-server';
import { EntityManager } from 'typeorm';
import type { ClientSocket } from './types/client-socket.type';
import { SendAsyncMessageDto } from './dto/requests/send-async-message.dto';
import { EventsEnum } from './types/event.enum';
import { AuthService } from '../auth/services/auth.service';
import { AppEntity } from '../database/entities/app.entity';

@Injectable()
export class AsyncMessagesService {
  constructor(
    private readonly authService: AuthService,
    private readonly wsServer: WsServer,
    private readonly em: EntityManager,
  ) {}

  public async onMessage(
    socket: ClientSocket,
    body: SendAsyncMessageDto,
    queryId: string,
  ) {
    const sessions = Array.from(socket.client.sessions.values());

    let response: unknown = null;
    const { event, data } = body;

    switch (event) {
      case EventsEnum.GET_APPS:
        response = await this.em.find(AppEntity);
        break;

      case EventsEnum.GET_CONNECTION_RSA_PUBLIC_KEY_STRING:
        const connection = this.wsServer.connections.get(data);
        response = connection?.client.rsaPublicKeyString;

        break;
      case EventsEnum.LOGIN:
        const seedPhraseHash = data.seedPhraseHash;
        if (!seedPhraseHash?.length || !data.id?.length) {
          response = null;
          break;
        }

        if (sessions.find((session) => session.userId === data.id)) {
          response = null;
          break;
        }

        response = await this.authService.login(
          data.id,
          data.encryptionUserAgent,
        );

        break;
      case EventsEnum.CREATE_USER:
        response = await this.authService.createUser(data);

        break;
    }

    socket.client.emit(EventsEnum.RESEND_ASYNC_MESSAGE, {
      queryId,
      data: response,
    });
  }
}
