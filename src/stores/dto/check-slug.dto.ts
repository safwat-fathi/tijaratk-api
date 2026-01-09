import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CheckSlugDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Slug to check',
    example: 'my-store',
  })
  slug: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Exclude store ID from check (for updates)',
  })
  @IsOptional()
  excludeId?: number;
}
