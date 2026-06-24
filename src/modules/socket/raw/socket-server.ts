import { Injectable } from '@nestjs/common';
import { ClientSocket } from '../types/client-socket.type';
import { EventsEnum } from '../types/event.enum';
import { ChatRoomType } from '../types/chat-room.type';
import { EntityManager } from 'typeorm';

@Injectable()
export class WsServer {
  constructor(private readonly em: EntityManager) {}

  public connections: Map<string, ClientSocket> = new Map(); // connectionId -> connection[]
  public userRooms: Map<string, Set<string>> = new Map(); // userId -> connectionId[]
  public chats: Map<string, ChatRoomType> = new Map();
  public selectedClients: Set<ClientSocket> = new Set();

  private getNewChatRoom(): ChatRoomType {
    return {
      userRooms: new Set<string>(),
      connections: new Set<string>(),
    } as ChatRoomType;
  }

  public joinConnection(socket: ClientSocket) {
    const connectionName = socket.id;
    this.connections.set(connectionName, socket);
  }

  public joinUserRoom(socket: ClientSocket, userId: string) {
    const connectionName = socket?.id;
    const userRoom = this.userRooms.get(userId) ?? new Set<string>();
    userRoom.add(connectionName);
    this.userRooms.set(userId, userRoom);
  }

  public leaveUserRoom(socket: ClientSocket, userId: string) {
    const connectionName = socket.id;
    const userRoom = this.userRooms.get(userId) ?? new Set<string>();
    userRoom.delete(connectionName);

    if (userRoom.size > 0) this.userRooms.set(userId, userRoom);
    else this.userRooms.delete(userId);
  }

  public joinUserToChat(userRoomName: string, ...chatNames: string[]): boolean {
    const userRoom = this.userRooms.get(userRoomName);
    if (!userRoom) return false;

    for (const chatName of chatNames) {
      const chat = this.chats.get(chatName) ?? this.getNewChatRoom();
      chat.userRooms.add(userRoomName);

      const userRoom = this.userRooms.get(userRoomName);
      userRoom?.forEach((getConnectionName) => {
        chat.connections?.delete(getConnectionName);
      });

      this.chats.set(chatName, chat);
    }

    return true;
  }

  public joinConnectionToChat(connectionName: string, ...chatNames: string[]) {
    const connection = this.connections.get(connectionName);
    if (!connection) return;
    chatNames?.forEach((chatName) => {
      const chat = this.chats.get(chatName) ?? this.getNewChatRoom();
      chat.connections.add(connectionName);
      this.chats.set(chatName, chat);
      connection.client.chatNames.add(chatName);
    });
  }

  public leaveConnectionFromChat(
    connectionName: string,
    ...chatNames: string[]
  ) {
    const connection = this.connections.get(connectionName);

    chatNames.forEach((chatName) => {
      connection?.client.chatNames.delete(chatName);
      const chat = this.chats.get(chatName);
      if (!chat) return;
      chat.connections.delete(connectionName);
      this.chats.set(chatName, chat);
    });
  }

  public leaveConnection(client: ClientSocket, userId: string) {
    this.leaveUserRoom(client, userId);
    client.client.clearPingTimeout();

    const connectionName = client.id;
    this.connections.delete(connectionName);

    client.client.chatNames?.forEach((chatName) => {
      const chat = this.chats.get(chatName);
      if (!chat) return;
      chat.connections.delete(connectionName);
      this.chats.set(chatName, chat);
    });
  }

  public leaveUserFromChat(
    userRoomName: string,
    ...chatNames: string[]
  ): boolean {
    const userRoom = this.userRooms.get(userRoomName);
    if (!userRoom) return false;

    for (const chatName of chatNames) {
      let chat = this.chats.get(chatName);
      if (!chat) continue;

      chat.userRooms.delete(userRoomName);
      if (!chat?.userRooms.size && !chat?.connections?.size) chat = undefined;

      this.chats.set(chatName, chat!);
    }

    return true;
  }

  public emit(event: EventsEnum, data: unknown): void {
    const payload = { event, data };

    if (this.selectedClients.size)
      this.selectedClients.forEach((client) =>
        client?.send(JSON.stringify(payload)),
      );
  }

  public toConnection(connectionName: string) {
    const selectedClients = new Set<ClientSocket>(this.selectedClients);
    const connections = new Map<string, ClientSocket>(this.connections);
    const userRooms = new Map<string, Set<string>>(this.userRooms);
    const chats = new Map<string, ChatRoomType>(this.chats);

    const connection = this.connections.get(connectionName);
    if (!connection) return;
    selectedClients.add(connection);

    return this.createNewInstance(
      connections,
      userRooms,
      chats,
      selectedClients,
      this.em,
    );
  }

  public toUserRoom(userRoomName: string) {
    const selectedClients = new Set<ClientSocket>(this.selectedClients);
    const connections = new Map<string, ClientSocket>(this.connections);
    const userRooms = new Map<string, Set<string>>(this.userRooms);
    const chats = new Map<string, ChatRoomType>(this.chats);

    const userRoom = this.userRooms.get(userRoomName);

    userRoom?.forEach((connectionName) => {
      const connection = this.connections.get(connectionName);
      if (!connection) return;
      selectedClients.add(connection);
    });

    return this.createNewInstance(
      connections,
      userRooms,
      chats,
      selectedClients,
      this.em,
    );
  }

  public toChat(chatName: string) {
    const selectedClients = new Set<ClientSocket>(this.selectedClients);
    const connections = new Map<string, ClientSocket>(this.connections);
    const userRooms = new Map<string, Set<string>>(this.userRooms);
    const chats = new Map<string, ChatRoomType>(this.chats);

    const chat = this.chats.get(chatName);

    chat?.userRooms.forEach((userRoomName) => {
      const userRoom = this.userRooms.get(userRoomName);
      userRoom?.forEach((connectionName) => {
        const connection = this.connections.get(connectionName);
        if (!connection) return;
        selectedClients.add(connection);
      });
    });
    chat?.connections?.forEach((connectionName) => {
      const connection = this.connections.get(connectionName);
      if (connection) selectedClients.add(connection);
    });

    return this.createNewInstance(
      connections,
      userRooms,
      chats,
      selectedClients,
      this.em,
    );
  }

  private createNewInstance(
    connections: Map<string, ClientSocket>,
    userRooms: Map<string, Set<string>>,
    chats: Map<string, ChatRoomType>,
    selectedClients: Set<ClientSocket>,
    em: EntityManager,
  ): WsServer {
    const instance = new WsServer(em);
    instance.connections = connections;
    instance.userRooms = userRooms;
    instance.chats = chats;
    instance.selectedClients = selectedClients;

    return instance;
  }
}
