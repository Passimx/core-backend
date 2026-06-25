import { Envs } from '../../../common/envs/envs';
import { WsServer } from '../raw/socket-server';
import { TokenType } from '../../auth/types/token.type';
import { EventsEnum } from './event.enum';
import { randomUUID } from 'node:crypto';
import { EntityManager, In } from 'typeorm';
import { SessionEntity } from '../../database/entities/session.entity';
import { AuthService } from '../../auth/services/auth.service';

export class CustomWebSocketClient {
  public id: string;
  public chatNames: Set<string>;
  public sessions: Map<string, TokenType>; // sessionId -> TokenType[]

  public rsaPublicKeyString: string | null;
  private pingTimeout: number | null;

  constructor(
    private readonly wsServer: WsServer,
    private readonly socket: ClientSocket,
    private readonly em: EntityManager,
  ) {
    this.id = this.createConnectionId(wsServer);
    this.chatNames = new Set<string>();
    this.sessions = new Map<string, TokenType>();
    this.pingTimeout = null;
  }

  public async verify(tokenPayloads: TokenType[], authService: AuthService) {
    const newSessions = tokenPayloads.filter((session) => {
      const { userId, sessionId } = session;
      if (this.sessions.has(sessionId)) return false;

      this.sessions.set(sessionId, session);
      this.wsServer.joinUserRoom(this.socket, userId);
      return true;
    });

    if (!newSessions.length) return;

    const sessionIds = newSessions.map(({ sessionId }) => sessionId);
    await this.em.update(
      SessionEntity,
      { id: In(sessionIds) },
      { isOnline: true },
    );

    for (const session of newSessions) {
      const user = await authService.getMe(session.userId);

      this.wsServer
        .toUserRoom(session.userId)
        .emit(EventsEnum.UPDATE_USER, user);
    }
  }

  public static createInstance(
    wsServer: WsServer,
    em: EntityManager,
    socket: ClientSocket,
  ) {
    const instance = new CustomWebSocketClient(wsServer, socket, em);
    socket.client = instance;
    socket.id = instance.id;

    wsServer.joinConnection(socket);
    instance.setPingTimeout();
    instance.emit(EventsEnum.PONG);
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

      this.sessions?.forEach(({ userId }) =>
        this.wsServer?.leaveConnection(this.socket, userId),
      );
    }, Envs.app.pingTime);
  }

  public async leaveConnection() {
    const sessions = Array.from(this.sessions.values());

    const sessionIds = sessions?.map(({ sessionId }) => sessionId);

    if (sessionIds?.length) {
      await this.em.update(
        SessionEntity,
        { id: In(sessionIds) },
        { isOnline: false },
      );

      for (const { userId } of sessions) {
        const sessionsFromDb = await this.em.find(SessionEntity, {
          where: { userId },
          order: { updatedAt: 'DESC' },
        });
        this.wsServer.toUserRoom(userId).emit(EventsEnum.UPDATE_USER, {
          id: userId,
          sessions: sessionsFromDb,
        });

        this.wsServer.leaveConnection(this.socket, userId);
      }
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
    this.socket.send(JSON.stringify({ event, data }));
  }

  public logout(deletedSessions: SessionEntity[]) {
    const sessions = Array.from(this.sessions.values());

    for (const deletedSession of deletedSessions) {
      const currentSession = sessions.find(
        (session) => session.sessionId === deletedSession.id,
      );
      if (!currentSession) return;

      this.emit(EventsEnum.LOGOUT, { sessionId: currentSession.sessionId });
      this.wsServer.leaveUserRoom(this.socket, currentSession.userId);
      this.sessions.delete(currentSession.sessionId);
    }
  }
}

export class CustomWebSocketClass {
  public id!: string;
  public client!: CustomWebSocketClient;
}

export type ClientSocket = WebSocket & CustomWebSocketClass;
