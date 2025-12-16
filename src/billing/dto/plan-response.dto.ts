import { ApiProperty } from '@nestjs/swagger';

export class PlanResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  billing_cycle: string;

  @ApiProperty({ nullable: true })
  max_products: number;

  @ApiProperty({ nullable: true })
  max_posts_per_month: number;

  @ApiProperty({ nullable: true })
  max_messages_per_month: number;

  @ApiProperty()
  max_staff_users: number;

  @ApiProperty()
  has_custom_domain: boolean;

  @ApiProperty()
  has_theme_access: boolean;

  @ApiProperty()
  branding_removed: boolean;

  @ApiProperty()
  available_themes_count: number;

  @ApiProperty()
  available_color_palettes: number;
}
