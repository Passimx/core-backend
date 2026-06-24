import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../database/entities/user.entity';
import { CryptoUtils } from '../../../common/utils/crypto.utils';
import { ChatEntity } from '../../database/entities/chat.entity';
import { EntityManager } from 'typeorm';
import { DataResponse } from '../../../common/dto/data-response.dto';
import { MessageErrorEnum } from '../../../common/types/message-error.enum';
import { ChatKeyEntity } from '../../database/entities/chat-key.entity';
import { ChatEnum } from '../../database/types/chat.enum';
import { AuthService } from './auth.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly authService: AuthService,
    private readonly em: EntityManager,
  ) {}

  public async createUser(
    body: Partial<UserEntity> & { encryptionUserAgent: string },
  ) {
    const id = CryptoUtils.getHash(body.rsaPublicKey!);
    const user = await this.em.findOne(UserEntity, { where: { id: id } });

    if (user) return new DataResponse(MessageErrorEnum.USER_ALREADY_EXISTS);

    const newUser: Partial<UserEntity> = { id, ...body };
    await this.em.insert(UserEntity, newUser);

    await this.em.insert(ChatEntity, { title: id, type: ChatEnum.private });
    const chat = await this.em.findOneOrFail(ChatEntity, {
      where: { title: id, type: ChatEnum.private },
    });

    await this.em.insert(ChatKeyEntity, {
      chatId: chat.id,
      userId: id,
    });

    return this.authService.login(id, body.encryptionUserAgent);
  }

  public async getUserById(
    id: string,
  ): Promise<DataResponse<UserEntity | string>> {
    const user = await this.em.findOne(UserEntity, { where: { id } });

    if (!user) return new DataResponse(MessageErrorEnum.USER_NOT_FOUND);

    return new DataResponse<UserEntity>(user);
  }
}
