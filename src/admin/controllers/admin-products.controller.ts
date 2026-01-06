import {
  Controller,
  Get,
  Query,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../guards/admin.guard';
import { AdminProductsService } from '../services/admin-products.service';

@Controller('admin/products')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get()
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
  toggleStatus(@Param('id') id: number) {
    return this.adminProductsService.toggleStatus(Number(id));
  }
}
