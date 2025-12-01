import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateStorefrontDto {
  @ApiProperty({
    type: String,
    description: 'Storefront name',
    example: 'My Awesome Store',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Optional custom slug for the storefront URL',
    example: 'my-awesome-store',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Storefront description',
    example: 'We sell awesome products.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Whether the storefront is published and publicly visible',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @ApiPropertyOptional({
    type: String,
    description: 'SEO title for the storefront',
    example: 'Buy Awesome Products Online',
  })
  @IsOptional()
  @IsString()
  seo_title?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'SEO meta description for the storefront',
    example: 'Discover and buy awesome products from our online store.',
  })
  @IsOptional()
  @IsString()
  seo_description?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'SEO/Open Graph image URL',
    example: 'https://example.com/og-image.png',
  })
  @IsOptional()
  @IsUrl()
  seo_image_url?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Canonical URL for the storefront',
    example: 'https://store.tijaratk.com/my-awesome-store',
  })
  @IsOptional()
  @IsUrl()
  canonical_url?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Whether search engines should not index this storefront',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  noindex?: boolean;

  @ApiPropertyOptional({
    type: String,
    description: 'Facebook Pixel ID',
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  facebook_pixel_id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Google Analytics (GA4) measurement ID',
    example: 'G-XXXXXXXXXX',
  })
  @IsOptional()
  @IsString()
  google_analytics_measurement_id?: string;

  @ApiPropertyOptional({
    description:
      'Theme configuration for the storefront (colors, layout, etc.)',
    example: {
      primaryColor: '#ff0000',
      layout: 'grid',
    },
  })
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  theme_config?: Record<string, any>;
}

