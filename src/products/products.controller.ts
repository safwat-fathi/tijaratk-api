import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  HttpCode,
	HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiBearerAuth('access_token')
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create product' })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully created.',
  })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @ApiBearerAuth('access_token')
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all products',
  })
  findAll() {
    return this.productsService.findAll();
  }

  @ApiBearerAuth('access_token')
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get product by id',
  })
  findOne(@Param('id') id: number) {
    return this.productsService.findOne(id);
  }

  @ApiBearerAuth('access_token')
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @ApiOperation({ summary: 'Update product by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update product by id',
  })
  update(@Param('id') id: number, @Body() dto: Partial<CreateProductDto>) {
    return this.productsService.update(id, dto);
  }

  @ApiBearerAuth('access_token')
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiOperation({ summary: 'Delete product by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delete product by id',
  })
  remove(@Param('id') id: number) {
    return this.productsService.remove(id);
  }
}
