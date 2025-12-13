import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class SubCategoryDto {
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
