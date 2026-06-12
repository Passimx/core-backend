import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenType } from '../types/token.type';
import { EntityManager } from 'typeorm';
import { SessionEntity } from '../../database/entities/session.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly em: EntityManager,
  ) {}

  async verifyTokenAsync(token: string): Promise<TokenType | undefined> {
    try {
      const payload = await this.jwtService.verifyAsync<TokenType>(token);

      await this.em.findOneOrFail(SessionEntity, {
        where: {
          id: payload.sessionId,
          userId: payload.userId,
        },
      });

      return payload;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return undefined;
    }
  }
}
