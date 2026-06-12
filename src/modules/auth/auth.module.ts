import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Envs } from '../../common/envs/envs';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: Envs.app.appSalt,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService],
  exports: [AuthService, UsersService],
})
export class AuthModule {}
