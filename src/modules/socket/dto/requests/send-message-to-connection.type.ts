import { EventsEnum } from '../../types/event.enum';
import { UserEntity } from '../../../database/entities/user.entity';

type SendEncryptedSeedPhraseType = {
  event: EventsEnum.SEND_ENCRYPTED_SEED_PHRASE;
  data: Partial<UserEntity>;
};

export type SendMessageToConnectionType = SendEncryptedSeedPhraseType;
