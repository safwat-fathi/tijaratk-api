import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import * as path from 'path';
import CONSTANTS from 'src/common/constants';
import { UploadFile } from 'src/common/decorators/upload-file.decorator';
import { ImageProcessorService } from 'src/common/services/image-processor.service';
import { imageFileFilter } from 'src/common/utils/file-filters';

import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
@UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
@Controller('stores/:storeId/products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly imageProcessor: ImageProcessorService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ description: 'Create product', type: CreateProductDto })
  @ApiOperation({ summary: 'Create product for a store' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The product has been successfully created.',
  })
  create(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Body() dto: CreateProductDto,
  ) {
    // Ensure store_id from path matches body
    dto.store_id = storeId;
    return this.productsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products for a store' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all products',
  })
  findAll(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Query() listProducts: ListProductsDto,
  ) {
    return this.productsService.findAllByStore(storeId, listProducts);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get product by id',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update product by id',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delete product by id',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.productsService.remove(id);
    return { message: 'Product deleted successfully' };
  }
}

// Separate controller for image upload (not store-scoped)
@ApiTags('Products')
@ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
@UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
@Controller('products')
export class ProductsUploadController {
  constructor(private readonly imageProcessor: ImageProcessorService) {}

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @UploadFile('file', {
    fileFilter: imageFileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product image uploaded successfully',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a product image' })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const filePath = path.join(process.cwd(), 'uploads', file.filename);
    const webpFilename = await this.imageProcessor.convertToWebP(filePath);

    const protocol = req.protocol;
    const host = req.get('host');
    const url = `${protocol}://${host}/uploads/${webpFilename}`;
    return { url };
  }
}
