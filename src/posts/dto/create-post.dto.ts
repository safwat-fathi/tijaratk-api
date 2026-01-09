import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: ' Product ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsNotEmpty()
  @IsUUID()
  product_id: string;

  @ApiProperty({
    description: 'Page ID',
    example: '123456789',
    required: true,
  })
  @IsString()
  page_id: string;

  @ApiProperty({
    description: 'Post title',
    example: 'Post 1',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 255, { message: 'Title must be between 1 and 255 characters' })
  title: string;

  @ApiPropertyOptional({
    description: 'Post content',
    example: 'This is the content of the post',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2500, { message: 'Content must be at most 2500 characters' })
  content?: string;

  @ApiPropertyOptional({
    description: 'Post media URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  media_url?: string;

  // scheduledAt is optional. If provided, it must be a valid date string.
  @ApiPropertyOptional({
    description: 'Post scheduled date',
    example: '2023-06-01T12:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduled_at?: string;
}
