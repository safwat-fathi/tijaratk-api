import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
  ) {
    return this.adminProductsService.findAll(
        Number(page),
        Number(limit),
        search,
        startDate,
        endDate,
      );
  }
}
