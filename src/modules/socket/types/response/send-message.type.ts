import { FromType } from './from.type';
import { ResponseEventsEnum } from './response.events.enum';
import { CallToType } from './call-to.type';
import { EventsEnum } from '../event.enum';

type PongType = {
  event: ResponseEventsEnum.PONG;
};

type GetConnectionIdType = {
  event: ResponseEventsEnum.GET_CONNECTION_ID;
  data: string;
};

type SendToChannelType = {
  event: ResponseEventsEnum.MESSAGE;
  data: {
    from: FromType;
    message: unknown;
    signature: string;
  };
};

type SendToConnectionType = {
  event: ResponseEventsEnum.MESSAGE;
  data: {
    from: FromType;
    message: unknown;
  };
};

type CallAction = {
  event: ResponseEventsEnum.CALL_ACTION;
  data: {
    from: FromType;
    to: CallToType;
    action: string;
    actionId: string;
    payload: string;
  };
};

type ChannelData = {
  event: ResponseEventsEnum.CHANNEL_DATA;
  data: {
    from: FromType;
  };
};

type ReplyAction = {
  event: EventsEnum.REPLY_ACTION;
  data: {
    actionId: string;
    payload: unknown;
  };
};

export type SendMessageType =
  | PongType
  | GetConnectionIdType
  | SendToChannelType
  | ChannelData
  | SendToConnectionType
  | CallAction
  | ReplyAction;
