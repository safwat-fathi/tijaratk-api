import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for dashboard counter statistics.
 */
export class StoreStatsResponseDto {
  @ApiProperty({
    description: 'Total storefront page visits',
    example: 1250,
  })
  store_visits: number;

  @ApiProperty({
    description: 'Total number of orders (all statuses)',
    example: 45,
  })
  total_orders: number;

  @ApiProperty({
    description: 'Orders with pending status (awaiting confirmation)',
    example: 5,
  })
  new_orders: number;

  @ApiProperty({
    description: 'Orders that are not completed or cancelled',
    example: 12,
  })
  incomplete_orders: number;

  @ApiProperty({
    description: 'Total sales amount from completed orders',
    example: 2500.0,
  })
  total_sales: number;

  @ApiProperty({
    description: 'Total count of active products',
    example: 28,
  })
  products_count: number;
}
