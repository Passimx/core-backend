import { ChannelInitType } from './channel-init.type';

export type ChannelType = {
  id: string;
  init?: ChannelInitType;
  data?: unknown;

  ownerVerifyKey?: CryptoKey;
  sendVerifyKey?: CryptoKey;

  connections: Set<string>;
  listenActionConnections: Set<string>;
};
