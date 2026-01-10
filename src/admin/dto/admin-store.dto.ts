import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StoreType } from 'src/stores/entities/store.entity';
import { AdminUserResponseDto } from './admin-user.dto';

/**
 * DTO for a single store in admin responses.
 */
export class AdminStoreResponseDto {
  @ApiProperty({
    description: 'Store unique identifier',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Store type (physical, online, hybrid)',
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
    description: 'Owner user details',
    type: () => AdminUserResponseDto,
  })
  owner?: AdminUserResponseDto;

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
    example: 'متجر متخصص في الأزياء النسائية والرجالية',
  })
  description?: string;

  @ApiProperty({
    description: 'Whether the store is currently open',
    example: true,
  })
  is_open: boolean;

  @ApiPropertyOptional({
    description: 'Store physical address',
    example: 'شارع ٤٦ الجيزة مصر',
  })
  address_text?: string;

  @ApiPropertyOptional({
    description: 'Store category ID',
    example: 2,
  })
  category_id?: number;

  @ApiProperty({
    description: 'Whether the store is active (published)',
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
 * Pagination meta information for admin store list.
 */
export class AdminStoreListMetaDto {
  @ApiProperty({
    description: 'Total number of stores',
    example: 250,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Last page number',
    example: 25,
  })
  last_page: number;
}

/**
 * Response DTO for paginated store list in admin panel.
 */
export class AdminStoreListResponseDto {
  @ApiProperty({
    description: 'List of stores',
    type: [AdminStoreResponseDto],
  })
  data: AdminStoreResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: AdminStoreListMetaDto,
  })
  meta: AdminStoreListMetaDto;
}

/**
 * Response DTO for toggling store publish status.
 */
export class AdminToggleStorePublishResponseDto extends AdminStoreResponseDto {
  @ApiProperty({
    description: 'Updated store active/publish status',
    example: false,
  })
  is_active: boolean;
}
