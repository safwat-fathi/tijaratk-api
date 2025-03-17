import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { DashboardType, SupportType } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @ApiProperty({
    type: String,
    description: 'Subscription name',
    example: 'Basic',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: String,
    description: 'Subscription description',
    example: 'Basic subscription',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description must be at most 1000 characters' })
  description?: string;

  @ApiProperty({
    type: Number,
    description: 'Subscription price',
    example: 100,
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  price: number;

  // Maximum number of products allowed (nullable for unlimited)
  @ApiProperty({
    type: Number,
    description: 'Maximum number of products allowed',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsInt()
  product_limit?: number;

  // Maximum number of comments/messages allowed per month (nullable for unlimited)
  @ApiProperty({
    type: Number,
    description: 'Maximum number of comments/messages allowed per month',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsInt()
  comment_message_limit?: number;

  // Dashboard type
  @ApiProperty({
    type: String,
    description: 'Dashboard type',
    example: DashboardType.BASIC,
    required: false,
  })
  @IsOptional()
  @IsEnum(DashboardType)
  dashboard?: DashboardType;

  @ApiProperty({
    type: Boolean,
    description: 'Notifications',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  notifications?: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Smart classification',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  smart_classification?: boolean;

  @ApiProperty({
    type: String,
    description: 'Support type',
    example: SupportType.NONE,
    required: false,
  })
  @IsOptional()
  @IsEnum(SupportType)
  support?: SupportType;

  @ApiProperty({
    type: Boolean,
    description: 'Additional admins',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  additional_admins?: boolean;
}
