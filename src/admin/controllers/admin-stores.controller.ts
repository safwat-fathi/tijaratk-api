import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
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
  AdminStoreListResponseDto,
  AdminStoresQueryDto,
  AdminToggleStorePublishResponseDto,
} from '../dto';
import { AdminStoresService } from '../services/admin-stores.service';

@ApiTags('AdminStores')
@ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
@Controller('admin/stores')
@UseGuards(AuthGuard(CONSTANTS.AUTH.JWT), AdminGuard)
export class AdminStoresController {
  constructor(private readonly adminStoresService: AdminStoresService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all stores with pagination and filters',
    description:
      'Retrieves a paginated list of all stores in the system with optional search and date filters. Only accessible by admin users.',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the list of stores',
    type: AdminStoreListResponseDto,
  })
  findAll(
    @Query() query: AdminStoresQueryDto,
  ): Promise<AdminStoreListResponseDto> {
    return this.adminStoresService.findAll(
      query.page ?? 1,
      query.limit ?? 10,
      query.search,
      query.startDate,
      query.endDate,
    );
  }

  @Patch(':id/toggle-publish')
  @ApiOperation({
    summary: 'Toggle store publish status',
    description:
      'Toggles the store active/publish status. If the store is currently active, it will be deactivated. If inactive, it will be activated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Store ID',
    example: 1,
    type: Number,
  })
  @ApiOkResponse({
    description: 'Successfully toggled store publish status',
    type: AdminToggleStorePublishResponseDto,
  })
  togglePublish(
    @Param('id') id: number,
  ): Promise<AdminToggleStorePublishResponseDto> {
    return this.adminStoresService.togglePublish(Number(id));
  }
}
