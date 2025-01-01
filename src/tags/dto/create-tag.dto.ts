import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({
    type: String,
    description: 'Tag name',
    example: 'Tag 1',
    required: true,
  })
  @IsString()
	@MaxLength(50, { message: 'Tag name must not exceed 50 characters' })
  name: string;
}
