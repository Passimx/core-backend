import { IsUrl } from 'class-validator';

export class PushSubscriptionPayload {
  @IsUrl()
  readonly endpoint: string;

  readonly expirationTime?: null | number;

  readonly keys: {
    p256dh: string;
    auth: string;
  };
}
