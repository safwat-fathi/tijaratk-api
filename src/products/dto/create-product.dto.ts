import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Store ID',
    example: '1',
  })
  @IsNotEmpty()
  @IsUUID()
  store_id: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Organic Coffee Beans',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Product barcode',
    example: '1234567890123',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'Premium organic coffee beans from Ethiopia',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Main product image URL',
    example: 'https://example.com/images/coffee.webp',
  })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  image_url?: string;

  @ApiPropertyOptional({
    description: 'Additional product images',
    example: ['https://example.com/images/coffee-1.webp'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
