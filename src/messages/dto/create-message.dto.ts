import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'The ID of the customer who sent the message',
    example: 1,
    required: true,
  })
  @IsNumber()
  customerId: number;

  @ApiProperty({
    description: 'The ID of the product the message is related to',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiProperty({
    description: 'Facebook’s internal message ID',
    example: 't_122182213772168545',
    required: true,
  })
  @IsOptional()
  @IsString()
  facebookMessageId: string;

  @ApiProperty({
    description: 'Link to the message on Facebook',
    example: 'https://www.facebook.com/messages/t/12345',
    required: false,
  })
  @IsOptional()
  @IsString()
  facebookMessageLink?: string;

  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello, I have a question about product X...',
    required: true,
  })
  @IsString()
  text: string;
}
