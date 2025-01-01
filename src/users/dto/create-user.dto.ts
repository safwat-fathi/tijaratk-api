
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';



export class CreateUserDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Facebook User ID',
    example: 'fb_123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  facebookUserId?: string;


}
