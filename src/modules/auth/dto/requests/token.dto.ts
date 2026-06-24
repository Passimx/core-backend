import { UserEntity } from '../../../database/entities/user.entity';

export type TokenDto = Partial<UserEntity> & {
  token: string;
  sessionId: string;
};
