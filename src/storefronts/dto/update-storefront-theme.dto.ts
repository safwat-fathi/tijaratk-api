import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { StorefrontThemeConfig } from '../types/theme-config';

export class UpdateStorefrontThemeDto {
  @ApiProperty({
    description: 'Updated theme configuration for the storefront editor.',
    type: Object,
    required: true,
  })
  @IsOptional()
  theme?: StorefrontThemeConfig;
}
