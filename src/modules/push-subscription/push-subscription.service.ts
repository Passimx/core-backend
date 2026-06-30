import { Injectable } from '@nestjs/common';
import webPush from 'web-push';
import { Envs } from '../../common/envs/envs';
import { EntityManager, IsNull, Not } from 'typeorm';
import { SessionEntity } from '../database/entities/session.entity';
import { Payload } from './types/payload.type';

@Injectable()
export class PushSubscriptionService {
  constructor(private readonly em: EntityManager) {}

  private onModuleInit() {
    webPush.setVapidDetails(
      `mailto:${Envs.app.mail}`,
      Envs.app.publicVapidKey,
      Envs.app.privateVapidKey,
    );
  }

  public async sendNotification(userId: string, payload: Payload) {
    const sessions = await this.em.find(SessionEntity, {
      where: {
        userId,
        isOnline: false,
        pushSubscriptionPayload: Not(IsNull()),
      },
    });

    for (const session of sessions) {
      if (!session.pushSubscriptionPayload) continue;

      const body = JSON.stringify({ ...payload, lang: session.lang });
      const result = await webPush.sendNotification(
        session.pushSubscriptionPayload,
        body,
      );

      if (result.statusCode === 410)
        await this.em.update(
          SessionEntity,
          { id: session.id },
          { pushSubscriptionPayload: null },
        );
    }
  }
}
