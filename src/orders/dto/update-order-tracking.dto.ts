import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateOrderTrackingDto {
  @ApiPropertyOptional({
    description: 'Tracking number for the shipment',
    example: 'TRACK123456',
  })
  @IsOptional()
  @IsString()
  tracking_number?: string;
}
