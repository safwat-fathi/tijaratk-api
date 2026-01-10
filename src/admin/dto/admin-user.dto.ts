import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from 'src/users/entities/user.entity';

/**
 * DTO for a single user in admin responses.
 */
export class AdminUserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'User phone number (primary identifier)',
    example: '+966501234567',
  })
  phone: string;

  @ApiPropertyOptional({
    description: 'User email address',
    example: 'user@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'User display name',
    example: 'John Doe',
  })
  name?: string;

  @ApiProperty({
    description: 'User account status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ApiPropertyOptional({
    description: 'When the phone number was verified via OTP',
    example: '2024-01-15T10:30:00.000Z',
  })
  phone_verified_at?: Date;

  @ApiProperty({
    description: 'When the user account was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'When the user account was last updated',
    example: '2024-01-10T12:00:00.000Z',
  })
  updated_at: Date;
}

/**
 * Pagination meta information for admin user list.
 */
export class AdminUserListMetaDto {
  @ApiProperty({
    description: 'Total number of users',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Last page number',
    example: 15,
  })
  last_page: number;
}

/**
 * Response DTO for paginated user list in admin panel.
 */
export class AdminUserListResponseDto {
  @ApiProperty({
    description: 'List of users',
    type: [AdminUserResponseDto],
  })
  data: AdminUserResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: AdminUserListMetaDto,
  })
  meta: AdminUserListMetaDto;
}

/**
 * Response DTO for toggle user active status.
 */
export class AdminToggleUserStatusResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'User phone number',
    example: '+966501234567',
  })
  phone: string;

  @ApiPropertyOptional({
    description: 'User email address',
    example: 'user@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'User display name',
    example: 'John Doe',
  })
  name?: string;

  @ApiProperty({
    description: 'Updated user account status',
    enum: UserStatus,
    example: UserStatus.BLOCKED,
  })
  status: UserStatus;

  @ApiPropertyOptional({
    description: 'When the phone number was verified via OTP',
    example: '2024-01-15T10:30:00.000Z',
  })
  phone_verified_at?: Date;

  @ApiProperty({
    description: 'When the user account was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'When the user account was last updated',
    example: '2024-01-10T12:00:00.000Z',
  })
  updated_at: Date;
}
