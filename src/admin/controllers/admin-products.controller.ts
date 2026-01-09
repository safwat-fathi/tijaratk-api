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
import { AdminProductsService } from '../services/admin-products.service';

@ApiTags('AdminProducts')
@ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
@Controller('admin/products')
@UseGuards(AuthGuard(CONSTANTS.AUTH.JWT), AdminGuard)
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'storeId', required: false, type: Number })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('storeId') storeId?: number,
  ) {
    return this.adminProductsService.findAll(
      Number(page),
      Number(limit),
      search,
      startDate,
      endDate,
      storeId ? Number(storeId) : undefined,
    );
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle product active status' })
  toggleStatus(@Param('id') id: string) {
    return this.adminProductsService.toggleStatus(id);
  }
}
