import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../../common/guards/auth/public.decorator';
import { CreateUserDto } from './dto/requests/create-user.dto';
import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('create')
  create(
    @Body() body: CreateUserDto,
  ): ReturnType<typeof this.usersService.createUser> {
    return this.usersService.createUser(body);
  }
}
