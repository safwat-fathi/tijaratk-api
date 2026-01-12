import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsPhoneNumberIntl } from 'src/common/validators/is-phone-number.validator';

// ==================== Admin Auth DTOs ====================

/**
 * Admin signup - email + password (manual creation only)
 */
export class AdminSignupDto {
  @ApiProperty({
    description: 'Admin phone number in international format (E.164)',
    example: '+201234567890',
  })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumberIntl({ allowedCountries: ['SA', 'EG'] })
  phone: string;

  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@tijaratk.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Admin password (minimum 8 characters)',
    example: 'SecureP@ss123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    description: 'Admin display name',
    example: 'Safwat',
  })
  @IsString()
  @IsOptional()
  name?: string;
}

/**
 * Admin login - email + password
 */
export class AdminLoginDto {
  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@tijaratk.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Admin password',
    example: 'SecureP@ss123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

// ==================== Merchant Auth DTOs (OTP-based) ====================

/**
 * Request OTP for merchant login/signup (login == signup)
 */
export class RequestOtpDto {
  @ApiProperty({
    description: 'Admin phone number in international format (E.164)',
    example: '+201234567890',
  })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumberIntl({ allowedCountries: ['SA', 'EG'] })
  phone: string;
}

/**
 * Verify OTP and complete login/signup
 */
export class VerifyOtpDto {
  @ApiProperty({
    description: 'Admin phone number in international format (E.164)',
    example: '+201234567890',
  })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumberIntl({ allowedCountries: ['SA', 'EG'] })
  phone: string;

  @ApiProperty({
    description: 'OTP code received via SMS/WhatsApp',
    example: '123456',
    minLength: 4,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  otp: string;
}

/**
 * Complete merchant profile after first OTP verification
 */
export class CompleteMerchantProfileDto {
  @ApiProperty({
    description: 'Store/Business name',
    example: 'متجر محمد للأزياء',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Merchant email address for notifications',
    example: 'merchant@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;
}

// ==================== Token DTOs ====================

/**
 * Refresh token request
 */
export class RefreshDto {
  @ApiProperty({
    description: 'JWT refresh token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInBob25lIjoiKzk2NjUwMTIzNDU2NyIsImlhdCI6MTcwNDExOTYwMCwiZXhwIjoxNzA0NzI0NDAwfQ.example_signature',
  })
  @IsNotEmpty()
  refresh_token: string;
}

// ==================== Legacy DTOs (kept for admin) ====================

/**
 * @deprecated Use AdminSignupDto instead
 */
export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

/**
 * @deprecated Use AdminLoginDto instead
 */
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class SetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
