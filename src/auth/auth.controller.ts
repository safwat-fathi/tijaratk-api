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
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import CONSTANTS from 'src/common/constants';

import { AuthService } from './auth.service';
import {
  AdminLoginDto,
  AdminSignupDto,
  RefreshDto,
  RequestOtpDto,
  VerifyOtpDto,
} from './dto/auth.dto';
import { AuthenticatedUser } from './strategies/jwt.strategy';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==================== Admin Auth (Email + Password) ====================

  @Post('/admin/signup')
  @ApiOperation({ summary: 'Admin signup (email + password)' })
  @ApiResponse({ status: 201, description: 'Admin created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async adminSignup(@Body() dto: AdminSignupDto) {
    return this.authService.signupAdmin(dto);
  }

  @Post('/admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login (email + password)' })
  @ApiResponse({
    status: 200,
    description: 'Return access and refresh tokens.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async adminLogin(@Body() dto: AdminLoginDto) {
    return this.authService.loginAdmin(dto);
  }

  // ==================== Merchant/Customer Auth (OTP) ====================

  @Post('/otp/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request OTP for phone-based login/signup' })
  @ApiBody({ type: RequestOtpDto })
  @ApiResponse({ status: 200, description: 'OTP sent successfully.' })
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto);
  }

  @Post('/otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and complete login/signup' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: 200,
    description: 'Return access and refresh tokens.',
  })
  @ApiResponse({ status: 400, description: 'Invalid OTP.' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('/merchant/profile')
  @ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create merchant profile for authenticated user' })
  @ApiResponse({ status: 201, description: 'Merchant profile created.' })
  async createMerchantProfile(@Req() req: Request) {
    const user = req.user as unknown as AuthenticatedUser;
    return this.authService.createMerchantProfile(user.id);
  }

  // ==================== Token Management ====================

  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({
    status: 200,
    description: 'Return new access and refresh tokens.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async refresh(@Body() body: RefreshDto) {
    return this.authService.refresh(body.refresh_token);
  }

  @Get('/logout')
  @ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout user and revoke refresh token' })
  @ApiResponse({ status: 204, description: 'Logged out successfully.' })
  async logout(@Req() req: Request) {
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
