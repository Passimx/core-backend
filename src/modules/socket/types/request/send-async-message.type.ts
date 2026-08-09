import { EventsEnum } from '../event.enum';
import { LoginDto } from '../../../auth/dto/requests/login.dto';
import { UserEntity } from '../../../database/entities/user.entity';
import { SessionEntity } from '../../../database/entities/session.entity';

export type CreateUserType = Partial<UserEntity & SessionEntity>;

type GetConnectionRsaPublicKeyString = {
  event: EventsEnum.GET_CONNECTION_RSA_PUBLIC_KEY_STRING;
  data: string;
};

type LoginType = {
  event: EventsEnum.LOGIN;
  data: LoginDto;
};

type CreateUser = {
  event: EventsEnum.CREATE_USER;
  data: CreateUserType;
};

type GetApps = {
  event: EventsEnum.GET_APPS;
  data: unknown;
};

export type SendAsyncMessageType =
  | GetConnectionRsaPublicKeyString
  | LoginType
  | CreateUser
  | GetApps;
