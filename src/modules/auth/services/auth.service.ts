import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenType } from '../types/token.type';
import { EntityManager } from 'typeorm';
import { SessionEntity } from '../../database/entities/session.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { TokenDto } from '../dto/requests/token.dto';
import { CryptoUtils } from '../../../common/utils/crypto.utils';
import { CreateUserType } from '../../socket/dto/requests/send-async-message.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly em: EntityManager,
  ) {}

  async verifyTokenAsync(token: string): Promise<TokenType | undefined> {
    try {
      const payload = await this.jwtService.verifyAsync<TokenType>(token);

      const session = await this.em.findOne(SessionEntity, {
        where: {
          id: payload.sessionId,
          userId: payload.userId,
        },
      });
      if (!session) return undefined;

      return payload;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return undefined;
    }
  }

  public async createUser(payload: CreateUserType) {
    const id = CryptoUtils.getHash(payload.rsaPublicKey!);
    const user = await this.em.findOne(UserEntity, { where: { id: id } });

    if (user) return null;

    const newUser: Partial<UserEntity> = { id, ...payload };
    await this.em.insert(UserEntity, newUser);

    return this.login(newUser.id!, payload.encryptionUserAgent);
  }

  public async login(
    userId: string,
    encryptionUserAgent: string,
  ): Promise<TokenDto | null> {
    const user = await this.em.findOne(UserEntity, { where: { id: userId } });
    if (!user) return null;

    const session: Partial<SessionEntity> = {
      userId,
      encryptionUserAgent,
    };
    await this.em.insert(SessionEntity, session);

    const payload: TokenType = {
      sessionId: session.id!,
      userId,
    };

    const token = await this.jwtService.signAsync(payload);
    const userData = await this.getMe(userId);

    return {
      token,
      sessionId: session.id!,
      ...userData,
    };
  }

  public async getMe(userId: string) {
    const user = await this.em.findOne(UserEntity, {
      where: { id: userId },
      relations: { sessions: true },
    });

    if (!user) return null;

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      autoTerminateSession: user.autoTerminateSession,
      rsaPublicKey: user.rsaPublicKey,
      encryptedRsaPrivateKey: user.encryptedRsaPrivateKey,
      sessions: user.sessions,
    };
  }
}
