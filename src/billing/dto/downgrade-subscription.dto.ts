import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DowngradeSubscriptionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  planId: number;
}
