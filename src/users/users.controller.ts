import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import CONSTANTS from 'src/common/constants';

import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @Get('me')
  async getMe(@Req() req) {
    const userId = req.user.id;
    return this.usersService.getUserProfile(userId);
  }
}
