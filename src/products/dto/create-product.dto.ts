import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    type: String,
    description: 'Product name',
    example: 'Product 1',
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    description: 'Product description',
    example: 'Product 1 description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  description?: string;

  @ApiProperty({
    type: Number,
    description: 'Product price',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    type: Number,
    description: 'Product quantity',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  quantity?: number;
}
