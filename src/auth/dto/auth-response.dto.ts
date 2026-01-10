import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from 'src/users/entities/user.entity';

// ==================== User Response DTOs ====================

/**
 * Basic user information returned in auth responses.
 */
export class AuthUserResponseDto {
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
    example: 'محمد أحمد',
  })
  name?: string;

  @ApiProperty({
    description: 'User account status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ApiPropertyOptional({
    description: "User's active subscription with plan details",
    example: {
      id: 1,
      plan_id: 1,
      started_at: '2024-01-01T00:00:00.000Z',
      expires_at: '2024-12-31T23:59:59.000Z',
      plan: {
        id: 1,
        name: 'Basic',
        price: 99,
      },
    },
  })
  subscription?: Record<string, any>;
}

// ==================== Token Response DTOs ====================

/**
 * JWT tokens response.
 */
export class TokensResponseDto {
  @ApiProperty({
    description: 'JWT access token for API authorization',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInBob25lIjoiKzk2NjUwMTIzNDU2NyIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImdsb2JhbF9yb2xlcyI6WyJtZXJjaGFudCJdLCJzdG9yZV9yb2xlcyI6e30sImlhdCI6MTcwNDExOTYwMCwiZXhwIjoxNzA0MjA2MDAwfQ.example_signature',
  })
  access_token: string;

  @ApiProperty({
    description: 'JWT refresh token for obtaining new access tokens',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInBob25lIjoiKzk2NjUwMTIzNDU2NyIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImdsb2JhbF9yb2xlcyI6WyJtZXJjaGFudCJdLCJzdG9yZV9yb2xlcyI6e30sImlhdCI6MTcwNDExOTYwMCwiZXhwIjoxNzA0NzI0NDAwfQ.example_signature',
  })
  refresh_token: string;
}

// ==================== Admin Auth Response DTOs ====================

/**
 * Response for admin signup.
 */
export class AdminSignupResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Admin created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Created user ID',
    example: 1,
  })
  userId: number;
}

/**
 * Response for admin login.
 */
export class AdminLoginResponseDto extends TokensResponseDto {
  @ApiProperty({
    description: 'Logged in user details',
    type: AuthUserResponseDto,
  })
  user: AuthUserResponseDto;
}

// ==================== OTP Auth Response DTOs ====================

/**
 * Response for OTP request.
 */
export class RequestOtpResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'OTP sent successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Phone number OTP was sent to',
    example: '+966501234567',
  })
  phone: string;
}

/**
 * Response for OTP verification (login/signup).
 */
export class VerifyOtpResponseDto extends TokensResponseDto {
  @ApiProperty({
    description: 'Authenticated user details',
    type: AuthUserResponseDto,
  })
  user: AuthUserResponseDto;

  @ApiProperty({
    description: 'Whether this is a new user (first time login)',
    example: false,
  })
  isNewUser: boolean;
}

// ==================== Merchant Profile Response DTOs ====================

/**
 * Response for merchant profile creation.
 */
export class MerchantProfileResponseDto {
  @ApiProperty({
    description: 'User ID (also serves as merchant profile ID)',
    example: 1,
  })
  user_id: number;

  @ApiProperty({
    description: 'Merchant onboarding status',
    example: 'signup',
  })
  onboarding_status: string;

  @ApiPropertyOptional({
    description: 'Primary store ID',
    example: 1,
  })
  primary_store_id?: number;

  @ApiProperty({
    description: 'When the merchant profile was created',
    example: '2024-01-15T10:30:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'When the merchant profile was last updated',
    example: '2024-01-15T10:30:00.000Z',
  })
  updated_at: Date;
}

// ==================== Token Refresh Response DTOs ====================

/**
 * Response for token refresh.
 */
export class RefreshTokenResponseDto extends TokensResponseDto {
  @ApiProperty({
    description: 'User details',
    type: AuthUserResponseDto,
  })
  user: AuthUserResponseDto;
}
