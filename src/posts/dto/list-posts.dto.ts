import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export enum SortOrder {
  NEWEST = 'newest',
  OLDEST = 'oldest',
}

export class ListPostsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search term to match against post title or content',
    example: 'Product launch',
  })
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({
    description: 'Sort order for posts',
    enum: SortOrder,
    example: SortOrder.NEWEST,
  })
  @IsEnum(SortOrder)
  @IsOptional()
  sortBy?: SortOrder = SortOrder.NEWEST;
}
