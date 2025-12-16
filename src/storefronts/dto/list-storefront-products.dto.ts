import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class ListStorefrontProductsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search term to match against product name',
    example: 'T-shirt',
  })
  @IsOptional()
  keyword?: string;
}
