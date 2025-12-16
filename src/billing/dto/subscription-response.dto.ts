import { ApiProperty } from '@nestjs/swagger';
import { PlanResponseDto } from './plan-response.dto';

export class SubscriptionResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  current_period_start: Date;

  @ApiProperty()
  current_period_end: Date;

  @ApiProperty()
  cancel_at_period_end: boolean;

  @ApiProperty()
  plan: PlanResponseDto;

  @ApiProperty({ nullable: true })
  next_billing_date: Date;
}
