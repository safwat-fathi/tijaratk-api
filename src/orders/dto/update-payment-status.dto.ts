import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PaymentStatus } from '../entities/order.entity';

export class UpdatePaymentStatusDto {
  @ApiProperty({
    description: 'The payment status of the order',
    enum: PaymentStatus,
  })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;
}
