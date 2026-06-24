import { EventsEnum } from '../../types/event.enum';
import { LoginDto } from '../../../auth/dto/requests/login.dto';

type GetConnectionRsaPublicKeyString = {
  event: EventsEnum.GET_CONNECTION_RSA_PUBLIC_KEY_STRING;
  data: string;
};

type LoginType = {
  event: EventsEnum.LOGIN;
  data: LoginDto;
};

export type SendAsyncMessageDto = GetConnectionRsaPublicKeyString | LoginType;
