import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
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
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
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
import {
  ProductResponseDto,
  ProductListResponseDto,
  ProductDeleteResponseDto,
  ProductImageUploadResponseDto,
} from './dto/product-response.dto';
import { ProductsService } from './products.service';

/**
 * Products Controller - Authenticated endpoints for product management.
 *
 * Route pattern: /stores/:storeSlug/products
 */
@ApiTags('Products')
@ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
@UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
@Controller('stores/:storeId/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create product for a store',
    description:
      'Creates a new product for a store. A slug will be auto-generated from the product name.',
  })
  @ApiParam({
    name: 'storeId',
    description: 'Store ID',
    example: '1',
    type: String,
  })
  @ApiBody({ type: CreateProductDto })
  @ApiCreatedResponse({
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Store not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid JWT required',
  })
  create(@Param('storeId') storeId: string, @Body() dto: CreateProductDto) {
    // Note: Service should lookup store by slug and get the store_id
    dto.store_id = Number(storeId);
    return this.productsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all products for a store',
    description:
      'Retrieves a paginated list of products for a store. Supports keyword search.',
  })
  @ApiParam({
    name: 'storeId',
    description: 'Store ID',
    example: '1',
    type: String,
  })
  @ApiOkResponse({
    description: 'Paginated list of products',
    type: ProductListResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Store not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid JWT required',
  })
  findAll(
    @Param('storeId') storeId: string,
    @Query() listProducts: ListProductsDto,
  ) {
    return this.productsService.findAllByStore(storeId, listProducts);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Retrieves detailed information about a specific product.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 1,
    type: Number,
  })
  @ApiOkResponse({
    description: 'Product details',
    type: ProductResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid JWT required',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(String(id));
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update product by ID',
    description:
      'Updates an existing product. All fields are optional - only provided fields will be updated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 1,
    type: Number,
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiOkResponse({
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid JWT required',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(String(id), dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete product by ID',
    description: 'Soft-deletes a product. The product can be restored later.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 1,
    type: Number,
  })
  @ApiOkResponse({
    description: 'Product deleted successfully',
    type: ProductDeleteResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid JWT required',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productsService.remove(String(id));
    return { message: 'Product deleted successfully' };
  }
}

/**
 * Products Upload Controller - Endpoints for product image uploads.
 *
 * Not store-scoped - images can be uploaded independently.
 */
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
  @ApiOperation({
    summary: 'Upload a product image',
    description:
      'Uploads a product image and converts it to WebP format. Returns the URL of the uploaded image.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPEG, PNG, WebP - max 5MB)',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Image uploaded successfully',
    type: ProductImageUploadResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid JWT required',
  })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<ProductImageUploadResponseDto> {
    const filePath = path.join(process.cwd(), 'uploads', file.filename);
    const webpFilename = await this.imageProcessor.convertToWebP(filePath);

    const protocol = req.protocol;
    const host = req.get('host');
    const url = `${protocol}://${host}/uploads/${webpFilename}`;
    return { url };
  }
}

