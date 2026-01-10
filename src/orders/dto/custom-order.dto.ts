import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsPhoneNumber,
  IsOptional,
  IsNumber,
  IsArray,
  Min,
} from 'class-validator';
import { IsPhoneNumberIntl } from 'src/common/validators/is-phone-number.validator';

export class CreateCustomOrderDto {
  @ApiProperty({
    description: 'Buyer name',
    example: 'محمد محمد',
  })
  @IsString()
  @IsNotEmpty()
  buyer_name: string;

  @ApiProperty({
    description: 'Buyer phone number in international format (E.164)',
    example: '+201234567890',
  })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumberIntl({ allowedCountries: ['SA', 'EG'] })
  buyer_phone: string;

  @ApiProperty({
    description: 'Custom order description',
    example: 'طلب مخصص لتصميم ملابس',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Custom order budget',
    example: 1000,
  })
  @IsNumber()
  @IsOptional()
  budget?: number;

  @ApiProperty({
    description: 'Custom order images',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}

export class QuoteCustomOrderDto {
  @ApiProperty({
    description: 'Custom order quote price',
    example: 1000,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Custom order quote shipping cost',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  shipping_cost?: number;

  @ApiProperty({
    description: 'Custom order quote notes',
    example: 'ملاحظات إضافية',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
