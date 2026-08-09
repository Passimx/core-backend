import { EventsEnum } from '../event.enum';
import { ChannelInitType } from '../channel-init.type';
import { CallToType } from '../response/call-to.type';

type JoinConnectionToChannels = {
  event: EventsEnum.JOIN_CONNECTION_TO_CHANNELS;
  data: string[];
};

type LeaveConnectionToChannels = {
  event: EventsEnum.LEAVE_CONNECTION_TO_CHANNELS;
  data: string[];
};

type SendToChannel = {
  event: EventsEnum.SEND_TO_CHANNEL;
  data: {
    channelId: string;
    message: unknown;
    signature: string;
  };
};

type SendCreateChannel = {
  event: EventsEnum.CREATE_CHANNEL;
  data: { init: ChannelInitType; data?: unknown };
};

type CallAction = {
  event: EventsEnum.CALL_ACTION;
  data: {
    to: CallToType;
    action: string;
    actionId: string;
    payload: string;
  };
};

type ReplyAction = {
  event: EventsEnum.REPLY_ACTION;
  data: {
    to: CallToType;
    actionId: string;
    payload: unknown;
  };
};

export type SendMessageType =
  | JoinConnectionToChannels
  | LeaveConnectionToChannels
  | SendToChannel
  | SendCreateChannel
  | CallAction
  | ReplyAction;
