import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenType } from '../types/token.type';
import { EntityManager } from 'typeorm';
import { SessionEntity } from '../../database/entities/session.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { DataResponse } from '../../../common/dto/data-response.dto';
import { TokenDto } from '../dto/requests/token.dto';

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

  public async login(
    userId: string,
    encryptionUserAgent: string,
  ): Promise<DataResponse<TokenDto | string>> {
    const user = await this.em.findOne(UserEntity, { where: { id: userId } });
    if (!user) return new DataResponse('error');

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

    return new DataResponse<TokenDto>({
      id: userId,
      token,
      sessionId: session.id!,
      autoTerminateSession: user.autoTerminateSession,
      rsaPublicKey: user.rsaPublicKey,
      encryptedRsaPrivateKey: user.encryptedRsaPrivateKey,
    });
  }
}
