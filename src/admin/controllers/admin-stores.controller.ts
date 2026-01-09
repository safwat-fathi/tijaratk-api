import {
  Controller,
  Get,
  Query,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import CONSTANTS from 'src/common/constants';
import { AdminGuard } from '../guards/admin.guard';
import { AdminStoresService } from '../services/admin-stores.service';

@ApiTags('AdminStores')
@ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
@Controller('admin/stores')
@UseGuards(AuthGuard(CONSTANTS.AUTH.JWT), AdminGuard)
export class AdminStoresController {
  constructor(private readonly adminStoresService: AdminStoresService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stores with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminStoresService.findAll(Number(page), Number(limit), search);
  }

  @Patch(':id/toggle-publish')
  @ApiOperation({ summary: 'Toggle store publish status' })
  togglePublish(@Param('id') id: number) {
    return this.adminStoresService.togglePublish(Number(id));
  }
}
