import { Module } from '@nestjs/common';
import { PushSubscriptionService } from './push-subscription.service';

@Module({
  providers: [PushSubscriptionService],
  exports: [PushSubscriptionService],
})
export class PushSubscriptionModule {}
