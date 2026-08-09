import { ChannelInitType } from './channel-init.type';

export type CreateChannelType = {
  id: string;
  init: ChannelInitType;
  data?: unknown;
  ownerVerifyKey: CryptoKey;
  sendVerifyKey: CryptoKey;
};
