import {
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PushSubscriptionPayload } from '../../../push-subscription/types/push-subscription.type';

export class LoginDto {
  @IsOptional()
  @IsObject()
  readonly pushSubscriptionPayload?: PushSubscriptionPayload;

  @IsString()
  @MaxLength(2 ** 12)
  @MinLength(2)
  readonly encryptionUserAgent: string;

  @IsString()
  @MaxLength(2 ** 6)
  @MinLength(2)
  readonly seedPhraseHash!: string;

  @IsString()
  @MaxLength(2 ** 7)
  @MinLength(2)
  readonly userId!: string;
}
