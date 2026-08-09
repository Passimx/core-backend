import { Injectable } from '@nestjs/common';
import { ClientSocket } from '../types/client-socket.type';
import { ChannelType } from '../types/channel.type';
import { SendMessageType } from '../types/response/send-message.type';
import { CreateChannelType } from '../types/create-channel.type';
import { ResponseEventsEnum } from '../types/response/response.events.enum';

@Injectable()
export class WsServer {
  // all connections
  private connections: Map<string, ClientSocket> = new Map(); // connectionId -> connection[]
  // keep connections at 1 account
  private rooms: Map<string, Set<string>> = new Map(); // roomId -> connectionId[]
  // 1 connection owner can emit, all connections only listen
  private channels: Map<string, ChannelType> = new Map();
  // for method .emit()
  private selectedClients: Set<ClientSocket> = new Set();

  public joinConnection(socket: ClientSocket) {
    const connectionName = socket.id;
    this.connections.set(connectionName, socket);
  }

  // public joinUserRoom(socket: ClientSocket, userId: string) {
  //   const connectionName = socket?.id;
  //   const userRoom = this.rooms.get(userId) ?? new Set<string>();
  //   userRoom.add(connectionName);
  //   this.rooms.set(userId, userRoom);
  // }

  public joinConnectionToChannel(socket: ClientSocket, channelIds: string[]) {
    for (const channelId of channelIds) {
      const channel: ChannelType = this.channels.get(channelId) ?? {
        id: channelId,
        connections: new Set<string>(),
        listenActionConnections: new Set<string>(),
      };

      channel.connections.add(socket.id);
      this.channels.set(channelId, channel);

      socket.client.channels.add(channelId);
      this.toConnection(socket.id).sendChannelData(channel);
    }
  }

  private sendChannelData(channel: ChannelType) {
    this.emit({
      event: ResponseEventsEnum.CHANNEL_DATA,
      data: {
        from: {
          channel: {
            id: channel.id,
            init: channel.init!,
            data: channel.data,
          },
        },
      },
    });
  }

  public leaveUserRoom(socket: ClientSocket, userId: string) {
    const connectionName = socket.id;
    const userRoom = this.rooms.get(userId) ?? new Set<string>();
    userRoom.delete(connectionName);
    this.rooms.set(userId, userRoom);
  }

  public leaveConnection(client: ClientSocket) {
    this.leaveConnectionFromChannel(client, Array.from(client.client.channels));
    this.leaveConnectionFromChannelActionConnections(
      client,
      ...client.client.listenChannelActions,
    );

    this.connections.delete(client.id);
  }

  public leaveConnectionFromChannelActionConnections(
    socket: ClientSocket,
    ...channelIds: string[]
  ) {
    channelIds.forEach((channelId) => {
      socket.client.listenChannelActions.delete(channelId);
      const channel = this.channels.get(channelId);
      if (!channel) return;

      channel.listenActionConnections.delete(socket.id);
      this.channels.set(channelId, channel);
    });
  }

  public leaveConnectionFromChannel(
    socket: ClientSocket,
    channelIds: string[],
  ) {
    channelIds.forEach((channelId) => {
      socket.client.channels.delete(channelId);
      const channel = this.channels.get(channelId);
      if (!channel) return;
      channel.connections.delete(socket.id);
      this.channels.set(channelId, channel);
    });
  }

  public emit(message: SendMessageType): void {
    if (this.selectedClients.size)
      this.selectedClients.forEach((client) =>
        client?.send(JSON.stringify(message)),
      );
  }

  public toConnection(connectionName: string) {
    const selectedClients = new Set<ClientSocket>();

    const connection = this.connections.get(connectionName);
    if (connection) selectedClients.add(connection);

    return this.to(selectedClients);
  }

  public toUserRoom(userRoomName: string) {
    const selectedClients = new Set<ClientSocket>();
    const userRoom = this.rooms.get(userRoomName);

    userRoom?.forEach((connectionName) => {
      const connection = this.connections.get(connectionName);
      if (!connection) return;
      selectedClients.add(connection);
    });

    return this.to(selectedClients);
  }

  public toChannel(name: string) {
    const selectedClients = new Set<ClientSocket>();
    const channel = this.channels.get(name);

    channel?.connections?.forEach((connectionName) => {
      const connection = this.connections.get(connectionName);
      if (!connection) return;
      selectedClients.add(connection);
    });

    return this.to(selectedClients);
  }

  public createChannel(client: ClientSocket, payload: CreateChannelType): void {
    const channel = this.channels.get(payload.id) ?? {
      id: payload.id,
      connections: new Set<string>(),
      listenActionConnections: new Set<string>(),
    };

    channel.ownerVerifyKey = payload.ownerVerifyKey;
    channel.sendVerifyKey = payload.sendVerifyKey;
    channel.init = payload.init;
    channel.data = payload.data;

    channel.listenActionConnections.add(client.id);
    client.client.listenChannelActions.add(channel.id);

    this.channels.set(payload.id, channel);
    this.toChannel(payload.id).sendChannelData(channel);
  }

  public getChannel(id: string) {
    return this.channels.get(id);
  }

  public getConnection(id: string) {
    return this.connections.get(id);
  }

  private createNewInstance(
    connections: Map<string, ClientSocket>,
    userRooms: Map<string, Set<string>>,
    channels: Map<string, ChannelType>,
    selectedClients: Set<ClientSocket>,
  ): WsServer {
    const instance = new WsServer();
    instance.connections = connections;
    instance.rooms = userRooms;
    instance.channels = channels;
    instance.selectedClients = selectedClients;

    return instance;
  }

  private to(selectedClients: Set<ClientSocket>) {
    const connections = new Map<string, ClientSocket>(this.connections);
    const userRooms = new Map<string, Set<string>>(this.rooms);
    const channels = new Map<string, ChannelType>(this.channels);

    return this.createNewInstance(
      connections,
      userRooms,
      channels,
      selectedClients,
    );
  }
}
