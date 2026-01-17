import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { StoreThemeConfig } from '../types/theme-config';

export class UpdateStoreThemeDto {
  @ApiProperty({
    description: 'Updated theme configuration for the store editor.',
    type: Object,
    required: true,
  })
  @IsOptional()
  theme?: StoreThemeConfig;
}
