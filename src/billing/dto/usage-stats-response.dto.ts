import { ApiProperty } from '@nestjs/swagger';

export class UsageStatsResponseDto {
  @ApiProperty()
  period_month: string;

  @ApiProperty()
  messages_received: number;

  @ApiProperty()
  messages_limit: number | null; // null for unlimited

  @ApiProperty()
  posts_created: number;

  @ApiProperty()
  posts_limit: number | null;

  @ApiProperty()
  products_count: number;

  @ApiProperty()
  products_limit: number | null;

  @ApiProperty()
  staff_count: number;

  @ApiProperty()
  staff_limit: number;

  @ApiProperty()
  days_until_reset: number;
}
