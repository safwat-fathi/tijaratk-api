import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIP, IsOptional, IsString } from 'class-validator';

export class TrackVisitDto {
  @ApiPropertyOptional({
    description: 'User agent string of the visitor',
    example: 'Mozilla/5.0 ...',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'Referer URL',
    example: 'https://google.com',
  })
  @IsOptional()
  @IsString()
  referer?: string;

  @ApiPropertyOptional({
    description: 'Visitor IP address',
    example: '127.0.0.1',
  })
  @IsOptional()
  @IsIP()
  ip?: string;

  @ApiPropertyOptional({
    description: 'Visit source (e.g. direct, whatsapp)',
    example: 'whatsapp',
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    description: 'UTM Source parameter',
    example: 'facebook',
  })
  @IsOptional()
  @IsString()
  utmSource?: string;
}
