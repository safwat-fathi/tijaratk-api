import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
