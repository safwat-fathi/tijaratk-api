import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SortOrder } from 'src/common/enums/sort.enums';

import { OrderStatus } from '../entities/order.entity';

export class ListOrdersDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by order status',
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Filter by buyer name (partial match)',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  buyer_name?: string;

  @ApiPropertyOptional({
    description: 'Filter by buyer phone (partial match)',
    example: '+201234567890',
  })
  @IsOptional()
  @IsString()
  buyer_phone?: string;

  @ApiPropertyOptional({
    description: 'Filter by buyer email (partial match)',
    example: 'john@example.com',
  })
  @IsOptional()
  @IsString()
  buyer_email?: string;

  @ApiPropertyOptional({
    description: 'Filter orders created at or after this ISO date',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  created_from?: Date;

  @ApiPropertyOptional({
    description: 'Filter orders created at or before this ISO date',
    example: '2025-01-31T23:59:59.999Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  created_to?: Date;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'created_at',
    enum: ['created_at', 'total_amount'],
  })
  @IsOptional()
  @IsString()
  sort_by?: 'created_at' | 'total_amount';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sort_order?: SortOrder;
}

