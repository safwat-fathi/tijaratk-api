import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StoreType } from '../entities/store.entity';

// ==================== Public Store Response DTOs ====================

/**
 * DTO for public store owner information (limited data).
 */
export class PublicStoreOwnerDto {
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
    description: 'Owner phone number for contact',
    example: '+966501234567',
  })
  phone?: string;
}

/**
 * DTO for public store information.
 */
export class PublicStoreResponseDto {
  @ApiProperty({
    description: 'Store unique identifier',
    example: 1,
  })
  id: number;

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

  @ApiPropertyOptional({
    description: 'Physical address text',
    example: 'شارع الملك فهد، الرياض، المملكة العربية السعودية',
  })
  address_text?: string;

  @ApiPropertyOptional({
    description: 'Store owner information',
    type: () => PublicStoreOwnerDto,
  })
  owner?: PublicStoreOwnerDto;
}

// ==================== Public Product Response DTOs ====================

/**
 * DTO for product variant in public responses.
 */
export class PublicProductVariantDto {
  @ApiProperty({
    description: 'Variant ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Variant name',
    example: 'أحمر - مقاس L',
  })
  name: string;

  @ApiProperty({
    description: 'Variant price',
    example: 150.0,
  })
  price: number;

  @ApiPropertyOptional({
    description: 'Variant SKU',
    example: 'TSHIRT-RED-L',
  })
  sku?: string;
}

/**
 * DTO for public product information.
 */
export class PublicProductResponseDto {
  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  id: number;

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
    description: 'Product description',
    example: 'قميص قطني 100% بتصميم عصري ومريح',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Product image URL',
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
    type: [PublicProductVariantDto],
  })
  variants?: PublicProductVariantDto[];

  @ApiProperty({
    description: 'Product creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  created_at: Date;
}

/**
 * Pagination metadata for product list.
 */
export class PublicProductListMetaDto {
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
}

/**
 * Paginated list of products for a public store.
 */
export class PublicProductListResponseDto {
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
    type: [PublicProductResponseDto],
  })
  items: PublicProductResponseDto[];
}

// ==================== Public Store Resources DTOs ====================

/**
 * DTO for public store theme configuration.
 */
export class PublicStoreThemeDto {
  @ApiProperty({
    description: 'Store theme configuration',
    example: { primaryColor: '#000000', layout: 'grid' },
  })
  config: any; // Typed as StoreThemeConfig in service
}

/**
 * DTO for public store SEO information.
 */
export class PublicStoreSeoDto {
  @ApiPropertyOptional({ description: 'SEO Title' })
  title?: string;
  @ApiPropertyOptional({ description: 'SEO Description' })
  description?: string;
  @ApiPropertyOptional({ description: 'Canonical URL' })
  canonical_url?: string;
  @ApiPropertyOptional({ description: 'OpenGraph Image' })
  image?: string;
  @ApiPropertyOptional({ description: 'OpenGraph Data' })
  og?: any;
  @ApiPropertyOptional({ description: 'Twitter Card Data' })
  twitter?: any;
  @ApiPropertyOptional({ description: 'Schema.org Data' })
  schema_org?: any;
}

/**
 * DTO for public store category information.
 */
export class PublicStoreCategoryDto {
  @ApiProperty({ description: 'Category Key' })
  key: string;
  @ApiProperty({ description: 'English Name' })
  name_en: string;
  @ApiProperty({ description: 'Arabic Name' })
  name_ar: string;
  @ApiPropertyOptional({ description: 'Category Icon' })
  icon?: string;
  @ApiPropertyOptional({ description: 'Suggested Sub Categories' })
  suggested_sub_categories?: { name_en: string; name_ar: string }[];
  @ApiPropertyOptional({ description: 'Parent Category ID' })
  parent_id?: number;
}
