import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../guards/admin.guard';
import { AdminUsersService } from '../services/admin-users.service';

@Controller('admin/users')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.adminUsersService.findAll(Number(page), Number(limit));
  }

  @Patch(':id/activate')
  toggleActive(@Param('id') id: number) {
    return this.adminUsersService.toggleActive(Number(id));
  }
}
