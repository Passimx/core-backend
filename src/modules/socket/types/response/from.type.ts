import { ChannelInitType } from '../channel-init.type';

type Connection = {
  connection: {
    id: string;
  };
};

type FromChannel = {
  channel?: {
    id: string;
    init: ChannelInitType;
    data?: unknown;
  };
};

export type FromType = FromChannel | Connection;
