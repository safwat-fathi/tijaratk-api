import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import CONSTANTS from 'src/common/constants';
import { AdminGuard } from '../guards/admin.guard';
import {
  AdminToggleUserStatusResponseDto,
  AdminUserListResponseDto,
  AdminUsersQueryDto,
} from '../dto';
import { AdminUsersService } from '../services/admin-users.service';

@ApiTags('AdminUsers')
@ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
@Controller('admin/users')
@UseGuards(AuthGuard(CONSTANTS.AUTH.JWT), AdminGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all users with pagination',
    description:
      'Retrieves a paginated list of all users in the system. Only accessible by admin users.',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the list of users',
    type: AdminUserListResponseDto,
  })
  findAll(
    @Query() query: AdminUsersQueryDto,
  ): Promise<AdminUserListResponseDto> {
    return this.adminUsersService.findAll(query.page ?? 1, query.limit ?? 10);
  }

  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Toggle user active status',
    description:
      'Toggles the user status between ACTIVE and BLOCKED. If the user is currently ACTIVE, they will be BLOCKED. If BLOCKED or PENDING, they will be set to ACTIVE.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 1,
    type: Number,
  })
  @ApiOkResponse({
    description: 'Successfully toggled user status',
    type: AdminToggleUserStatusResponseDto,
  })
  toggleActive(
    @Param('id') id: number,
  ): Promise<AdminToggleUserStatusResponseDto> {
    return this.adminUsersService.toggleActive(Number(id));
  }
}
