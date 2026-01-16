import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import CONSTANTS from 'src/common/constants';

import { AuthService } from './auth.service';
import {
  AdminLoginDto,
  AdminSignupDto,
  MerchantLoginDto,
  MerchantSignupDto,
  RefreshDto,
  RequestOtpDto,
  VerifyOtpDto,
} from './dto/auth.dto';
import {
  AdminLoginResponseDto,
  AdminSignupResponseDto,
  MerchantProfileResponseDto,
  RefreshTokenResponseDto,
  RequestOtpResponseDto,
  VerifyOtpResponseDto,
} from './dto/auth-response.dto';
import { AuthenticatedUser } from './strategies/jwt.strategy';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==================== Admin Auth (Email + Password) ====================

  @Post('/admin/signup')
  @ApiOperation({
    summary: 'Admin signup (email + password)',
    description:
      'Creates a new admin user with email and password. The admin will be assigned the admin role and given an admin profile.',
  })
  @ApiBody({ type: AdminSignupDto })
  @ApiCreatedResponse({
    description: 'Admin created successfully',
    type: AdminSignupResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request - User with this email already exists',
  })
  async adminSignup(
    @Body() dto: AdminSignupDto,
  ): Promise<AdminSignupResponseDto> {
    return this.authService.signupAdmin(dto);
  }

  @Post('/admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin login (email + password)',
    description:
      'Authenticates an admin user with email and password. Returns JWT access and refresh tokens.',
  })
  @ApiBody({ type: AdminLoginDto })
  @ApiOkResponse({
    description:
      'Successfully authenticated - returns access and refresh tokens with user details',
    type: AdminLoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials or account not active',
  })
  async adminLogin(@Body() dto: AdminLoginDto): Promise<AdminLoginResponseDto> {
    return this.authService.loginAdmin(dto);
  }

  // ==================== Merchant/Customer Auth (OTP) ====================

  // ==================== Merchant Auth (Password) ====================

  @Post('/merchant/signup')
  @ApiOperation({
    summary: 'Merchant signup (password-based)',
    description:
      'Creates a new merchant account with email, phone, and password.',
  })
  @ApiBody({ type: MerchantSignupDto })
  @ApiCreatedResponse({
    description: 'Merchant created successfully',
    type: AdminLoginResponseDto, // Reusing AdminLoginResponseDto as it has same structure (tokens + user)
  })
  @ApiBadRequestResponse({
    description: 'User with this phone or email already exists',
  })
  async merchantSignup(@Body() dto: MerchantSignupDto) {
    return this.authService.signupMerchant(dto);
  }

  @Post('/merchant/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Merchant login (password-based)',
    description: 'Authenticates a merchant with phone and password.',
  })
  @ApiBody({ type: MerchantLoginDto })
  @ApiOkResponse({
    description: 'Successfully authenticated',
    type: AdminLoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  async merchantLogin(@Body() dto: MerchantLoginDto) {
    return this.authService.loginMerchant(dto);
  }

  // ==================== Merchant/Customer Auth (OTP - Legacy) ====================

  @Post('/otp/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request OTP for phone-based login/signup',
    description:
      'Sends an OTP to the specified phone number via SMS/WhatsApp. For merchants, login equals signup - new users are created automatically upon OTP verification.',
  })
  @ApiBody({ type: RequestOtpDto })
  @ApiOkResponse({
    description: 'OTP sent successfully',
    type: RequestOtpResponseDto,
  })
  async requestOtp(@Body() dto: RequestOtpDto): Promise<RequestOtpResponseDto> {
    return this.authService.requestOtp(dto);
  }

  @Post('/otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP and complete login/signup',
    description:
      'Verifies the OTP code and completes authentication. Creates a new user if the phone number is not registered. Returns JWT tokens and user details.',
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiOkResponse({
    description:
      'Successfully verified - returns access and refresh tokens with user details',
    type: VerifyOtpResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid OTP code',
  })
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
    return this.authService.verifyOtp(dto);
  }

  @Post('/merchant/profile')
  @ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create merchant profile for authenticated user',
    description:
      'Creates a merchant profile for the currently authenticated user. If a profile already exists, returns the existing profile.',
  })
  @ApiCreatedResponse({
    description: 'Merchant profile created or returned if already exists',
    type: MerchantProfileResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid JWT required',
  })
  async createMerchantProfile(
    @Req() req: Request,
  ): Promise<MerchantProfileResponseDto> {
    const user = req.user as unknown as AuthenticatedUser;
    return this.authService.createMerchantProfile(user.id);
  }

  // ==================== Token Management ====================

  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Exchanges a valid refresh token for new access and refresh tokens. The old refresh token is invalidated.',
  })
  @ApiBody({ type: RefreshDto })
  @ApiOkResponse({
    description:
      'Successfully refreshed - returns new access and refresh tokens',
    type: RefreshTokenResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired refresh token',
  })
  async refresh(@Body() body: RefreshDto): Promise<RefreshTokenResponseDto> {
    return this.authService.refresh(body.refresh_token);
  }

  @Get('/logout')
  @ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Logout user and revoke refresh token',
    description:
      'Logs out the current user by deleting their session and revoking the refresh token.',
  })
  @ApiNoContentResponse({
    description: 'Successfully logged out',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid JWT required',
  })
  async logout(@Req() req: Request): Promise<void> {
    const user = req.user as unknown as AuthenticatedUser;
    await this.authService.logout(user.id);
  }

  // ==================== Facebook OAuth (Disabled) ====================
  // Note: Facebook login is disabled but code is kept for future use
  // Uncomment these endpoints when Facebook OAuth is needed

  /*
  @ApiExcludeEndpoint()
  @Get('facebook')
  @UseGuards(AuthGuard(CONSTANTS.AUTH.FACEBOOK))
  async facebookLogin() {}

  @ApiExcludeEndpoint()
  @Get('facebook/callback')
  @UseGuards(AuthGuard(CONSTANTS.AUTH.FACEBOOK))
  @HttpCode(HttpStatus.FOUND)
  async facebookLoginCallback(@Req() req, @Res() res) {
    const user = req.user;

    const state = req.query.state;
    if (state) {
      try {
        const parsed = JSON.parse(Buffer.from(state, 'base64').toString());
        if (parsed.linkUserId) {
          try {
            const linkedUser = await this.authService.linkFacebookAccount(
              parsed.linkUserId,
              {
                facebookId: user.facebookId,
                accessToken: user.accessToken,
              },
            );

            const tokens = await this.authService.createJwtForUser(linkedUser);

            await this.authService['facebookService'].getLongLivedAccessToken(
              linkedUser.id,
              user.facebookId,
            );

            await this.authService['facebookService'].getUserPages(
              linkedUser.id,
            );

            return res.redirect(
              `${process.env.CLIENT_URL}/profile?success=facebook_linked`,
            );
          } catch (linkError) {
            return res.redirect(
              `${process.env.CLIENT_URL}/profile?error=${encodeURIComponent(linkError.message)}`,
            );
          }
        }
      } catch (e) {
        // State parsing failed, continue with normal login flow
      }
    }

    const tokens = await this.authService.afterLogin(user);

    return res.redirect(
      `${process.env.CLIENT_URL}/auth/facebook?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`,
    );
  }

  @Get('facebook/link')
  @ApiOperation({
    summary: 'Initiate Facebook account linking for authenticated user',
  })
  @ApiResponse({ status: 302, description: 'Redirects to Facebook OAuth' })
  async linkFacebook(@Req() req, @Res() res) {
    const token = req.query.token;
    if (!token) {
      return res.redirect(
        `${process.env.CLIENT_URL}/profile?error=missing_token`,
      );
    }

    let payload;
    try {
      payload = await this.authService['jwtService'].verifyAsync(token);
    } catch (e) {
      return res.redirect(
        `${process.env.CLIENT_URL}/profile?error=invalid_token`,
      );
    }

    const userId = payload.sub;

    const state = Buffer.from(JSON.stringify({ linkUserId: userId })).toString(
      'base64',
    );

    const fbAuthUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    fbAuthUrl.searchParams.set('client_id', process.env.FACEBOOK_APP_ID);
    fbAuthUrl.searchParams.set(
      'redirect_uri',
      process.env.FACEBOOK_CALLBACK_URL,
    );
    fbAuthUrl.searchParams.set('state', state);
    fbAuthUrl.searchParams.set(
      'scope',
      'email,public_profile,pages_manage_engagement,pages_show_list,pages_read_engagement,pages_manage_posts,business_management,pages_read_user_content,pages_messaging',
    );

    return res.redirect(fbAuthUrl.toString());
  }
  */
}
