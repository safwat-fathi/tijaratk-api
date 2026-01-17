import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { Unit } from '../entities/product-variant.entity';

export class CreateProductVariantDto {
  @ApiProperty({
    description: 'Variant label (e.g., "1 kg", "Box")',
    example: '1 kg',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  label: string;

  @ApiPropertyOptional({
    description: 'Unit of measurement',
    enum: Unit,
    example: Unit.KG,
  })
  @IsOptional()
  @IsEnum(Unit)
  unit?: Unit;

  @ApiProperty({
    description: 'Stock quantity',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({
    description: 'Unit value (e.g., 1 for 1 kg, 0.5 for 0.5 kg)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unit_value?: number;

  @ApiProperty({
    description: 'Regular price',
    example: 100.0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Sale price',
    example: 90.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sale_price?: number;

  @ApiPropertyOptional({
    description: 'Cost price',
    example: 80.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost_price?: number;

  @ApiPropertyOptional({
    description: 'Wholesale price',
    example: 85.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  wholesale_price?: number;

  @ApiPropertyOptional({
    description: 'Is this the default variant?',
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @ApiPropertyOptional({
    description: 'Is the variant active?',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
