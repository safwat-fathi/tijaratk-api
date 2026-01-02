import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import CONSTANTS from 'src/common/constants';

import { AuthService } from './auth.service';
import {
  LoginDto,
  RefreshDto,
  SetPasswordDto,
  SignupDto,
} from './dto/auth.dto';

// import { CsrfGuard } from 'src/common/guards/csrf.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  @ApiOperation({ summary: 'Sign up new user' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'Return access and refresh tokens.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

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

  @Post('/set-password')
  @ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set or update user password' })
  @ApiBody({ type: SetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async setPassword(@Req() req, @Body() body: SetPasswordDto) {
    // req.user is from JWT strategy which returns { id, email }
    return this.authService.setPassword(req.user.id, body.password);
  }

  // // logout
  // @ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
  // @UseGuards(AuthGuard('jwt'))
  // @Get('/logout')
  // @HttpCode(204)
  // @ApiOperation({ summary: 'Logout user and revoke refresh token' })
  // @ApiResponse({ status: 204, description: 'Return no content response.' })
  // @ApiResponse({ status: 404, description: 'Not logged in user' })
  // @ApiResponse({ status: 400, description: 'Bad request.' })
  // async logout(@Req() req: Request) {
  //   const { facebookId } = req.user;

  //   await this.authService.logout(facebookId);
  // }

  // @ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
  // @UseGuards(AuthGuard('jwt'))
  // @Post('/refresh')
  // @HttpCode(200)
  // @ApiOperation({ summary: 'Refresh token' })
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       refresh_token: { type: 'string' },
  //     },
  //     required: ['refresh_token'],
  //   },
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Return the new access token and refresh token.',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       access_token: { type: 'string' },
  //       refresh_token: { type: 'string' },
  //     },
  //   },
  // })
  // @ApiResponse({ status: 400, description: 'Invalid refresh token.' })
  // @ApiResponse({ status: 404, description: 'Business not logged in.' })
  // async refresh(@Body() body: { refresh_token: string }, @Req() req: Request) {
  //   const { facebookId } = req.user;

  //   return this.authService.refresh(facebookId, body.refresh_token);
  // }

  // logout
  @ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @Get('/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request) {
    const userId = Number(req.user.id);

    await this.authService.logout(userId);
  }

  // Initiate Facebook Authentication
  @ApiExcludeEndpoint()
  @Get('facebook')
  @UseGuards(AuthGuard(CONSTANTS.AUTH.FACEBOOK))
  async facebookLogin() {}

  // Facebook Callback URL
  @ApiExcludeEndpoint()
  @Get('facebook/callback')
  @UseGuards(AuthGuard(CONSTANTS.AUTH.FACEBOOK))
  @HttpCode(HttpStatus.FOUND)
  async facebookLoginCallback(@Req() req, @Res() res) {
    // Successful authentication here
    const user = req.user;

    // Check if this is a link request (state contains userId)
    const state = req.query.state;
    if (state) {
      try {
        const parsed = JSON.parse(Buffer.from(state, 'base64').toString());
        if (parsed.linkUserId) {
          // This is a linking flow, not a login flow
          try {
            const linkedUser = await this.authService.linkFacebookAccount(
              parsed.linkUserId,
              {
                facebookId: user.facebookId,
                accessToken: user.accessToken,
              },
            );

            // Get fresh tokens for the linked user
            const tokens = await this.authService.createJwtForUser(linkedUser);

            // Get long-lived token for the newly linked page immediately
            await this.authService['facebookService'].getLongLivedAccessToken(
              linkedUser.id,
              user.facebookId,
            );

            // Fetch pages after linking
            await this.authService['facebookService'].getUserPages(
              linkedUser.id,
            );

            return res.redirect(
              `${process.env.CLIENT_URL}/profile?success=facebook_linked`,
            );
          } catch (linkError) {
            // Handle linking errors specifically (e.g. "already linked")
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

  // Link Facebook account for authenticated users
  @Get('facebook/link')
  @ApiOperation({
    summary: 'Initiate Facebook account linking for authenticated user',
  })
  @ApiResponse({ status: 302, description: 'Redirects to Facebook OAuth' })
  async linkFacebook(@Req() req, @Res() res) {
    // Get token from query parameter (since browser redirects can't send headers)
    const token = req.query.token;
    if (!token) {
      return res.redirect(
        `${process.env.CLIENT_URL}/profile?error=missing_token`,
      );
    }

    // Manually verify the JWT
    let payload;
    try {
      payload = await this.authService['jwtService'].verifyAsync(token);
    } catch (e) {
      return res.redirect(
        `${process.env.CLIENT_URL}/profile?error=invalid_token`,
      );
    }

    const userId = payload.sub;

    // Encode user ID in state parameter to preserve through OAuth redirect
    const state = Buffer.from(JSON.stringify({ linkUserId: userId })).toString(
      'base64',
    );

    // Redirect to Facebook OAuth with state parameter
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
}
