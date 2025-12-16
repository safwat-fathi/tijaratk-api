import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

import { ProductStatus } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty({
    type: String,
    description: 'Product name',
    example: 'Product 1',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    description: 'Product SKU (stock keeping unit)',
    example: 'SKU-12345',
    required: false,
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({
    type: String,
    description: 'Product description',
    example: 'This is a great product with many features...',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: String,
    description: 'Main product image URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  main_image?: string;

  @ApiProperty({
    type: [String],
    description: 'Additional product image URLs (max 5)',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUrl({ require_tld: false }, { each: true })
  @ArrayMaxSize(5)
  images?: string[];

  @ApiProperty({
    enum: ProductStatus,
    description: 'Product status',
    example: ProductStatus.ACTIVE,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(ProductStatus, { message: 'Invalid status value' })
  status: ProductStatus;

  @ApiProperty({
    type: Number,
    description: 'Product price',
    example: 100,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({
    type: Number,
    description: 'Product stock',
    example: 10,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  stock: number;
}
