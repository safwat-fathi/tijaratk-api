import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== Product Variant Response DTO ====================

/**
 * DTO for product variant in responses.
 */
export class ProductVariantResponseDto {
  @ApiProperty({
    description: 'Variant ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Variant label',
    example: 'أحمر - مقاس L',
  })
  label: string;

  @ApiProperty({
    description: 'Variant price',
    example: 150.0,
  })
  price: number;

  @ApiPropertyOptional({
    description: 'Whether this is the default variant',
    example: true,
  })
  is_default?: boolean;

  @ApiPropertyOptional({
    description: 'Variant SKU',
    example: 'TSHIRT-RED-L',
  })
  sku?: string;
}

// ==================== Product Response DTOs ====================

/**
 * DTO for a single product in responses.
 */
export class ProductResponseDto {
  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Store ID',
    example: 1,
  })
  store_id: number;

  @ApiProperty({
    description: 'Product name',
    example: 'قميص قطني أنيق',
  })
  name: string;

  @ApiProperty({
    description: 'Product slug for URL',
    example: 'cotton-shirt',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Product barcode',
    example: '1234567890123',
  })
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'قميص قطني 100% بتصميم عصري ومريح',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Product main image URL',
    example: 'https://cdn.example.com/products/cotton-shirt.jpg',
  })
  image_url?: string;

  @ApiPropertyOptional({
    description: 'Additional product images',
    type: [String],
    example: [
      'https://cdn.example.com/products/cotton-shirt-1.jpg',
      'https://cdn.example.com/products/cotton-shirt-2.jpg',
    ],
  })
  images?: string[];

  @ApiProperty({
    description: 'Whether the product is active',
    example: true,
  })
  is_active: boolean;

  @ApiPropertyOptional({
    description: 'Product variants',
    type: [ProductVariantResponseDto],
  })
  variants?: ProductVariantResponseDto[];

  @ApiProperty({
    description: 'Product creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Product last update date',
    example: '2024-01-10T12:00:00.000Z',
  })
  updated_at: Date;
}

// ==================== Product List Response DTOs ====================

/**
 * Paginated list of products.
 */
export class ProductListResponseDto {
  @ApiProperty({
    description: 'Total number of products',
    example: 50,
  })
  total: number;

  @ApiProperty({
    description: 'Current page',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Last page number',
    example: 5,
  })
  last_page: number;

  @ApiProperty({
    description: 'List of products',
    type: [ProductResponseDto],
  })
  items: ProductResponseDto[];
}

// ==================== Upload Response DTOs ====================

/**
 * Response for product image upload.
 */
export class ProductImageUploadResponseDto {
  @ApiProperty({
    description: 'URL of the uploaded image',
    example: 'https://api.example.com/uploads/product-image-123.webp',
  })
  url: string;
}

/**
 * Response for product deletion.
 */
export class ProductDeleteResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Product deleted successfully',
  })
  message: string;
}
