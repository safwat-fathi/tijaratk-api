import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CheckSlugDto {
  @ApiProperty({
    description: 'Slug to check for availability',
    example: 'my-awesome-store',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    description: 'Existing storefront ID to exclude (for edits)',
    required: false,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  excludeId?: number;
}
