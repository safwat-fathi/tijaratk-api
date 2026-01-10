import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdminStoreResponseDto } from './admin-store.dto';

/**
 * DTO for a single product in admin responses.
 */
export class AdminProductResponseDto {
  @ApiProperty({
    description: 'Product unique identifier (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Store ID the product belongs to',
    example: '1',
  })
  store_id: string;

  @ApiPropertyOptional({
    description: 'Store details',
    type: () => AdminStoreResponseDto,
  })
  store?: AdminStoreResponseDto;

  @ApiProperty({
    description: 'Product name',
    example: 'قميص قطني أبيض',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Product barcode',
    example: '6281000000001',
  })
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Product slug for URL',
    example: 'white-cotton-shirt',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'قميص قطني 100% مريح ومناسب لجميع المناسبات',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Main product image URL',
    example: 'https://cdn.example.com/products/shirt-white.jpg',
  })
  image_url?: string;

  @ApiPropertyOptional({
    description: 'Array of additional product images',
    example: [
      'https://cdn.example.com/products/shirt-white-1.jpg',
      'https://cdn.example.com/products/shirt-white-2.jpg',
    ],
    type: [String],
  })
  images?: string[];

  @ApiProperty({
    description: 'Whether the product is active',
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    description: 'When the product was created',
    example: '2024-02-15T10:30:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'When the product was last updated',
    example: '2024-03-20T14:45:00.000Z',
  })
  updated_at: Date;
}

/**
 * Pagination meta information for admin product list.
 */
export class AdminProductListMetaDto {
  @ApiProperty({
    description: 'Total number of products',
    example: 1500,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Last page number',
    example: 150,
  })
  last_page: number;
}

/**
 * Response DTO for paginated product list in admin panel.
 */
export class AdminProductListResponseDto {
  @ApiProperty({
    description: 'List of products',
    type: [AdminProductResponseDto],
  })
  data: AdminProductResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: AdminProductListMetaDto,
  })
  meta: AdminProductListMetaDto;
}

/**
 * Response DTO for toggling product status.
 */
export class AdminToggleProductStatusResponseDto extends AdminProductResponseDto {
  @ApiProperty({
    description: 'Updated product active status',
    example: false,
  })
  is_active: boolean;
}
