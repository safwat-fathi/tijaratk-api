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
  AdminProductListResponseDto,
  AdminProductsQueryDto,
  AdminToggleProductStatusResponseDto,
} from '../dto';
import { AdminProductsService } from '../services/admin-products.service';

@ApiTags('AdminProducts')
@ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
@Controller('admin/products')
@UseGuards(AuthGuard(CONSTANTS.AUTH.JWT), AdminGuard)
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all products with pagination and filters',
    description:
      'Retrieves a paginated list of all products in the system with optional search, date, and store filters. Only accessible by admin users.',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the list of products',
    type: AdminProductListResponseDto,
  })
  findAll(
    @Query() query: AdminProductsQueryDto,
  ): Promise<AdminProductListResponseDto> {
    return this.adminProductsService.findAll(
      query.page ?? 1,
      query.limit ?? 10,
      query.search,
      query.startDate,
      query.endDate,
      query.storeId,
    );
  }

  @Patch(':id/toggle-status')
  @ApiOperation({
    summary: 'Toggle product active status',
    description:
      'Toggles the product active status. If the product is currently active, it will be deactivated. If inactive, it will be activated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID (Primary Key)',
    example: '1',
    type: Number,
  })
  @ApiOkResponse({
    description: 'Successfully toggled product status',
    type: AdminToggleProductStatusResponseDto,
  })
  toggleStatus(
    @Param('id') id: string,
  ): Promise<AdminToggleProductStatusResponseDto> {
    return this.adminProductsService.toggleStatus(id);
  }
}
