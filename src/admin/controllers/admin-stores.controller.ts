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
import { AdminStoresService } from '../services/admin-stores.service';

@Controller('admin/stores')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminStoresController {
  constructor(private readonly adminStoresService: AdminStoresService) {}

  @Get()
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
  togglePublish(@Param('id') id: number) {
    return this.adminStoresService.togglePublish(Number(id));
  }
}
