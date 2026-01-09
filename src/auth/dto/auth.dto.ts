import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== Admin Auth DTOs ====================

/**
 * Admin signup - email + password (manual creation only)
 */
export class AdminSignupDto {
  @ApiProperty({ example: 'admin@tijaratk.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securepassword123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: 'Admin' })
  @IsString()
  @IsOptional()
  name?: string;
}

/**
 * Admin login - email + password
 */
export class AdminLoginDto {
  @ApiProperty({ example: 'admin@tijaratk.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securepassword123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

// ==================== Merchant Auth DTOs (OTP-based) ====================

/**
 * Request OTP for merchant login/signup (login == signup)
 */
export class RequestOtpDto {
  @ApiProperty({ example: '+201234567890' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  phone: string;
}

/**
 * Verify OTP and complete login/signup
 */
export class VerifyOtpDto {
  @ApiProperty({ example: '+201234567890' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  otp: string;
}

/**
 * Complete merchant profile after first OTP verification
 */
export class CompleteMerchantProfileDto {
  @ApiProperty({ example: 'Mohamed Store' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'mohamed@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;
}

// ==================== Token DTOs ====================

/**
 * Refresh token request
 */
export class RefreshDto {
  @ApiProperty()
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
