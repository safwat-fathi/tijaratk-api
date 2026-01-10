import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { NotificationSortBy, SortOrder } from 'src/common/enums/sort.enums';

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
}
