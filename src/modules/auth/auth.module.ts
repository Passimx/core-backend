import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Envs } from '../../common/envs/envs';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: Envs.app.appSalt,
    }),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
