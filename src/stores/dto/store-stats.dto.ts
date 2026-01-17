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
    description: 'Total number of completed orders',
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

  @ApiProperty({
    description: 'Monthly orders overview for the last 6 months',
    type: () => [StoreStatsChartDataDto],
  })
  orders_overview: StoreStatsChartDataDto[];

  @ApiProperty({
    description: 'Quarterly performance metrics',
    type: () => [StoreStatsQuarterlyDto],
  })
  quarterly_performance: StoreStatsQuarterlyDto[];
}

export class StoreStatsChartDataDto {
  @ApiProperty({ description: 'Month name (e.g., Jan)', example: 'Jan' })
  name: string;

  @ApiProperty({ description: 'Total orders count', example: 150 })
  value: number;
}

export class StoreStatsQuarterlyDto {
  @ApiProperty({ description: 'Quarter name (e.g., Q1)', example: 'Q1' })
  name: string;

  @ApiProperty({ description: 'Completed orders count', example: 45 })
  completed: number;

  @ApiProperty({ description: 'Cancelled orders count', example: 5 })
  cancelled: number;
}
