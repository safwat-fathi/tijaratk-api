import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpgradeSubscriptionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  planId: number;
}
