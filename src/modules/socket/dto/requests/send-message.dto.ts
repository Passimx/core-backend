import { EventsEnum } from '../../types/event.enum';

type Logout = {
  event: EventsEnum.LOGOUT;
  data: string;
};

export type SendMessageDto = Logout;
