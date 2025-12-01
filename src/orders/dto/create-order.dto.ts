import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateOrderItemDto {
  @ApiProperty({
    description: 'ID of the product being ordered',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  productId: number;

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
  @IsNotEmpty()
  @IsString()
  buyer_name: string;

	@ApiProperty({
		description: 'Phone number of the buyer',
		example: '+201234567890',
		required: true,
	})
	@IsString()
	buyer_phone: string;
	
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
  @IsNotEmpty()
  @IsString()
  shipping_address_line1: string;

  @ApiProperty({
    description: 'Shipping address line 2',
    example: 'Apartment 4B',
    required: false,
  })
  @IsOptional()
  @IsString()
  shipping_address_line2?: string;

  @ApiProperty({
    description: 'Shipping city',
    example: 'Cairo',
  })
  @IsNotEmpty()
  @IsString()
  shipping_city: string;

  @ApiProperty({
    description: 'Shipping state or region',
    example: 'Giza',
    required: false,
  })
  @IsOptional()
  @IsString()
  shipping_state?: string;

  @ApiProperty({
    description: 'Shipping postal code',
    example: '12345',
    required: false,
  })
  @IsOptional()
  @IsString()
  shipping_postal_code?: string;

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
