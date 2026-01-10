import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StoreType } from '../entities/store.entity';

// ==================== Store Response DTOs ====================

/**
 * DTO for store owner information in responses.
 */
export class StoreOwnerResponseDto {
  @ApiProperty({
    description: 'Owner user ID',
    example: 1,
  })
  id: number;

  @ApiPropertyOptional({
    description: 'Owner display name',
    example: 'محمد أحمد',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Owner phone number',
    example: '+966501234567',
  })
  phone?: string;
}

/**
 * DTO for a single store in responses.
 */
export class StoreResponseDto {
  @ApiProperty({
    description: 'Store unique identifier',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Store type',
    enum: StoreType,
    example: StoreType.ONLINE,
  })
  type: StoreType;

  @ApiProperty({
    description: 'Owner user ID',
    example: 5,
  })
  owner_user_id: number;

  @ApiPropertyOptional({
    description: 'Store owner details',
    type: () => StoreOwnerResponseDto,
  })
  owner?: StoreOwnerResponseDto;

  @ApiProperty({
    description: 'Store name',
    example: 'متجر الأزياء الراقية',
  })
  name: string;

  @ApiProperty({
    description: 'Store slug for URL',
    example: 'fashion-store',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Store description',
    example: 'متجر متخصص في الأزياء النسائية والرجالية الراقية',
  })
  description?: string;

  @ApiProperty({
    description: 'Whether the store is currently open for orders',
    example: true,
  })
  is_open: boolean;

  @ApiPropertyOptional({
    description: 'Physical address text',
    example: 'شارع الملك فهد، الرياض، المملكة العربية السعودية',
  })
  address_text?: string;

  @ApiPropertyOptional({
    description: 'Store category ID',
    example: 2,
  })
  category_id?: number;

  @ApiProperty({
    description: 'Whether the store is active',
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    description: 'When the store was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'When the store was last updated',
    example: '2024-01-10T12:00:00.000Z',
  })
  updated_at: Date;
}

/**
 * Response DTO for store list.
 */
export class StoreListResponseDto {
  @ApiProperty({
    description: 'List of stores',
    type: [StoreResponseDto],
  })
  stores: StoreResponseDto[];
}

// ==================== Slug Check Response DTOs ====================

/**
 * Response DTO for slug availability check.
 */
export class CheckSlugResponseDto {
  @ApiProperty({
    description: 'Whether the slug is available for use',
    example: true,
  })
  available: boolean;
}

// ==================== Theme Editor Session Response DTOs ====================

/**
 * Response DTO for theme editor session creation.
 */
export class ThemeEditorSessionResponseDto {
  @ApiProperty({
    description: 'JWT token for theme editor access',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwic3RvcmVJZCI6IjEiLCJzY29wZSI6WyJ0aGVtZS1lZGl0b3IiXSwiaWF0IjoxNzA0MTE5NjAwLCJleHAiOjE3MDQyMDYwMDB9.example_signature',
  })
  token: string;

  @ApiProperty({
    description: 'Token expiration date',
    example: '2024-01-15T12:00:00.000Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'URL to access the theme editor preview',
    example: 'http://localhost:3001/fashion-store/preview?token=...',
  })
  editorUrl: string;
}
