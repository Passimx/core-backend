import { EventsEnum } from '../../types/event.enum';
import { UserEntity } from '../../../database/entities/user.entity';
import { SessionEntity } from '../../../database/entities/session.entity';
import { SendMessageToConnectionType } from './send-message-to-connection.type';

type Logout = {
  event: EventsEnum.LOGOUT;
  data: Partial<SessionEntity[]>;
};

type UpdateUser = {
  event: EventsEnum.UPDATE_USER;
  data: Partial<UserEntity>;
};

type Verify = {
  event: EventsEnum.VERIFY;
  data: string[];
};

type SetConnectionRsaPublicKeyString = {
  event: EventsEnum.SET_CONNECTION_RSA_PUBLIC_KEY_STRING;
  data: string;
};

type SendMessageToConnection = {
  event: EventsEnum.SEND_MESSAGE_TO_CONNECTION;
  connectionId: string;
  data: SendMessageToConnectionType;
};

export type SendMessageDto =
  | Logout
  | UpdateUser
  | Verify
  | SetConnectionRsaPublicKeyString
  | SendMessageToConnection;
