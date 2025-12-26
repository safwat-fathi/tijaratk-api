import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateOrderNotesDto {
  @ApiProperty({
    description: 'Internal notes for the order',
    example: 'Customer requested special packaging',
  })
  @IsString()
  internal_notes: string;
}
