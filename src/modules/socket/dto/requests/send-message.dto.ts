import { EventsEnum } from '../../types/event.enum';
import { UserEntity } from '../../../database/entities/user.entity';
import { SessionEntity } from '../../../database/entities/session.entity';

type Logout = {
  event: EventsEnum.LOGOUT;
  data: Partial<SessionEntity>;
};

type UpdateUser = {
  event: EventsEnum.UPDATE_USER;
  data: Partial<UserEntity>;
};

export type SendMessageDto = Logout | UpdateUser;
