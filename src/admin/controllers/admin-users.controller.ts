import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import CONSTANTS from 'src/common/constants';
import { AdminGuard } from '../guards/admin.guard';
import { AdminUsersService } from '../services/admin-users.service';

@ApiTags('AdminUsers')
@ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
@Controller('admin/users')
@UseGuards(AuthGuard(CONSTANTS.AUTH.JWT), AdminGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.adminUsersService.findAll(Number(page), Number(limit));
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Toggle user active status' })
  toggleActive(@Param('id') id: number) {
    return this.adminUsersService.toggleActive(Number(id));
  }
}
