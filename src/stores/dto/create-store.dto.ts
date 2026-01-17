import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { StoreType } from '../entities/store.entity';

export class CreateStoreDto {
  @ApiProperty({
    type: String,
    description: 'Store name',
    example: 'My Awesome Store',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Optional custom slug for the store URL',
    example: 'my-awesome-store',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Store description',
    example: 'We sell awesome products.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: StoreType,
    description: 'Store type (physical, online, hybrid)',
    default: StoreType.ONLINE,
  })
  @IsOptional()
  @IsEnum(StoreType)
  type?: StoreType;

  @ApiPropertyOptional({
    type: String,
    description: 'Physical address text',
    example: '123 Main St, Cairo, Egypt',
  })
  @IsOptional()
  @IsString()
  address_text?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Longitude for store geolocation',
    example: 31.2357,
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Latitude for store geolocation',
    example: 30.0444,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Primary category ID for the store',
  })
  @IsOptional()
  @IsNumber()
  category_id?: number;
}
