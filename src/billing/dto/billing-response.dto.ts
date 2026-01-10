import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== Plan Response DTOs ====================

/**
 * DTO for a subscription plan.
 */
export class PlanResponseDto {
  @ApiProperty({
    description: 'Plan ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Plan name',
    example: 'Basic',
  })
  name: string;

  @ApiProperty({
    description: 'Plan slug',
    example: 'basic',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Plan description',
    example: 'Perfect for small businesses just getting started',
  })
  description?: string;

  @ApiProperty({
    description: 'Price in cents',
    example: 9900,
  })
  price: number;

  @ApiProperty({
    description: 'Billing cycle (monthly, yearly)',
    example: 'monthly',
  })
  billing_cycle: string;

  // Limits
  @ApiPropertyOptional({
    description: 'Maximum number of products (null for unlimited)',
    example: 100,
  })
  max_products?: number | null;

  @ApiPropertyOptional({
    description: 'Maximum posts per month (null for unlimited)',
    example: 50,
  })
  max_posts_per_month?: number | null;

  @ApiPropertyOptional({
    description: 'Maximum messages per month (null for unlimited)',
    example: 500,
  })
  max_messages_per_month?: number | null;

  @ApiProperty({
    description: 'Maximum staff users',
    example: 3,
  })
  max_staff_users: number;

  // Features
  @ApiProperty({
    description: 'Has custom domain feature',
    example: false,
  })
  has_custom_domain: boolean;

  @ApiProperty({
    description: 'Has theme access',
    example: true,
  })
  has_theme_access: boolean;

  @ApiProperty({
    description: 'Branding removed',
    example: false,
  })
  branding_removed: boolean;

  @ApiProperty({
    description: 'Number of available themes',
    example: 5,
  })
  available_themes_count: number;

  @ApiProperty({
    description: 'Number of available color palettes',
    example: 10,
  })
  available_color_palettes: number;

  @ApiProperty({
    description: 'Display order for listing',
    example: 1,
  })
  display_order: number;
}

/**
 * Response for plan comparison.
 */
export class PlanCompareResponseDto {
  @ApiProperty({
    description: 'Current plan details',
    type: PlanResponseDto,
  })
  current: PlanResponseDto;

  @ApiProperty({
    description: 'Target plan details',
    type: PlanResponseDto,
  })
  target: PlanResponseDto;

  @ApiProperty({
    description: 'Price difference (positive = upgrade, negative = downgrade)',
    example: 1000,
  })
  priceDiff: number;

  @ApiProperty({
    description: 'List of features gained by switching',
    type: [String],
    example: ['Custom domain', 'More staff seats'],
  })
  gains: string[];

  @ApiProperty({
    description: 'List of features lost by switching',
    type: [String],
    example: [],
  })
  losses: string[];
}

// ==================== Addon Response DTOs ====================

/**
 * DTO for an addon product.
 */
export class AddonResponseDto {
  @ApiProperty({
    description: 'Addon ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Addon name',
    example: 'Extra Messages Pack',
  })
  name: string;

  @ApiProperty({
    description: 'Addon slug',
    example: 'extra-messages',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Addon description',
    example: 'Add 500 extra messages to your monthly quota',
  })
  description?: string;

  @ApiProperty({
    description: 'Addon type',
    enum: ['message_pack', 'staff_seat', 'product_pack', 'posts_pack'],
    example: 'message_pack',
  })
  addon_type: string;

  @ApiProperty({
    description: 'Price in cents',
    example: 999,
  })
  price: number;

  @ApiProperty({
    description: 'Billing cycle (one_time, monthly, yearly)',
    example: 'monthly',
  })
  billing_cycle: string;

  @ApiProperty({
    description: 'Quantity provided by this addon',
    example: 500,
  })
  provides_quantity: number;

  @ApiPropertyOptional({
    description: 'Plans this addon is available for',
    type: [String],
    example: ['basic', 'pro'],
  })
  available_for_plans?: string[];

  @ApiProperty({
    description: 'Display order for listing',
    example: 1,
  })
  display_order: number;
}

/**
 * DTO for user's purchased addon.
 */
export class UserAddonResponseDto {
  @ApiProperty({
    description: 'User addon ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Addon details',
    type: AddonResponseDto,
  })
  addon: AddonResponseDto;

  @ApiProperty({
    description: 'Purchased quantity',
    example: 2,
  })
  quantity: number;

  @ApiProperty({
    description: 'Addon status',
    enum: ['active', 'cancelled', 'expired'],
    example: 'active',
  })
  status: string;

  @ApiProperty({
    description: 'Purchase date',
    example: '2024-01-01T00:00:00.000Z',
  })
  purchased_at: Date;

  @ApiPropertyOptional({
    description: 'Expiration date (for time-limited addons)',
    example: '2024-02-01T00:00:00.000Z',
  })
  expires_at?: Date;
}

// ==================== Usage Response DTOs ====================

/**
 * DTO for usage statistics.
 */
export class UsageStatsResponseDto {
  @ApiProperty({
    description: 'Current plan details',
    type: PlanResponseDto,
  })
  plan: PlanResponseDto;

  @ApiProperty({
    description: 'Products usage (current/limit)',
    example: { current: 25, limit: 100, unlimited: false },
  })
  products: {
    current: number;
    limit: number | null;
    unlimited: boolean;
  };

  @ApiProperty({
    description: 'Posts usage this month (current/limit)',
    example: { current: 10, limit: 50, unlimited: false },
  })
  posts: {
    current: number;
    limit: number | null;
    unlimited: boolean;
  };

  @ApiProperty({
    description: 'Messages usage this month (current/limit)',
    example: { current: 150, limit: 500, unlimited: false },
  })
  messages: {
    current: number;
    limit: number | null;
    unlimited: boolean;
  };

  @ApiProperty({
    description: 'Staff users (current/limit)',
    example: { current: 2, limit: 3 },
  })
  staff: {
    current: number;
    limit: number;
  };
}

/**
 * Response for addon cancellation.
 */
export class AddonCancelResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Addon cancelled successfully',
  })
  message: string;
}
