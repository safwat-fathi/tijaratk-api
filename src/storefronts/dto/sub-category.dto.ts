import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class SubCategoryDto {
  @ApiPropertyOptional({ description: 'ID of the subcategory (if updating)' })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiPropertyOptional({ description: 'Storefront ID (if updating)' })
  @IsOptional()
  @IsInt()
  storefrontId?: number;

  @ApiProperty({ description: 'Parent category ID' })
  @IsInt()
  categoryId: number;

  @ApiProperty({ description: 'Sub-category name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Is a custom user-created sub-category' })
  @IsOptional()
  @IsBoolean()
  is_custom?: boolean;
}
