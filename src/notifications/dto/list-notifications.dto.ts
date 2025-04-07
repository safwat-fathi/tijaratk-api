import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { NotificationSortBy, SortOrder } from 'src/common/enums/sort.enums';

enum Classifications {
  INQUIRY = 'inquiry',
  COMPLAINT = 'complaint',
  PRODUCT_ORDER = 'product order',
  SHIPPING_DELIVERY_INQUIRY = 'shipping / delivery inquiry',
  RETURN_REFUND_REQUEST = 'return / refund request',
  ACCOUNT_MANAGEMENT = 'account management',
  PAYMENT_ISSUE = 'payment issue',
}

export class ListNotificationsDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: NotificationSortBy,
    description: 'Field to sort notifications by',
    example: NotificationSortBy.CREATED_AT,
    default: NotificationSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(NotificationSortBy)
  sort_by?: NotificationSortBy = NotificationSortBy.CREATED_AT;

  @ApiPropertyOptional({
    enum: SortOrder,
    description: 'Order to sort notifications (Ascending or Descending)',
    example: SortOrder.DESC,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sort_order?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    description: 'Filter notifications by classification',
    example: 'product order', // Use one of your classification examples
  })
  @IsOptional()
  @IsEnum(Classifications)
  classification?: string;

  // @ApiPropertyOptional({
  //   description: 'Search term to match against product name',
  //   example: 'Product 1',
  // })
  // @IsOptional()
  // keyword?: string;
}
