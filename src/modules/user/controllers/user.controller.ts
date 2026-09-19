import { Controller, Get } from '@nestjs/common';
import { User } from '../../auth/decorators/user.decorator';
import { UserService } from '../services/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('me')
  async getMe(@User() user: any) {
    return this.userService.getCurrentUser(user.sub);
  }
}
