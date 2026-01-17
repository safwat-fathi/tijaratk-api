import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { IsPhoneNumberIntl } from 'src/common/validators/is-phone-number.validator';

class CreateOrderItemDto {
  @ApiProperty({
    description:
      'ID of the product being ordered (optional if variant_id provided)',
    example: 'uuid-string',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  product_id?: number;

  @ApiProperty({
    description: 'ID of the product variant being ordered',
    example: 'uuid-string',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  variant_id?: number;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 2,
  })
  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Full name of the buyer',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  buyer_name?: string;

  @ApiProperty({
    description: 'WhatsApp number of the buyer',
    example: '+201234567890',
    required: true,
  })
  @IsString()
  @IsPhoneNumberIntl({ allowedCountries: ['EG'] })
  whatsapp_number: string;

  // Alias for legacy support if needed, but preferable to use whatsapp_number
  @ApiProperty({
    description: 'Legacy field for buyer phone, maps to whatsapp_number',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumberIntl({ allowedCountries: ['EG'] })
  buyer_phone?: string;

  @ApiProperty({
    description: 'Email address of the buyer',
    example: 'john@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  buyer_email?: string;

  @ApiProperty({
    description: 'Shipping address line 1',
    example: '123 Main St',
  })
  @IsOptional()
  @IsString()
  address_line1?: string;

  @ApiProperty({
    description: 'Details/Area',
    example: 'Dokki',
  })
  @IsOptional()
  @IsString()
  area?: string;

  @ApiProperty({
    description: 'Optional notes from the buyer',
    example: 'Please deliver after 5 PM.',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    type: [CreateOrderItemDto],
    description: 'Items included in the order',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
