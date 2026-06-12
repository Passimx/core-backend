import { Envs } from '../../../common/envs/envs';
import { WsServer } from '../raw/socket-server';
import { TokenType } from '../../auth/types/token.type';
import { EventsEnum } from './event.enum';
import { randomUUID } from 'node:crypto';
import { EntityManager, In } from 'typeorm';
import { SessionEntity } from '../../database/entities/session.entity';

export class CustomWebSocketClient {
  public id: string;
  public chatNames: Set<string>;
  private pingTimeout: number | null;

  constructor(
    private readonly wsServer: WsServer,
    private sessions: TokenType[],
    private readonly socket: ClientSocket,
    private readonly em: EntityManager,
  ) {
    this.id = this.createConnectionId(wsServer);
    this.chatNames = new Set<string>();
    this.pingTimeout = null;
  }

  public static async createInstance(
    tokenPayloads: TokenType[],
    socket: ClientSocket,
    wsServer: WsServer,
    em: EntityManager,
  ) {
    const instance = new CustomWebSocketClient(
      wsServer,
      tokenPayloads,
      socket,
      em,
    );
    socket.client = instance;
    socket.id = instance.id;

    wsServer.joinConnection(socket);
    tokenPayloads.forEach(({ userId }) =>
      wsServer.joinUserRoom(socket, userId),
    );
    instance.setPingTimeout();
    instance.emit(EventsEnum.PONG);

    const sessionIds = tokenPayloads.map(({ sessionId }) => sessionId);
    await em.update(SessionEntity, { id: In(sessionIds) }, { isOnline: true });

    for (const session of tokenPayloads) {
      const sessions = await em.find(SessionEntity, {
        where: { userId: session.userId },
      });
      wsServer
        .toUserRoom(session.userId)
        .emit(EventsEnum.UPDATE_USER, { id: session.userId, sessions });
    }
  }

  public createConnectionId(wsServer: WsServer): string {
    const id = randomUUID();
    const connection = wsServer.connections.get(id);
    if (!connection) return id;

    return this.createConnectionId(wsServer);
  }

  public setPingTimeout(): void {
    this.clearPingTimeout();
    this.pingTimeout = setTimeout(() => {
      this.socket.close();

      this.sessions.forEach(({ userId }) =>
        this.wsServer?.leaveConnection(this.socket, userId),
      );
      console.log(this.wsServer);
    }, Envs.app.pingTime);
  }

  public async leaveConnection() {
    const sessionIds = this.sessions.map(({ sessionId }) => sessionId);
    await this.em.update(
      SessionEntity,
      { id: In(sessionIds) },
      { isOnline: false },
    );

    for (const { userId } of this.sessions) {
      const sessions = await this.em.find(SessionEntity, { where: { userId } });
      this.wsServer
        .toUserRoom(userId)
        .emit(EventsEnum.UPDATE_USER, { id: userId, sessions });

      this.wsServer.leaveConnection(this.socket, userId);
    }

    this.socket.close();
  }

  public clearPingTimeout(): void {
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
      this.pingTimeout = null;
    }
  }

  public emit(event: EventsEnum, data?: unknown) {
    this.wsServer.toConnection(this.id)?.emit(event, data);
  }

  public async logout(session: SessionEntity) {
    const idExists = !!this.sessions.find(
      ({ sessionId }) => sessionId === session.id,
    );
    if (!idExists) return;

    await this.em.delete(SessionEntity, { id: session.id });
    const sessions = await this.em.find(SessionEntity, {
      where: { userId: session.userId },
    });

    this.emit(EventsEnum.LOGOUT, { sessionId: session.id });

    this.wsServer.leaveUserRoom(this.socket, session.userId);

    this.wsServer
      .toUserRoom(session.userId)
      .emit(EventsEnum.UPDATE_USER, { id: session.userId, sessions });

    const newSessionList: TokenType[] = this.sessions.filter(
      (payload) => payload.sessionId !== session.id,
    );
    this.sessions = newSessionList;

    if (!newSessionList.length)
      this.wsServer.leaveConnection(this.socket, session.userId);
  }
}

export class CustomWebSocketClass {
  public id!: string;
  public client!: CustomWebSocketClient;
}

export type ClientSocket = WebSocket & CustomWebSocketClass;
