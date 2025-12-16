import { ApiProperty } from '@nestjs/swagger';

import { AddonType } from '../entities/addon.entity';

export class AddonResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: AddonType })
  addon_type: AddonType;

  @ApiProperty()
  price: number;

  @ApiProperty()
  billing_cycle: string;

  @ApiProperty()
  provides_quantity: number;
}
